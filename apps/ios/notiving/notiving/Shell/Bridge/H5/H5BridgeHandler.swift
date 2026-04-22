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
        case "getToken":
            let token = SessionManager.shared.accessToken
            respond(webView: webView, callbackId: callbackId, result: token as Any)

        case "getUserId":
            let userId = SessionManager.shared.userId
            respond(webView: webView, callbackId: callbackId, result: userId as Any)

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

        case "ready":
            respond(webView: webView, callbackId: callbackId, result: true)

        default:
            respond(webView: webView, callbackId: callbackId, result: NSNull())
        }
    }

    private func respond(webView: WKWebView?, callbackId: String, result: Any) {
        guard let webView else { return }
        let jsonData = try? JSONSerialization.data(withJSONObject: result)
        let jsonString = jsonData.flatMap { String(data: $0, encoding: .utf8) } ?? "null"
        let js = "window.__notivingBridgeCallback('\(callbackId)', \(jsonString));"
        DispatchQueue.main.async {
            webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }
}
