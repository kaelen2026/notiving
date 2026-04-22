package com.notiving.notiving.shell.runtime

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.interfaces.fabric.ReactSurface

private const val TAG = "RNContainer"

@Composable
fun RNContainer(moduleName: String, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val reactHost = (context.applicationContext as ReactApplication).reactHost!!

    var surfaceReady by remember { mutableStateOf(false) }

    val surface = remember(moduleName) {
        reactHost.createSurface(context, moduleName, Bundle())
    }

    LaunchedEffect(surface) {
        reactHost.start()
        waitForSurface(reactHost, surface) {
            surfaceReady = true
        }
    }

    if (surfaceReady && surface.view != null) {
        AndroidView(
            factory = {
                val view = surface.view!!
                // Detach from any previous parent
                (view.parent as? ViewGroup)?.removeView(view)
                view
            },
            modifier = modifier.fillMaxSize(),
        )
    }
}

private fun waitForSurface(
    reactHost: ReactHost,
    surface: ReactSurface,
    onReady: () -> Unit,
) {
    val handler = Handler(Looper.getMainLooper())
    handler.post(object : Runnable {
        override fun run() {
            if (!surface.isRunning) {
                surface.start()
            }
            if (surface.isRunning && surface.view != null) {
                Log.d(TAG, "Surface ready: ${surface.moduleName}, view=${surface.view?.width}x${surface.view?.height}")
                onReady()
            } else {
                handler.postDelayed(this, 50)
            }
        }
    })
}
