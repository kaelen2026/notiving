package com.notiving.notiving.shell.router

import android.content.Context

class ShellRouter(context: Context) {
    val config: RouteTableConfig = RouteTableLoader.load(context)

    fun resolve(path: String): RouteEntry? =
        config.routes.firstOrNull { it.pattern == path }
}
