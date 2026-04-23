import SwiftUI

struct ExploreScreen: View {
    @StateObject private var viewModel = ExploreViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.posts.isEmpty {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let error = viewModel.error, viewModel.posts.isEmpty {
                VStack(spacing: 12) {
                    Text(error)
                        .foregroundStyle(.secondary)
                    Button("Retry") {
                        Task { await viewModel.loadPosts() }
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                postList
            }
        }
        .task { await viewModel.loadPosts() }
        .refreshable { await viewModel.loadPosts() }
    }

    private var postList: some View {
        List {
            ForEach(viewModel.posts) { post in
                Button {
                    let url = URL(string: "\(AppEnvironment.h5BaseURL)/posts/\(post.id)")!
                    ShellRouter.shared.push(.h5(url: url))
                } label: {
                    PostRow(post: post)
                }
                .buttonStyle(.plain)
                .onAppear {
                    if post.id == viewModel.posts.last?.id {
                        Task { await viewModel.loadMore() }
                    }
                }
            }
        }
        .listStyle(.plain)
    }
}

private struct PostRow: View {
    let post: Post

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(post.title)
                .font(.headline)
                .lineLimit(2)
            Text(post.content)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(2)
            Text(post.createdAt, style: .relative)
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 4)
    }
}
