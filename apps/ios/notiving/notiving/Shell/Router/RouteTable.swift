import Foundation

struct RouteTableConfig: Codable {
    let version: Int
    let routes: [RouteEntry]
    let tabs: [TabEntry]
}

struct RouteEntry: Codable {
    let pattern: String
    let runtime: String
    let screen: String?
    let module: String?
    let url: String?
}

struct TabEntry: Codable, Identifiable {
    let key: String
    let route: String
    let icon: String
    var id: String { key }
}

enum RouteTableLoader {
    static func load() -> RouteTableConfig {
        guard let url = Bundle.main.url(forResource: "route-table", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let config = try? JSONDecoder().decode(RouteTableConfig.self, from: data)
        else { fatalError("Failed to load route-table.json") }
        return config
    }
}
