import Combine
import Foundation

enum LoginMode: String, CaseIterable, Identifiable {
    case otp = "OTP"
    case password = "Password"

    var id: String { rawValue }
}

enum OTPStep {
    case email
    case code
}

@MainActor
final class LoginViewModel: ObservableObject {
    @Published var mode: LoginMode = .otp
    @Published var email = ""
    @Published var password = ""
    @Published var code: [String] = Array(repeating: "", count: 6)
    @Published var otpStep: OTPStep = .email
    @Published var isLoading = false
    @Published var error: String?
    @Published var countdown: Int = 0

    private var countdownTimer: Timer?

    var isFormValid: Bool {
        let trimmedEmail = email.trimmingCharacters(in: .whitespaces)
        guard !trimmedEmail.isEmpty, trimmedEmail.contains("@") else { return false }

        switch mode {
        case .password:
            return !password.isEmpty
        case .otp:
            switch otpStep {
            case .email:
                return true
            case .code:
                return code.allSatisfy { !$0.isEmpty }
            }
        }
    }

    var submitButtonTitle: String {
        switch mode {
        case .password:
            return "Log In"
        case .otp:
            return otpStep == .email ? "Send Code" : "Log In"
        }
    }

    func switchMode(_ newMode: LoginMode) {
        mode = newMode
        password = ""
        code = Array(repeating: "", count: 6)
        otpStep = .email
        error = nil
        stopCountdown()
    }

    // MARK: - Password Login

    func login() async -> (User, String)? {
        guard isFormValid else { return nil }
        isLoading = true
        error = nil

        do {
            let body = try JSONEncoder().encode(LoginRequest(
                email: email.trimmingCharacters(in: .whitespaces),
                password: password
            ))
            let result: LoginResponse = try await APIClient.shared.request(
                path: "/auth/login",
                method: "POST",
                body: body,
                authenticated: false
            )

            SessionManager.shared.accessToken = result.accessToken
            SessionManager.shared.userId = result.user.id

            isLoading = false
            return (result.user, result.accessToken)
        } catch let apiError as APIError {
            error = apiError.errorDescription
            isLoading = false
            return nil
        } catch {
            self.error = error.localizedDescription
            isLoading = false
            return nil
        }
    }

    // MARK: - OTP Send Code

    func sendCode() async -> Bool {
        let trimmedEmail = email.trimmingCharacters(in: .whitespaces)
        guard !trimmedEmail.isEmpty else { return false }
        isLoading = true
        error = nil

        do {
            let body = try JSONEncoder().encode(SendCodeRequest(email: trimmedEmail))
            let _: SendCodeResponse = try await APIClient.shared.request(
                path: "/auth/email/send-code",
                method: "POST",
                body: body,
                authenticated: false
            )

            otpStep = .code
            startCountdown()
            isLoading = false
            return true
        } catch let apiError as APIError {
            error = apiError.errorDescription
            isLoading = false
            return false
        } catch {
            self.error = error.localizedDescription
            isLoading = false
            return false
        }
    }

    // MARK: - OTP Verify Code

    func verifyCode() async -> (User, String)? {
        let codeString = code.joined()
        guard codeString.count == 6 else { return nil }
        isLoading = true
        error = nil

        do {
            let body = try JSONEncoder().encode(VerifyCodeRequest(
                email: email.trimmingCharacters(in: .whitespaces),
                code: codeString
            ))
            let result: LoginResponse = try await APIClient.shared.request(
                path: "/auth/email/verify-code",
                method: "POST",
                body: body,
                authenticated: false
            )

            SessionManager.shared.accessToken = result.accessToken
            SessionManager.shared.userId = result.user.id

            isLoading = false
            return (result.user, result.accessToken)
        } catch let apiError as APIError {
            error = apiError.errorDescription
            isLoading = false
            return nil
        } catch {
            self.error = error.localizedDescription
            isLoading = false
            return nil
        }
    }

    // MARK: - OTP helpers

    func changeEmail() {
        otpStep = .email
        code = Array(repeating: "", count: 6)
        error = nil
    }

    // MARK: - Countdown

    private func startCountdown() {
        countdown = 60
        countdownTimer?.invalidate()
        countdownTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] timer in
            Task { @MainActor in
                guard let self else {
                    timer.invalidate()
                    return
                }
                self.countdown -= 1
                if self.countdown <= 0 {
                    timer.invalidate()
                }
            }
        }
    }

    private func stopCountdown() {
        countdown = 0
        countdownTimer?.invalidate()
        countdownTimer = nil
    }

    deinit {
        countdownTimer?.invalidate()
    }
}

// MARK: - Request / Response types

private struct LoginRequest: Encodable {
    let email: String
    let password: String
}

private struct SendCodeRequest: Encodable {
    let email: String
}

private struct VerifyCodeRequest: Encodable {
    let email: String
    let code: String
}

private struct SendCodeResponse: Decodable {
    let message: String
}

struct LoginResponse: Decodable {
    let user: User
    let accessToken: String
    let refreshToken: String
}
