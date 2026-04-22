import Foundation

@objc(ShellBridge)
final class ShellBridgeModule: NSObject {

    @objc static func requiresMainQueueSetup() -> Bool { false }

    @objc func getToken(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        resolve(SessionManager.shared.accessToken)
    }

    @objc func getUserId(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        resolve(SessionManager.shared.userId)
    }

    @objc func navigate(_ url: String) {
        DispatchQueue.main.async {
            ShellRouter.shared.navigate(to: url)
        }
    }

    @objc func back() {
        DispatchQueue.main.async {
            ShellRouter.shared.back()
        }
    }

    @objc func ready() {
        // Container signals first render complete. Phase 4: performance tracking.
    }
}
