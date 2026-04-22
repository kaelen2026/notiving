import SwiftUI

struct PlaceholderScreen: View {
    let tabKey: String

    var body: some View {
        VStack(spacing: 8) {
            Text(tabKey.capitalized)
                .font(.largeTitle.bold())
            Text("Coming soon")
                .foregroundStyle(.secondary)
        }
    }
}
