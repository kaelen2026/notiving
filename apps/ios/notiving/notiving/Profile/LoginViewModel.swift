import Combine
import Foundation

@MainActor
final class LoginViewModel: ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var isLoading = false
    @Published var error: String?

    var isFormValid: Bool {
        !email.trimmingCharacters(in: .whitespaces).isEmpty && !password.isEmpty
    }

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
}

private struct LoginRequest: Encodable {
    let email: String
    let password: String
}

struct LoginResponse: Decodable {
    let user: User
    let accessToken: String
    let refreshToken: String
}
