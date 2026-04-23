package com.notiving.notiving.shell.router

import android.content.Intent
import android.net.Uri

object DeepLinkHandler {
    fun handle(intent: Intent, router: ShellRouter) {
        val uri = intent.data ?: return
        handle(uri, router)
    }

    fun handle(uri: Uri, router: ShellRouter) {
        val path = when (uri.scheme) {
            "notiving" -> "/${uri.host.orEmpty()}${uri.path.orEmpty()}"
            "https", "http" -> {
                if (uri.host != "notiving.com") return
                uri.path?.ifEmpty { "/" } ?: "/"
            }
            else -> return
        }

        if (path.startsWith("/oauth/callback")) {
            val token = uri.getQueryParameter("token") ?: return
            // TODO: persist token via SessionManager when available
            router.navigate("/profile")
            return
        }

        router.navigate(path)
    }
}
