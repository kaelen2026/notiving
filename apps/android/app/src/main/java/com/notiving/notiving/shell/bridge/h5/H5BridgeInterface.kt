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
            // --- Session ---
            "getToken" -> respond(callbackId, SessionManager.accessToken)
            "getUserId" -> respond(callbackId, SessionManager.userId)

            // --- Navigation ---
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
            "setTitle" -> {
                val title = params.optString("title", "")
                mainHandler.post { ShellRouter.instance?.setTitle(title) }
                respond(callbackId, true)
            }
            "setNavBarHidden" -> {
                val hidden = params.optBoolean("hidden", false)
                mainHandler.post { ShellRouter.instance?.setNavBarHidden(hidden) }
                respond(callbackId, true)
            }

            // --- Analytics ---
            "track" -> {
                // Phase 4: forward to AnalyticsTracker
                respond(callbackId, true)
            }
            "pageView" -> {
                // Phase 4: forward to AnalyticsTracker
                respond(callbackId, true)
            }

            // --- Permission ---
            "requestPermission" -> {
                // Phase 4: forward to PermissionManager
                respond(callbackId, JSONObject().put("status", "denied"))
            }
            "checkPermission" -> {
                // Phase 4: forward to PermissionManager
                respond(callbackId, JSONObject().put("status", "denied"))
            }

            // --- Lifecycle ---
            "ready" -> respond(callbackId, true)

            // --- Device ---
            "getDeviceInfo" -> {
                val info = JSONObject().apply {
                    put("platform", "android")
                    put("osVersion", android.os.Build.VERSION.RELEASE)
                    put("appVersion", getAppVersionName())
                    put("deviceId", SessionManager.deviceId)
                }
                respond(callbackId, info)
            }
            "getAppVersion" -> {
                respond(callbackId, getAppVersionName())
            }

            else -> respond(callbackId, null)
        }
    }

    fun emitEvent(eventName: String, data: Any?) {
        val jsonData = when (data) {
            null -> "null"
            is JSONObject -> data.toString()
            is String -> "\"$data\""
            is Boolean -> data.toString()
            else -> data.toString()
        }
        val js = "window.__notivingBridgeEmit && window.__notivingBridgeEmit('$eventName', $jsonData);"
        mainHandler.post { webView.evaluateJavascript(js, null) }
    }

    private fun getAppVersionName(): String {
        return try {
            val context = webView.context
            val pInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            pInfo.versionName ?: ""
        } catch (_: Exception) {
            ""
        }
    }

    private fun respond(callbackId: String, result: Any?) {
        val jsonResult = when (result) {
            null -> "null"
            is String -> "\"$result\""
            is Boolean -> result.toString()
            is JSONObject -> result.toString()
            else -> result.toString()
        }
        val js = "window.__notivingBridgeCallback('$callbackId', $jsonResult);"
        mainHandler.post { webView.evaluateJavascript(js, null) }
    }
}
