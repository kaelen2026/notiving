import SwiftUI

struct BrandButton: View {
    let title: String
    var isLoading: Bool = false
    var isEnabled: Bool = true
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                if isLoading {
                    ProgressView()
                        .tint(Color.nvPrimaryForeground)
                } else {
                    Text(title)
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(isEnabled ? Color.nvPrimary : Color.nvBorder)
            .foregroundStyle(Color.nvPrimaryForeground)
            .clipShape(RoundedRectangle(cornerRadius: NVRadius.lg))
        }
        .disabled(!isEnabled || isLoading)
    }
}
