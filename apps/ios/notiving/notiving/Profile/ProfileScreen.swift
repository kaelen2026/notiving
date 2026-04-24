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
                    userHeader(user)
                } else {
                    guestHeader
                }

                menuSection
            }
        }
        .background(Color.nvBackgroundSecondary)
        .task {
            await viewModel.loadProfile()
        }
        .refreshable {
            await viewModel.loadProfile()
        }
        .sheet(isPresented: $showLogin) {
            LoginScreen { user, _ in
                viewModel.user = user
                viewModel.error = nil
            }
        }
    }

    // MARK: - User Header

    private func userHeader(_ user: User) -> some View {
        VStack(spacing: NVSpacing.lg) {
            AvatarView(url: user.avatarUrl, initials: user.initials)

            VStack(spacing: NVSpacing.xs) {
                Text(user.nameForDisplay)
                    .font(.nv2XL.bold())
                    .foregroundStyle(Color.nvForeground)

                if let username = user.username, !username.isEmpty {
                    Text("@\(username)")
                        .font(.nvSM)
                        .foregroundStyle(Color.nvForegroundSecondary)
                }

                if let bio = user.bio, !bio.isEmpty {
                    Text(bio)
                        .font(.nvBase)
                        .foregroundStyle(Color.nvForegroundSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.top, NVSpacing.xs)
                }
            }
        }
        .padding(.vertical, NVSpacing.xxl)
        .padding(.horizontal, NVSpacing.lg)
        .frame(maxWidth: .infinity)
        .background(Color.nvSurface)
    }

    // MARK: - Guest Header

    private var guestHeader: some View {
        VStack(spacing: NVSpacing.xl) {
            AvatarView(url: nil, initials: "?", size: 88)

            VStack(spacing: NVSpacing.sm) {
                Text("Join Notiving")
                    .font(.nv2XL.bold())
                    .foregroundStyle(Color.nvForeground)
                Text("Sign in to save your content and sync across devices")
                    .font(.nvSM)
                    .foregroundStyle(Color.nvForegroundSecondary)
                    .multilineTextAlignment(.center)
            }

            BrandButton(title: "Sign In") {
                showLogin = true
            }
            .padding(.horizontal, NVSpacing.xxxl)
        }
        .padding(.vertical, NVSpacing.xxxl)
        .padding(.horizontal, NVSpacing.lg)
        .frame(maxWidth: .infinity)
        .background(Color.nvSurface)
    }

    // MARK: - Menu

    private var menuSection: some View {
        VStack(spacing: 0) {
            if viewModel.user != nil {
                MenuGroup {
                    MenuRow(icon: "person", title: "Edit Profile")
                    Divider().padding(.leading, 44)
                    NavigationLink {
                        SettingsScreen()
                    } label: {
                        MenuRow(icon: "gearshape", title: "Settings").label
                    }
                    Divider().padding(.leading, 44)
                    MenuRow(icon: "bell", title: "Notifications")
                }
            } else {
                MenuGroup {
                    NavigationLink {
                        SettingsScreen()
                    } label: {
                        MenuRow(icon: "gearshape", title: "Settings").label
                    }
                }
            }

            MenuGroup {
                MenuRow(icon: "questionmark.circle", title: "Help & Support")
                Divider().padding(.leading, 44)
                MenuRow(icon: "info.circle", title: "About")
            }

            if viewModel.user != nil {
                Button(action: {
                    viewModel.logout()
                }) {
                    HStack {
                        Spacer()
                        Text("Log Out")
                            .foregroundStyle(Color.nvDestructive)
                        Spacer()
                    }
                    .padding(.vertical, 14)
                    .background(Color.nvSurface)
                    .clipShape(RoundedRectangle(cornerRadius: NVRadius.md))
                }
                .padding(.horizontal, NVSpacing.lg)
                .padding(.top, NVSpacing.xxl)
            }
        }
        .padding(.top, NVSpacing.sm)
    }

    // MARK: - Loading

    private var loadingView: some View {
        VStack(spacing: NVSpacing.md) {
            ProgressView()
                .tint(Color.nvPrimary)
            Text("Loading profile...")
                .font(.nvSM)
                .foregroundStyle(Color.nvForegroundSecondary)
        }
        .frame(maxWidth: .infinity, minHeight: 300)
    }
}
