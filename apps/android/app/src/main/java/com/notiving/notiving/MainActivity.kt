package com.notiving.notiving

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.notiving.notiving.shell.ShellRootScreen
import com.notiving.notiving.shell.router.ShellRouter
import com.notiving.notiving.ui.theme.NotivingTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val router = ShellRouter(this)
        setContent {
            NotivingTheme {
                ShellRootScreen(router)
            }
        }
    }
}
