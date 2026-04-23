import Foundation

enum AppEnvironment {
    #if targetEnvironment(simulator)
    static let h5BaseURL = "http://localhost:5173"
    #else
    static let h5BaseURL = "https://h5.notiving.com"
    #endif
}
