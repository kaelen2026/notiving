import SwiftUI

struct ShellRootView: View {
    @ObservedObject private var router = ShellRouter.shared

    var body: some View {
        TabView(selection: $router.selectedTab) {
            ForEach(router.config.tabs) { tab in
                NavigationStack(path: router.navigationPathBinding(for: tab.key)) {
                    tabContent(for: tab)
                        .navigationTitle(tab.key.capitalized)
                        .navigationDestination(for: ShellRoute.self) { route in
                            switch route {
                            case .h5(let url):
                                H5Container(url: url)
                            }
                        }
                }
                .tabItem {
                    Label(tab.key.capitalized, systemImage: sfSymbol(for: tab.icon))
                }
                .tag(tab.key)
            }
        }
    }

    @ViewBuilder
    private func tabContent(for tab: TabEntry) -> some View {
        let route = router.resolve(tab.route)
        switch route?.runtime {
        case "native":
            nativeScreen(for: route?.screen, tabKey: tab.key)
        case "h5":
            if let urlString = route?.url, let url = URL(string: urlString) {
                H5Container(url: url)
            } else {
                PlaceholderScreen(tabKey: tab.key)
            }
        case "rn":
            if let module = route?.module {
                RNContainer(moduleName: module)
            } else {
                PlaceholderScreen(tabKey: tab.key)
            }
        default:
            PlaceholderScreen(tabKey: tab.key)
        }
    }

    @ViewBuilder
    private func nativeScreen(for screen: String?, tabKey: String) -> some View {
        switch screen {
        case "ExploreTab":
            ExploreScreen()
        case "ProfileTab":
            ProfileScreen()
        default:
            PlaceholderScreen(tabKey: tabKey)
        }
    }

    private func sfSymbol(for icon: String) -> String {
        switch icon {
        case "home": "house"
        case "compass": "safari"
        case "bell": "bell"
        case "user": "person"
        default: "questionmark"
        }
    }
}
