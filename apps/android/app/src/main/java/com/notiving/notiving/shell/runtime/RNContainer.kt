package com.notiving.notiving.shell.runtime

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultReactActivityDelegate

class RNActivity : ReactActivity() {
    override fun getMainComponentName(): String =
        intent.getStringExtra(EXTRA_MODULE_NAME) ?: "notiving"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName)

    companion object {
        private const val EXTRA_MODULE_NAME = "rn_module_name"

        fun createIntent(context: Context, moduleName: String): Intent =
            Intent(context, RNActivity::class.java).apply {
                putExtra(EXTRA_MODULE_NAME, moduleName)
            }
    }
}

@Composable
fun RNContainer(moduleName: String, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    LaunchedEffect(moduleName) {
        context.startActivity(RNActivity.createIntent(context, moduleName))
    }
    Text(
        text = "Loading RN: $moduleName...",
        style = MaterialTheme.typography.bodyLarge,
        modifier = modifier,
    )
}
