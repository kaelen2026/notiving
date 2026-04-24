import AuthenticationServices
import Combine
import CryptoKit
import Foundation
import SwiftUI

@MainActor
final class OAuthManager: NSObject, ObservableObject, ASWebAuthenticationPresentationContextProviding {
    let objectWillChange = ObservableObjectPublisher()
    private var webAuthSession: ASWebAuthenticationSession?
    private var appleSignInContinuation: CheckedContinuation<ASAuthorization, Error>?

    private static let googleClientID = "171619038303-thlmmi0om9llg4ob97nujfp6uajl5nfs.apps.googleusercontent.com"
    private static let googleRedirectURI = "com.googleusercontent.apps.171619038303-thlmmi0om9llg4ob97nujfp6uajl5nfs:/oauth/callback"
    private static let googleCallbackScheme = "com.googleusercontent.apps.171619038303-thlmmi0om9llg4ob97nujfp6uajl5nfs"

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        presentationWindow
    }

    func signInWithGoogle() async throws -> (User, String) {
        let codeVerifier = generateCodeVerifier()
        let codeChallenge = generateCodeChallenge(from: codeVerifier)
        let state = UUID().uuidString

        var components = URLComponents(string: "https://accounts.google.com/o/oauth2/v2/auth")!
        components.queryItems = [
            URLQueryItem(name: "client_id", value: Self.googleClientID),
            URLQueryItem(name: "redirect_uri", value: Self.googleRedirectURI),
            URLQueryItem(name: "response_type", value: "code"),
            URLQueryItem(name: "scope", value: "openid email profile"),
            URLQueryItem(name: "code_challenge", value: codeChallenge),
            URLQueryItem(name: "code_challenge_method", value: "S256"),
            URLQueryItem(name: "state", value: state),
        ]

        let authURL = components.url!
        let callbackURL = try await openGoogleAuthSession(url: authURL)

        guard let cbComponents = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false),
              let returnedState = cbComponents.queryItems?.first(where: { $0.name == "state" })?.value,
              returnedState == state,
              let code = cbComponents.queryItems?.first(where: { $0.name == "code" })?.value else {
            throw OAuthError.missingToken
        }

        let accessToken = try await exchangeGoogleCode(code, codeVerifier: codeVerifier)

        let body = try JSONSerialization.data(withJSONObject: ["accessToken": accessToken])
        let result: LoginResponse = try await APIClient.shared.request(
            path: "/v1/auth/oauth/google/native-token",
            method: "POST",
            body: body,
            authenticated: false
        )

        SessionManager.shared.accessToken = result.accessToken
        SessionManager.shared.refreshToken = result.refreshToken
        SessionManager.shared.userId = result.user.id
        return (result.user, result.accessToken)
    }

    func signInWithApple() async throws -> (User, String) {
        let authorization = try await performAppleSignIn()
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let codeData = credential.authorizationCode,
              let code = String(data: codeData, encoding: .utf8) else {
            throw OAuthError.missingCredential
        }

        let firstName = credential.fullName?.givenName
        let lastName = credential.fullName?.familyName

        var bodyDict: [String: Any] = ["code": code]
        if firstName != nil || lastName != nil {
            var userDict: [String: String] = [:]
            if let firstName { userDict["firstName"] = firstName }
            if let lastName { userDict["lastName"] = lastName }
            bodyDict["user"] = userDict
        }

        let body = try JSONSerialization.data(withJSONObject: bodyDict)
        let result: LoginResponse = try await APIClient.shared.request(
            path: "/v1/auth/oauth/apple/token",
            method: "POST",
            body: body,
            authenticated: false
        )

        SessionManager.shared.accessToken = result.accessToken
        SessionManager.shared.refreshToken = result.refreshToken
        SessionManager.shared.userId = result.user.id
        return (result.user, result.accessToken)
    }

    // MARK: - Google helpers

    private func openGoogleAuthSession(url: URL) async throws -> URL {
        try await withCheckedThrowingContinuation { continuation in
            let session = ASWebAuthenticationSession(
                url: url,
                callbackURLScheme: Self.googleCallbackScheme
            ) { callbackURL, error in
                if let error {
                    continuation.resume(throwing: error)
                } else if let callbackURL {
                    continuation.resume(returning: callbackURL)
                } else {
                    continuation.resume(throwing: OAuthError.cancelled)
                }
            }
            session.presentationContextProvider = self
            session.prefersEphemeralWebBrowserSession = false
            self.webAuthSession = session
            session.start()
        }
    }

    private func exchangeGoogleCode(_ code: String, codeVerifier: String) async throws -> String {
        let tokenURL = URL(string: "https://oauth2.googleapis.com/token")!
        var request = URLRequest(url: tokenURL)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        let params = [
            "client_id": Self.googleClientID,
            "code": code,
            "code_verifier": codeVerifier,
            "grant_type": "authorization_code",
            "redirect_uri": Self.googleRedirectURI,
        ]
        request.httpBody = params
            .map { "\($0.key)=\($0.value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? $0.value)" }
            .joined(separator: "&")
            .data(using: .utf8)

        let (data, _) = try await URLSession.shared.data(for: request)
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        guard let accessToken = json?["access_token"] as? String else {
            throw OAuthError.missingToken
        }
        return accessToken
    }

    private func generateCodeVerifier() -> String {
        var bytes = [UInt8](repeating: 0, count: 32)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        return Data(bytes).base64URLEncodedString()
    }

    private func generateCodeChallenge(from verifier: String) -> String {
        let data = Data(verifier.utf8)
        let hash = SHA256.hash(data: data)
        return Data(hash).base64URLEncodedString()
    }

    // MARK: - Apple helpers

    private func performAppleSignIn() async throws -> ASAuthorization {
        try await withCheckedThrowingContinuation { continuation in
            self.appleSignInContinuation = continuation
            let provider = ASAuthorizationAppleIDProvider()
            let request = provider.createRequest()
            request.requestedScopes = [.fullName, .email]
            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = self
            controller.presentationContextProvider = self
            controller.performRequests()
        }
    }
}

// MARK: - ASAuthorizationControllerPresentationContextProviding

extension OAuthManager: ASAuthorizationControllerPresentationContextProviding {
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        presentationWindow
    }
}

// MARK: - ASAuthorizationControllerDelegate

extension OAuthManager: ASAuthorizationControllerDelegate {
    nonisolated func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        Task { @MainActor in
            appleSignInContinuation?.resume(returning: authorization)
            appleSignInContinuation = nil
        }
    }

    nonisolated func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        Task { @MainActor in
            appleSignInContinuation?.resume(throwing: error)
            appleSignInContinuation = nil
        }
    }
}

// MARK: - Helpers

private extension OAuthManager {
    var presentationWindow: ASPresentationAnchor {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first(where: { $0.isKeyWindow }) ?? ASPresentationAnchor()
    }
}

private extension Data {
    func base64URLEncodedString() -> String {
        base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}

// MARK: - Types

enum OAuthError: LocalizedError {
    case invalidURL
    case cancelled
    case missingToken
    case missingCredential

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid authorization URL"
        case .cancelled: return "Sign in was cancelled"
        case .missingToken: return "Missing access token in callback"
        case .missingCredential: return "Missing Apple credential"
        }
    }
}
