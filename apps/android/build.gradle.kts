buildscript {
    extra.apply {
        set("buildToolsVersion", "36.1.0")
        set("minSdkVersion", 28)
        set("compileSdkVersion", 36)
        set("targetSdkVersion", 36)
        set("ndkVersion", "27.1.12297006")
        set("kotlinVersion", "2.2.10")
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
    }
}

plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.compose) apply false
}

apply(plugin = "com.facebook.react.rootproject")
