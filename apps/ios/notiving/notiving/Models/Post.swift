import Foundation

struct Post: Decodable, Identifiable {
    let id: String
    let title: String
    let content: String
    let slug: String
    let published: Bool
    let authorId: String
    let createdAt: Date
    let updatedAt: Date
}

struct PaginatedResult<T: Decodable>: Decodable {
    let items: [T]
    let nextCursor: String?
    let hasMore: Bool
}
