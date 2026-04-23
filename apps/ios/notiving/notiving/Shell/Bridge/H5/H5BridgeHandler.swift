import SwiftUI
import WebKit

final class H5BridgeHandler: NSObject, WKScriptMessageHandler {
    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard let body = message.body as? [String: Any],
              let method = body["method"] as? String,
              let callbackId = body["callbackId"] as? String
        else { return }

        let params = body["params"] as? [String: Any]
        let webView = message.webView

        switch method {

        // --- Session ---
        case "getToken":
            let token = SessionManager.shared.accessToken
            respond(webView: webView, callbackId: callbackId, result: token as Any)

        case "getUserId":
            let userId = SessionManager.shared.userId
            respond(webView: webView, callbackId: callbackId, result: userId as Any)

        // --- Navigation ---
        case "navigate":
            if let url = params?["url"] as? String {
                DispatchQueue.main.async {
                    ShellRouter.shared.navigate(to: url)
                }
            }
            respond(webView: webView, callbackId: callbackId, result: true)

        case "back":
            DispatchQueue.main.async {
                ShellRouter.shared.back()
            }
            respond(webView: webView, callbackId: callbackId, result: true)

        case "setTitle":
            if let title = params?["title"] as? String {
                DispatchQueue.main.async {
                    ShellRouter.shared.setTitle(title)
                }
            }
            respond(webView: webView, callbackId: callbackId, result: true)

        case "setNavBarHidden":
            if let hidden = params?["hidden"] as? Bool {
                DispatchQueue.main.async {
                    ShellRouter.shared.setNavBarHidden(hidden)
                }
            }
            respond(webView: webView, callbackId: callbackId, result: true)

        // --- Analytics ---
        case "track":
            // Phase 4: forward to AnalyticsTracker
            respond(webView: webView, callbackId: callbackId, result: true)

        case "pageView":
            // Phase 4: forward to AnalyticsTracker
            respond(webView: webView, callbackId: callbackId, result: true)

        // --- Permission ---
        case "requestPermission":
            // Phase 4: forward to PermissionManager
            respond(webView: webView, callbackId: callbackId, result: ["status": "denied"])

        case "checkPermission":
            // Phase 4: forward to PermissionManager
            respond(webView: webView, callbackId: callbackId, result: ["status": "denied"])

        // --- Lifecycle ---
        case "ready":
            respond(webView: webView, callbackId: callbackId, result: true)

        // --- Device ---
        case "getDeviceInfo":
            let info: [String: String] = [
                "platform": "ios",
                "osVersion": UIDevice.current.systemVersion,
                "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "",
                "deviceId": SessionManager.shared.deviceId ?? "",
            ]
            respond(webView: webView, callbackId: callbackId, result: info)

        case "getAppVersion":
            let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""
            respond(webView: webView, callbackId: callbackId, result: version)

        default:
            respond(webView: webView, callbackId: callbackId, result: NSNull())
        }
    }

    func emitEvent(to webView: WKWebView?, eventName: String, data: Any?) {
        guard let webView else { return }
        let jsonData: String
        if let data = data {
            let encoded = try? JSONSerialization.data(withJSONObject: data)
            jsonData = encoded.flatMap { String(data: $0, encoding: .utf8) } ?? "null"
        } else {
            jsonData = "null"
        }
        let js = "window.__notivingBridgeEmit && window.__notivingBridgeEmit('\(eventName)', \(jsonData));"
        DispatchQueue.main.async {
            webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    private func respond(webView: WKWebView?, callbackId: String, result: Any) {
        guard let webView else { return }
        let jsonString: String
        if let dict = result as? [String: Any] {
            let data = try? JSONSerialization.data(withJSONObject: dict)
            jsonString = data.flatMap { String(data: $0, encoding: .utf8) } ?? "null"
        } else if let str = result as? String {
            jsonString = "\"\(str)\""
        } else if result is Bool {
            jsonString = "\(result)"
        } else if result is NSNull {
            jsonString = "null"
        } else {
            jsonString = "\(result)"
        }
        let js = "window.__notivingBridgeCallback('\(callbackId)', \(jsonString));"
        DispatchQueue.main.async {
            webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }
}
