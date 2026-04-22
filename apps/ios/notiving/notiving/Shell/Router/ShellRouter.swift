import Combine
import Foundation

final class ShellRouter: ObservableObject {
    let config: RouteTableConfig

    init() {
        self.config = RouteTableLoader.load()
    }

    func resolve(_ path: String) -> RouteEntry? {
        config.routes.first { $0.pattern == path }
    }
}
