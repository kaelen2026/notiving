import Combine
import Foundation

@MainActor
final class ExploreViewModel: ObservableObject {
    @Published var posts: [Post] = []
    @Published var isLoading = false
    @Published var error: String?

    private var nextCursor: String?
    private var hasMore = true

    func loadPosts() async {
        isLoading = true
        error = nil
        nextCursor = nil
        hasMore = true

        do {
            let result: PaginatedResult<Post> = try await APIClient.shared.request(
                path: "/posts?limit=20",
                authenticated: false
            )
            posts = result.items
            nextCursor = result.nextCursor
            hasMore = result.hasMore
        } catch let apiError as APIError {
            error = apiError.errorDescription
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }

    func loadMore() async {
        guard hasMore, !isLoading, let cursor = nextCursor else { return }
        isLoading = true

        do {
            let result: PaginatedResult<Post> = try await APIClient.shared.request(
                path: "/posts?limit=20&cursor=\(cursor)",
                authenticated: false
            )
            posts.append(contentsOf: result.items)
            nextCursor = result.nextCursor
            hasMore = result.hasMore
        } catch {
            // Silently fail on load-more; user can scroll again
        }

        isLoading = false
    }
}
