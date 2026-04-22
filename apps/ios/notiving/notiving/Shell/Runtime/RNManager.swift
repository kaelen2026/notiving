import SwiftUI
import ReactAppDependencyProvider

final class RNManager {
    static let shared = RNManager()

    let factory: RCTReactNativeFactory
    private let delegate: RNFactoryDelegate

    private init() {
        delegate = RNFactoryDelegate()
        factory = RCTReactNativeFactory(delegate: delegate)
        delegate.dependencyProvider = RCTAppDependencyProvider()
    }
}

private class RNFactoryDelegate: RCTDefaultReactNativeFactoryDelegate {
    override func sourceURL(for bridge: RCTBridge!) -> URL! {
        bundleURL()
    }

    override func bundleURL() -> URL? {
        #if DEBUG
        RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
        #else
        Bundle.main.url(forResource: "main", withExtension: "jsbundle")
        #endif
    }
}
