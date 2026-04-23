import Foundation

struct DeepLinkHandler {
    static func handle(_ url: URL, router: ShellRouter = .shared, session: SessionManager = .shared) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else { return }

        let path: String
        if url.scheme == "notiving" {
            path = "/\(url.host ?? "")\(url.path)"
        } else if url.host == "notiving.com" || url.host == "h5.notiving.com" {
            path = url.path.isEmpty ? "/" : url.path
        } else {
            return
        }

        if path.hasPrefix("/oauth/callback") {
            if let token = components.queryItems?.first(where: { $0.name == "token" })?.value {
                session.accessToken = token
                router.navigate(to: "/profile")
            }
            return
        }

        router.navigate(to: path)
    }
}
