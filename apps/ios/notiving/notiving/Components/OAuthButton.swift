import SwiftUI

enum OAuthProvider {
    case google
    case apple

    var label: String {
        switch self {
        case .google: return "Continue with Google"
        case .apple: return "Continue with Apple"
        }
    }

    var iconName: String {
        switch self {
        case .google: return "g.circle.fill"
        case .apple: return "apple.logo"
        }
    }
}

struct OAuthButton: View {
    let provider: OAuthProvider
    var isLoading: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: NVSpacing.md) {
                if isLoading {
                    ProgressView()
                        .tint(foregroundColor)
                } else {
                    Image(systemName: provider.iconName)
                        .font(.title3)
                    Text(provider.label)
                        .fontWeight(.medium)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(backgroundColor)
            .foregroundStyle(foregroundColor)
            .clipShape(RoundedRectangle(cornerRadius: NVRadius.lg))
            .overlay(
                RoundedRectangle(cornerRadius: NVRadius.lg)
                    .stroke(borderColor, lineWidth: provider == .google ? 1 : 0)
            )
        }
        .disabled(isLoading)
    }

    private var backgroundColor: Color {
        switch provider {
        case .apple: return Color.nvForeground
        case .google: return Color.nvBackground
        }
    }

    private var foregroundColor: Color {
        switch provider {
        case .apple: return Color.nvBackground
        case .google: return Color.nvForeground
        }
    }

    private var borderColor: Color {
        switch provider {
        case .apple: return .clear
        case .google: return Color.nvBorder
        }
    }
}
