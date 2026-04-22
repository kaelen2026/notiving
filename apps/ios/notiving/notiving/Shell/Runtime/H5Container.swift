import SwiftUI
import WebKit

struct H5Container: UIViewRepresentable {
    let url: URL

    private static let bridgeJS = """
    (function() {
        if (window.NotivingBridge) return;
        var callbackId = 0;
        var callbacks = {};
        window.__notivingBridgeCallback = function(id, result) {
            if (callbacks[id]) {
                callbacks[id](result);
                delete callbacks[id];
            }
        };
        function call(method, params) {
            return new Promise(function(resolve) {
                var id = String(++callbackId);
                callbacks[id] = resolve;
                window.webkit.messageHandlers.shellBridge.postMessage({
                    method: method,
                    callbackId: id,
                    params: params || {}
                });
            });
        }
        window.NotivingBridge = {
            getToken: function() { return call('getToken'); },
            getUserId: function() { return call('getUserId'); },
            navigate: function(url, opts) { return call('navigate', { url: url }); },
            back: function() { return call('back'); },
            ready: function() { return call('ready'); },
            isInShell: true
        };
    })();
    """

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true

        let userContent = config.userContentController
        let script = WKUserScript(
            source: Self.bridgeJS,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        userContent.addUserScript(script)
        userContent.add(context.coordinator, name: "shellBridge")

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    func makeCoordinator() -> H5BridgeHandler {
        H5BridgeHandler()
    }
}
