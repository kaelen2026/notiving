package com.notiving.notiving.shell.runtime

enum class RuntimeType {
    NATIVE,
    RN,
    H5;

    companion object {
        fun from(value: String): RuntimeType = when (value) {
            "rn" -> RN
            "h5" -> H5
            else -> NATIVE
        }
    }
}
