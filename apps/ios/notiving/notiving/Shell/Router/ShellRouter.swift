import Combine
import Foundation

final class ShellRouter: ObservableObject {
    static let shared = ShellRouter()

    let config: RouteTableConfig
    @Published var selectedTab: String

    init() {
        self.config = RouteTableLoader.load()
        self.selectedTab = config.tabs.first?.key ?? "home"
    }

    func resolve(_ path: String) -> RouteEntry? {
        config.routes.first { $0.pattern == path }
    }

    func navigate(to url: String) {
        if let tab = config.tabs.first(where: { $0.route == url }) {
            selectedTab = tab.key
        }
    }

    func back() {
        // Tab-level: no-op for now. Push navigation in Phase 4.
    }
}
