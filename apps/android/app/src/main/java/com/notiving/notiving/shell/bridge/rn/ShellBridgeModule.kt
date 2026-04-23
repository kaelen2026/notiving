package com.notiving.notiving.shell.bridge.rn

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.notiving.notiving.shell.router.ShellRouter
import com.notiving.notiving.shell.session.SessionManager

class ShellBridgeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ShellBridge"

    // --- Session ---

    @ReactMethod
    fun getToken(promise: Promise) {
        promise.resolve(SessionManager.accessToken)
    }

    @ReactMethod
    fun getUserId(promise: Promise) {
        promise.resolve(SessionManager.userId)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN EventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN EventEmitter
    }

    fun emitSessionChange(token: String?, userId: String?) {
        val params = if (token != null && userId != null) {
            Arguments.createMap().apply {
                putString("token", token)
                putString("userId", userId)
            }
        } else {
            null
        }
        sendEvent("onSessionChange", params)
    }

    // --- Navigation ---

    @ReactMethod
    fun navigate(url: String, opts: ReadableMap?) {
        ShellRouter.instance?.navigate(url)
    }

    @ReactMethod
    fun back() {
        ShellRouter.instance?.back()
    }

    @ReactMethod
    fun setTitle(title: String) {
        ShellRouter.instance?.setTitle(title)
    }

    @ReactMethod
    fun setNavBarHidden(hidden: Boolean) {
        ShellRouter.instance?.setNavBarHidden(hidden)
    }

    // --- Analytics ---

    @ReactMethod
    fun track(event: String, params: ReadableMap?) {
        // Phase 4: forward to AnalyticsTracker
    }

    @ReactMethod
    fun pageView(pageName: String) {
        // Phase 4: forward to AnalyticsTracker
    }

    // --- Permission ---

    @ReactMethod
    fun requestPermission(type: String, promise: Promise) {
        // Phase 4: forward to PermissionManager
        promise.resolve(Arguments.createMap().apply { putString("status", "denied") })
    }

    @ReactMethod
    fun checkPermission(type: String, promise: Promise) {
        // Phase 4: forward to PermissionManager
        promise.resolve(Arguments.createMap().apply { putString("status", "denied") })
    }

    // --- Lifecycle ---

    fun emitResume() {
        sendEvent("onResume", null)
    }

    fun emitPause() {
        sendEvent("onPause", null)
    }

    @ReactMethod
    fun ready() {
        // Container signals first render complete. Phase 4: performance tracking.
    }

    // --- Device ---

    @ReactMethod
    fun getDeviceInfo(promise: Promise) {
        val info = Arguments.createMap().apply {
            putString("platform", "android")
            putString("osVersion", android.os.Build.VERSION.RELEASE)
            putString("appVersion", getAppVersionName())
            putString("deviceId", SessionManager.deviceId)
        }
        promise.resolve(info)
    }

    @ReactMethod
    fun getAppVersion(promise: Promise) {
        promise.resolve(getAppVersionName())
    }

    private fun getAppVersionName(): String {
        return try {
            val context = reactApplicationContext
            val pInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            pInfo.versionName ?: ""
        } catch (_: Exception) {
            ""
        }
    }

    private fun sendEvent(eventName: String, params: Any?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
