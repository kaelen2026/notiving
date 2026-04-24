import SwiftUI

struct AvatarView: View {
    let url: String?
    let initials: String
    var size: CGFloat = 80

    var body: some View {
        if let avatarUrl = url, let imageURL = URL(string: avatarUrl) {
            AsyncImage(url: imageURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                case .failure:
                    initialsView
                default:
                    ProgressView()
                        .frame(width: size, height: size)
                }
            }
            .frame(width: size, height: size)
            .clipShape(Circle())
        } else {
            initialsView
        }
    }

    private var initialsView: some View {
        Circle()
            .fill(Color.nvPrimaryMuted)
            .frame(width: size, height: size)
            .overlay(
                Text(initials)
                    .font(size > 60 ? .title2.bold() : .caption.bold())
                    .foregroundStyle(Color.nvPrimary)
            )
    }
}
