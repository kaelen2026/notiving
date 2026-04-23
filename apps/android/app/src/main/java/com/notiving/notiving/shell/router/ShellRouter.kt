package com.notiving.notiving.shell.router

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class ShellRouter(context: Context) {
    val config: RouteTableConfig = RouteTableLoader.load(context)

    private val _selectedTab = MutableStateFlow(config.tabs.first().key)
    val selectedTab: StateFlow<String> = _selectedTab

    fun resolve(path: String): RouteEntry? =
        config.routes.firstOrNull { it.pattern == path }

    fun navigate(url: String) {
        val tab = config.tabs.firstOrNull { it.route == url }
        if (tab != null) {
            _selectedTab.value = tab.key
        }
    }

    fun back() {
        // Tab-level: no-op for now. Push navigation in Phase 4.
    }

    fun setTitle(title: String) {
        // Phase 4: update native nav bar title
    }

    fun setNavBarHidden(hidden: Boolean) {
        // Phase 4: show/hide native nav bar
    }

    companion object {
        var instance: ShellRouter? = null
            private set

        fun init(context: Context): ShellRouter {
            val router = ShellRouter(context)
            instance = router
            return router
        }
    }
}
