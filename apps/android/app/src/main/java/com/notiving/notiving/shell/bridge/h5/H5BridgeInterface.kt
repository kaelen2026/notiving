package com.notiving.notiving.shell.bridge.h5

import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.notiving.notiving.shell.router.ShellRouter
import com.notiving.notiving.shell.session.SessionManager
import org.json.JSONObject

class H5BridgeInterface(private val webView: WebView) {
    private val mainHandler = Handler(Looper.getMainLooper())

    @JavascriptInterface
    fun call(methodName: String, callbackId: String, paramsJson: String) {
        val params = try { JSONObject(paramsJson) } catch (_: Exception) { JSONObject() }

        when (methodName) {
            "getToken" -> respond(callbackId, SessionManager.accessToken)
            "getUserId" -> respond(callbackId, SessionManager.userId)
            "navigate" -> {
                val url = params.optString("url", "")
                if (url.isNotEmpty()) {
                    mainHandler.post { ShellRouter.instance?.navigate(url) }
                }
                respond(callbackId, true)
            }
            "back" -> {
                mainHandler.post { ShellRouter.instance?.back() }
                respond(callbackId, true)
            }
            "ready" -> respond(callbackId, true)
            else -> respond(callbackId, null)
        }
    }

    private fun respond(callbackId: String, result: Any?) {
        val jsonResult = when (result) {
            null -> "null"
            is String -> "\"$result\""
            is Boolean -> result.toString()
            else -> result.toString()
        }
        val js = "window.__notivingBridgeCallback('$callbackId', $jsonResult);"
        mainHandler.post { webView.evaluateJavascript(js, null) }
    }
}
