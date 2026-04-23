import Combine
import Combine
import Foundation
import SwiftUI

@MainActor
final class ProfileViewModel: ObservableObject {
    @Published var user: User?
    @Published var isLoading = false
    @Published var error: String?

    func loadProfile() async {
        guard SessionManager.shared.accessToken != nil else {
            error = "Not logged in"
            return
        }

        isLoading = true
        error = nil

        do {
            let me: User = try await APIClient.shared.request(path: "/auth/me")
            user = me
        } catch let apiError as APIError {
            error = apiError.errorDescription
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }

    func logout() {
        SessionManager.shared.clear()
        user = nil
    }
}
