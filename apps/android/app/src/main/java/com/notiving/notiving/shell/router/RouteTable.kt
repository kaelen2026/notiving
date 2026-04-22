package com.notiving.notiving.shell.router

import android.content.Context
import org.json.JSONObject

data class RouteEntry(
    val pattern: String,
    val runtime: String,
    val screen: String? = null,
    val module: String? = null,
    val url: String? = null,
)

data class TabEntry(
    val key: String,
    val route: String,
    val icon: String,
)

data class RouteTableConfig(
    val version: Int,
    val routes: List<RouteEntry>,
    val tabs: List<TabEntry>,
)

object RouteTableLoader {
    fun load(context: Context): RouteTableConfig {
        val json = context.assets.open("route-table.json")
            .bufferedReader().use { it.readText() }
        val obj = JSONObject(json)

        val routes = obj.getJSONArray("routes").let { arr ->
            (0 until arr.length()).map { i ->
                val r = arr.getJSONObject(i)
                RouteEntry(
                    pattern = r.getString("pattern"),
                    runtime = r.getString("runtime"),
                    screen = r.optString("screen").ifEmpty { null },
                    module = r.optString("module").ifEmpty { null },
                    url = r.optString("url").ifEmpty { null },
                )
            }
        }

        val tabs = obj.getJSONArray("tabs").let { arr ->
            (0 until arr.length()).map { i ->
                val t = arr.getJSONObject(i)
                TabEntry(
                    key = t.getString("key"),
                    route = t.getString("route"),
                    icon = t.getString("icon"),
                )
            }
        }

        return RouteTableConfig(
            version = obj.getInt("version"),
            routes = routes,
            tabs = tabs,
        )
    }
}
