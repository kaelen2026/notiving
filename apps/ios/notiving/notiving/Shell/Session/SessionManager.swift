import Foundation

final class SessionManager {
    static let shared = SessionManager()

    private let defaults = UserDefaults.standard
    private let tokenKey = "notiving_access_token"
    private let userIdKey = "notiving_user_id"
    private let deviceIdKey = "notiving_device_id"

    private init() {}

    var accessToken: String? {
        get { defaults.string(forKey: tokenKey) }
        set { defaults.set(newValue, forKey: tokenKey) }
    }

    var userId: String? {
        get { defaults.string(forKey: userIdKey) }
        set { defaults.set(newValue, forKey: userIdKey) }
    }

    var deviceId: String? {
        get {
            if let id = defaults.string(forKey: deviceIdKey) {
                return id
            }
            let id = UUID().uuidString
            defaults.set(id, forKey: deviceIdKey)
            return id
        }
    }

    func clear() {
        defaults.removeObject(forKey: tokenKey)
        defaults.removeObject(forKey: userIdKey)
    }
}
