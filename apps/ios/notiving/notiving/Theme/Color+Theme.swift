import SwiftUI
import UIKit

// MARK: - Palette (raw hex values from tokens.json)

private enum NVPalette {
    enum Orange {
        static let _50 = "#fff7ed"
        static let _100 = "#ffedd5"
        static let _200 = "#fed7aa"
        static let _300 = "#fdba74"
        static let _400 = "#fb923c"
        static let _500 = "#f97316"
        static let _600 = "#ea580c"
        static let _700 = "#c2410c"
        static let _800 = "#9a3412"
        static let _900 = "#7c2d12"
        static let _950 = "#431407"
    }

    enum Gray {
        static let _50 = "#fafafa"
        static let _100 = "#f5f5f5"
        static let _200 = "#e5e5e5"
        static let _300 = "#d4d4d4"
        static let _400 = "#a3a3a3"
        static let _500 = "#737373"
        static let _600 = "#525252"
        static let _700 = "#404040"
        static let _800 = "#262626"
        static let _900 = "#171717"
        static let _950 = "#0a0a0a"
    }

    enum Status {
        static let destructiveLight = "#ef4444"
        static let destructiveDark = "#dc2626"
        static let successLight = "#22c55e"
        static let successDark = "#16a34a"
        static let warningLight = "#eab308"
        static let warningDark = "#ca8a04"
    }
}

// MARK: - UIColor hex initializer

private extension UIColor {
    convenience init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        let scanner = Scanner(string: hex)
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        self.init(
            red: CGFloat((rgb >> 16) & 0xFF) / 255,
            green: CGFloat((rgb >> 8) & 0xFF) / 255,
            blue: CGFloat(rgb & 0xFF) / 255,
            alpha: 1
        )
    }
}

// MARK: - Adaptive color helper

private extension Color {
    init(light: String, dark: String) {
        self.init(UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor(hex: dark)
                : UIColor(hex: light)
        })
    }
}

// MARK: - Semantic colors

extension Color {
    static let nvBackground = Color(light: "#ffffff", dark: NVPalette.Gray._950)
    static let nvBackgroundSecondary = Color(light: NVPalette.Gray._50, dark: NVPalette.Gray._900)
    static let nvBackgroundTertiary = Color(light: NVPalette.Gray._100, dark: NVPalette.Gray._800)
    static let nvSurface = Color(light: "#ffffff", dark: NVPalette.Gray._900)

    static let nvForeground = Color(light: NVPalette.Gray._900, dark: NVPalette.Gray._50)
    static let nvForegroundSecondary = Color(light: NVPalette.Gray._600, dark: NVPalette.Gray._400)
    static let nvForegroundTertiary = Color(light: NVPalette.Gray._400, dark: NVPalette.Gray._600)

    static let nvBorder = Color(light: NVPalette.Gray._200, dark: NVPalette.Gray._800)
    static let nvBorderSecondary = Color(light: NVPalette.Gray._100, dark: NVPalette.Gray._700)

    static let nvPrimary = Color(UIColor(hex: NVPalette.Orange._500))
    static let nvPrimaryHover = Color(light: NVPalette.Orange._600, dark: NVPalette.Orange._400)
    static let nvPrimaryActive = Color(light: NVPalette.Orange._700, dark: NVPalette.Orange._300)
    static let nvPrimaryMuted = Color(light: NVPalette.Orange._50, dark: NVPalette.Orange._950)
    static let nvPrimaryForeground = Color.white

    static let nvDestructive = Color(
        light: NVPalette.Status.destructiveLight,
        dark: NVPalette.Status.destructiveDark
    )
    static let nvSuccess = Color(
        light: NVPalette.Status.successLight,
        dark: NVPalette.Status.successDark
    )
    static let nvWarning = Color(
        light: NVPalette.Status.warningLight,
        dark: NVPalette.Status.warningDark
    )

    static let nvOverlay = Color(UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
            ? UIColor.black.withAlphaComponent(0.6)
            : UIColor.black.withAlphaComponent(0.4)
    })
}
