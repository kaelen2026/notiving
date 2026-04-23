import Combine
import SwiftUI

struct ProfileScreen: View {
    @StateObject private var viewModel = ProfileViewModel()
    @State private var showLogin = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                if viewModel.isLoading {
                    loadingView
                } else if let user = viewModel.user {
                    userHeaderView(user)
                } else {
                    guestHeaderView
                }

                menuSection
            }
        }
        .background(Color(.systemGroupedBackground))
        .task {
            await viewModel.loadProfile()
        }
        .refreshable {
            await viewModel.loadProfile()
        }
        .fullScreenCover(isPresented: $showLogin) {
            LoginScreen { user, _ in
                viewModel.user = user
                viewModel.error = nil
            }
        }
    }

    // MARK: - User Header

    private func userHeaderView(_ user: User) -> some View {
        VStack(spacing: 16) {
            avatarView(user)

            VStack(spacing: 4) {
                Text(user.nameForDisplay)
                    .font(.title2.bold())

                if let username = user.username, !username.isEmpty {
                    Text("@\(username)")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                if let bio = user.bio, !bio.isEmpty {
                    Text(bio)
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.top, 4)
                }
            }
        }
        .padding(.vertical, 24)
        .padding(.horizontal, 16)
        .frame(maxWidth: .infinity)
        .background(Color(.systemBackground))
    }

    @ViewBuilder
    private func avatarView(_ user: User) -> some View {
        if let avatarUrl = user.avatarUrl, let url = URL(string: avatarUrl) {
            AsyncImage(url: url) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                case .failure:
                    initialsAvatar(user)
                default:
                    ProgressView()
                        .frame(width: 80, height: 80)
                }
            }
            .frame(width: 80, height: 80)
            .clipShape(Circle())
        } else {
            initialsAvatar(user)
        }
    }

    private func initialsAvatar(_ user: User) -> some View {
        Circle()
            .fill(Color.accentColor.opacity(0.15))
            .frame(width: 80, height: 80)
            .overlay(
                Text(user.initials)
                    .font(.title2.bold())
                    .foregroundStyle(Color.accentColor)
            )
    }

    // MARK: - Guest Header

    private var guestHeaderView: some View {
        Button {
            showLogin = true
        } label: {
            VStack(spacing: 16) {
                Circle()
                    .fill(Color(.systemGray5))
                    .frame(width: 80, height: 80)
                    .overlay(
                        Image(systemName: "person.fill")
                            .font(.system(size: 32))
                            .foregroundStyle(Color(.systemGray2))
                    )

                VStack(spacing: 4) {
                    Text("Tap to Log In")
                        .font(.title2.bold())
                        .foregroundStyle(.primary)
                    Text("Log in to access your full profile")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(.vertical, 24)
            .padding(.horizontal, 16)
            .frame(maxWidth: .infinity)
            .background(Color(.systemBackground))
        }
    }

    // MARK: - Menu Section

    private var menuSection: some View {
        VStack(spacing: 0) {
            if viewModel.user != nil {
                menuGroup {
                    menuRow(icon: "person", title: "Edit Profile")
                    Divider().padding(.leading, 44)
                    NavigationLink {
                        SettingsScreen()
                    } label: {
                        menuLabel(icon: "gearshape", title: "Settings")
                    }
                    Divider().padding(.leading, 44)
                    menuRow(icon: "bell", title: "Notifications")
                }
            } else {
                menuGroup {
                    NavigationLink {
                        SettingsScreen()
                    } label: {
                        menuLabel(icon: "gearshape", title: "Settings")
                    }
                }
            }

            menuGroup {
                menuRow(icon: "questionmark.circle", title: "Help & Support")
                Divider().padding(.leading, 44)
                menuRow(icon: "info.circle", title: "About")
            }

            if viewModel.user != nil {
                Button(action: {
                    viewModel.logout()
                }) {
                    HStack {
                        Spacer()
                        Text("Log Out")
                            .foregroundStyle(.red)
                        Spacer()
                    }
                    .padding(.vertical, 14)
                    .background(Color(.systemBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .padding(.horizontal, 16)
                .padding(.top, 24)
            }
        }
        .padding(.top, 8)
    }

    private func menuGroup<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        VStack(spacing: 0) {
            content()
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .padding(.horizontal, 16)
        .padding(.top, 16)
    }

    private func menuLabel(icon: String, title: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .frame(width: 20)
                .foregroundStyle(.primary)
            Text(title)
                .foregroundStyle(.primary)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }

    private func menuRow(icon: String, title: String) -> some View {
        Button(action: {}) {
            menuLabel(icon: icon, title: title)
        }
    }

    // MARK: - States

    private var loadingView: some View {
        VStack(spacing: 12) {
            ProgressView()
            Text("Loading profile...")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, minHeight: 300)
    }
}
