package com.notiving.notiving.shell.runtime

import android.annotation.SuppressLint
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.notiving.notiving.shell.bridge.h5.H5BridgeInterface

private const val BRIDGE_JS = """
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
            window.__shellBridge.call(method, id, JSON.stringify(params || {}));
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

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun H5Container(url: String, modifier: Modifier = Modifier) {
    AndroidView(
        factory = { context ->
            WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                addJavascriptInterface(H5BridgeInterface(this), "__shellBridge")
                webViewClient = object : WebViewClient() {
                    override fun onPageStarted(
                        view: WebView?,
                        url: String?,
                        favicon: android.graphics.Bitmap?
                    ) {
                        view?.evaluateJavascript(BRIDGE_JS, null)
                    }
                }
                loadUrl(url)
            }
        },
        modifier = modifier.fillMaxSize(),
    )
}
