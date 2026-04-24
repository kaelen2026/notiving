import SwiftUI

struct MenuGroup<Content: View>: View {
    @ViewBuilder let content: Content

    var body: some View {
        VStack(spacing: 0) {
            content
        }
        .background(Color.nvSurface)
        .clipShape(RoundedRectangle(cornerRadius: NVRadius.md))
        .padding(.horizontal, NVSpacing.lg)
        .padding(.top, NVSpacing.lg)
    }
}
