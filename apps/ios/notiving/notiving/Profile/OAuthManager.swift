import AuthenticationServices
import Combine
import Foundation
import SwiftUI

@MainActor
final class OAuthManager: NSObject, ObservableObject, ASWebAuthenticationPresentationContextProviding {
    let objectWillChange = ObservableObjectPublisher()
    private var webAuthSession: ASWebAuthenticationSession?
    private var appleSignInContinuation: CheckedContinuation<ASAuthorization, Error>?

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        presentationWindow
    }

    func signInWithGoogle() async throws -> (User, String) {
        let authURL = try await fetchAuthorizationURL(provider: "google")
        let callbackURL = try await openAuthSession(url: authURL)
        return try await handleCallback(callbackURL)
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

    private func fetchAuthorizationURL(provider: String) async throws -> URL {
        let response: OAuthInitiateResponse = try await APIClient.shared.request(
            path: "/v1/auth/oauth/\(provider)?redirect_uri=notiving://oauth/callback",
            authenticated: false
        )
        guard let url = URL(string: response.authorizationUrl) else {
            throw OAuthError.invalidURL
        }
        return url
    }

    private func openAuthSession(url: URL) async throws -> URL {
        try await withCheckedThrowingContinuation { continuation in
            let session = ASWebAuthenticationSession(
                url: url,
                callbackURLScheme: "notiving"
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

    private func handleCallback(_ url: URL) async throws -> (User, String) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let accessToken = components.queryItems?.first(where: { $0.name == "accessToken" })?.value else {
            throw OAuthError.missingToken
        }

        let refreshToken = components.queryItems?.first(where: { $0.name == "refreshToken" })?.value

        SessionManager.shared.accessToken = accessToken
        if let refreshToken {
            SessionManager.shared.refreshToken = refreshToken
        }

        let user: User = try await APIClient.shared.request(path: "/v1/auth/me")
        SessionManager.shared.userId = user.id
        return (user, accessToken)
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

private struct OAuthInitiateResponse: Decodable {
    let authorizationUrl: String
}
