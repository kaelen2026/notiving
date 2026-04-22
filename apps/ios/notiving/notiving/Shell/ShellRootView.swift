import SwiftUI

struct ShellRootView: View {
    @StateObject private var router = ShellRouter()
    @State private var selectedTab = "home"

    var body: some View {
        TabView(selection: $selectedTab) {
            ForEach(router.config.tabs) { tab in
                NavigationStack {
                    PlaceholderScreen(tabKey: tab.key)
                        .navigationTitle(tab.key.capitalized)
                }
                .tabItem {
                    Label(tab.key.capitalized, systemImage: sfSymbol(for: tab.icon))
                }
                .tag(tab.key)
            }
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
