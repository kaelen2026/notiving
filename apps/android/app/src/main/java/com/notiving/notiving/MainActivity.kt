package com.notiving.notiving

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.notiving.notiving.shell.ShellRootScreen
import com.notiving.notiving.shell.router.DeepLinkHandler
import com.notiving.notiving.shell.router.ShellRouter
import com.notiving.notiving.ui.theme.NotivingTheme

class MainActivity : ComponentActivity() {
    private lateinit var router: ShellRouter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        router = ShellRouter.init(this)
        setContent {
            NotivingTheme {
                ShellRootScreen(router)
            }
        }
        DeepLinkHandler.handle(intent, router)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        DeepLinkHandler.handle(intent, router)
    }
}
