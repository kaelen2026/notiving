package com.notiving.notiving.shell

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import com.notiving.notiving.shell.router.ShellRouter
import com.notiving.notiving.shell.screens.PlaceholderScreen
import java.util.Locale

@Composable
fun ShellRootScreen(router: ShellRouter) {
    var selectedTab by rememberSaveable { mutableStateOf(router.config.tabs.first().key) }

    Scaffold(
        bottomBar = {
            NavigationBar {
                router.config.tabs.forEach { tab ->
                    NavigationBarItem(
                        selected = selectedTab == tab.key,
                        onClick = { selectedTab = tab.key },
                        icon = { Icon(iconForKey(tab.icon), contentDescription = tab.key) },
                        label = {
                            Text(tab.key.replaceFirstChar { it.titlecase(Locale.getDefault()) })
                        },
                    )
                }
            }
        },
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            PlaceholderScreen(tabKey = selectedTab)
        }
    }
}

private fun iconForKey(key: String): ImageVector = when (key) {
    "home" -> Icons.Outlined.Home
    "compass" -> Icons.Outlined.Search
    "bell" -> Icons.Outlined.Notifications
    "user" -> Icons.Outlined.Person
    else -> Icons.Outlined.Home
}
