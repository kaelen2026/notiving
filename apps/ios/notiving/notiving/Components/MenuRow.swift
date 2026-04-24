import SwiftUI

struct MenuRow: View {
    let icon: String
    let title: String
    var action: (() -> Void)?

    var body: some View {
        if let action {
            Button(action: action) {
                label
            }
        } else {
            label
        }
    }

    var label: some View {
        HStack(spacing: NVSpacing.md) {
            Image(systemName: icon)
                .frame(width: 20)
                .foregroundStyle(Color.nvForeground)
            Text(title)
                .foregroundStyle(Color.nvForeground)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(Color.nvForegroundTertiary)
        }
        .padding(.horizontal, NVSpacing.lg)
        .padding(.vertical, 14)
    }
}
