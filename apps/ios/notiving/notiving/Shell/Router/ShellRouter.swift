import Combine
import Foundation
import SwiftUI

final class ShellRouter: ObservableObject {
    static let shared = ShellRouter()

    let config: RouteTableConfig
    @Published var selectedTab: String
    @Published var navigationPaths: [String: NavigationPath] = [:]

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
            return
        }

        if let h5URL = URL(string: "\(AppEnvironment.h5BaseURL)\(url)") {
            push(.h5(url: h5URL))
        }
    }

    func push(_ route: ShellRoute) {
        var path = navigationPaths[selectedTab] ?? NavigationPath()
        path.append(route)
        navigationPaths[selectedTab] = path
    }

    func pop() {
        guard var path = navigationPaths[selectedTab], !path.isEmpty else { return }
        path.removeLast()
        navigationPaths[selectedTab] = path
    }

    func back() {
        pop()
    }

    func setTitle(_ title: String) {
        // Phase 4: update native nav bar title
    }

    func setNavBarHidden(_ hidden: Bool) {
        // Phase 4: show/hide native nav bar
    }

    func navigationPathBinding(for tabKey: String) -> Binding<NavigationPath> {
        Binding(
            get: { self.navigationPaths[tabKey] ?? NavigationPath() },
            set: { self.navigationPaths[tabKey] = $0 }
        )
    }
}
