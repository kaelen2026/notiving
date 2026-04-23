import SwiftUI

@main
struct notivingApp: App {
    private var settings = SettingsManager.shared

    var body: some Scene {
        WindowGroup {
            ShellRootView()
                .preferredColorScheme(settings.appearanceMode.colorScheme)
        }
    }
}
