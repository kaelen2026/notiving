import Foundation

@objc(ShellBridge)
final class ShellBridgeModule: NSObject {

    @objc static func requiresMainQueueSetup() -> Bool { false }

    @objc static func supportedEvents() -> [String] {
        return ["onSessionChange", "onResume", "onPause"]
    }

    // --- Session ---

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

    @objc func addListener(_ eventName: String) {
        // Required for RN EventEmitter
    }

    @objc func removeListeners(_ count: Int) {
        // Required for RN EventEmitter
    }

    // --- Navigation ---

    @objc func navigate(_ url: String, opts: NSDictionary?) {
        DispatchQueue.main.async {
            ShellRouter.shared.navigate(to: url)
        }
    }

    @objc func back() {
        DispatchQueue.main.async {
            ShellRouter.shared.back()
        }
    }

    @objc func setTitle(_ title: String) {
        DispatchQueue.main.async {
            ShellRouter.shared.setTitle(title)
        }
    }

    @objc func setNavBarHidden(_ hidden: Bool) {
        DispatchQueue.main.async {
            ShellRouter.shared.setNavBarHidden(hidden)
        }
    }

    // --- Analytics ---

    @objc func track(_ event: String, params: NSDictionary?) {
        // Phase 4: forward to AnalyticsTracker
    }

    @objc func pageView(_ pageName: String) {
        // Phase 4: forward to AnalyticsTracker
    }

    // --- Permission ---

    @objc func requestPermission(
        _ type: String,
        resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        // Phase 4: forward to PermissionManager
        resolve(["status": "denied"])
    }

    @objc func checkPermission(
        _ type: String,
        resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        // Phase 4: forward to PermissionManager
        resolve(["status": "denied"])
    }

    // --- Lifecycle ---

    @objc func ready() {
        // Container signals first render complete. Phase 4: performance tracking.
    }

    // --- Device ---

    @objc func getDeviceInfo(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let info: [String: String] = [
            "platform": "ios",
            "osVersion": UIDevice.current.systemVersion,
            "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "",
            "deviceId": SessionManager.shared.deviceId ?? "",
        ]
        resolve(info)
    }

    @objc func getAppVersion(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""
        resolve(version)
    }
}
