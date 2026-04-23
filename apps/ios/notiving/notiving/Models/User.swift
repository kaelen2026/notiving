import Foundation

struct User: Decodable, Identifiable {
    let id: String
    let username: String?
    let email: String?
    let displayName: String?
    let bio: String?
    let avatarUrl: String?
    let isAnonymous: Bool
    let tokenVersion: String
    let createdAt: Date
    let updatedAt: Date
    let hasPassword: Bool?
    let providers: [LinkedAccount]?
}

struct LinkedAccount: Decodable, Identifiable {
    let id: String
    let provider: String
    let providerUserId: String
    let email: String?
    let displayName: String?
    let avatarUrl: String?
}

extension User {
    var nameForDisplay: String {
        if let displayName, !displayName.isEmpty {
            return displayName
        }
        if let username, !username.isEmpty {
            return username
        }
        return "Anonymous"
    }

    var initials: String {
        let name = nameForDisplay
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return String(parts[0].prefix(1) + parts[1].prefix(1)).uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
}
