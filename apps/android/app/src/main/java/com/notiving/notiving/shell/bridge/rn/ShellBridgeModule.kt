package com.notiving.notiving.shell.bridge.rn

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.notiving.notiving.shell.router.ShellRouter
import com.notiving.notiving.shell.session.SessionManager

class ShellBridgeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ShellBridge"

    @ReactMethod
    fun getToken(promise: Promise) {
        promise.resolve(SessionManager.accessToken)
    }

    @ReactMethod
    fun getUserId(promise: Promise) {
        promise.resolve(SessionManager.userId)
    }

    @ReactMethod
    fun navigate(url: String) {
        ShellRouter.instance?.navigate(url)
    }

    @ReactMethod
    fun back() {
        ShellRouter.instance?.back()
    }

    @ReactMethod
    fun ready() {
        // Container signals first render complete. Phase 4: performance tracking.
    }
}
