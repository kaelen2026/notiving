import SwiftUI
import WebKit

struct H5Container: UIViewRepresentable {
    let url: URL

    private static let bridgeJS = """
    (function() {
        if (window.NotivingBridge) return;
        var callbackId = 0;
        var callbacks = {};
        var listeners = {};
        window.__notivingBridgeCallback = function(id, result) {
            if (callbacks[id]) {
                callbacks[id](result);
                delete callbacks[id];
            }
        };
        window.__notivingBridgeEmit = function(eventName, data) {
            var cbs = listeners[eventName] || [];
            for (var i = 0; i < cbs.length; i++) { cbs[i](data); }
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
        function on(eventName, cb) {
            if (!listeners[eventName]) listeners[eventName] = [];
            listeners[eventName].push(cb);
            return function() {
                listeners[eventName] = listeners[eventName].filter(function(f) { return f !== cb; });
            };
        }
        window.NotivingBridge = {
            getToken: function() { return call('getToken'); },
            getUserId: function() { return call('getUserId'); },
            onSessionChange: function(cb) { return on('onSessionChange', cb); },
            navigate: function(url, opts) { return call('navigate', { url: url }); },
            back: function() { return call('back'); },
            setTitle: function(title) { return call('setTitle', { title: title }); },
            setNavBarHidden: function(hidden) { return call('setNavBarHidden', { hidden: hidden }); },
            track: function(event, params) { return call('track', { event: event, params: params }); },
            pageView: function(pageName) { return call('pageView', { pageName: pageName }); },
            requestPermission: function(type) { return call('requestPermission', { type: type }); },
            checkPermission: function(type) { return call('checkPermission', { type: type }); },
            onResume: function(cb) { return on('onResume', cb); },
            onPause: function(cb) { return on('onPause', cb); },
            ready: function() { return call('ready'); },
            getDeviceInfo: function() { return call('getDeviceInfo'); },
            getAppVersion: function() { return call('getAppVersion'); },
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
