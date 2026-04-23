import Foundation
import Observation
import SwiftUI

enum AppearanceMode: String, CaseIterable {
    case system
    case light
    case dark

    var displayName: String {
        switch self {
        case .system: return "Follow System"
        case .light: return "Light"
        case .dark: return "Dark"
        }
    }

    var colorScheme: ColorScheme? {
        switch self {
        case .system: return nil
        case .light: return .light
        case .dark: return .dark
        }
    }

    var iconName: String {
        switch self {
        case .system: return "circle.lefthalf.filled"
        case .light: return "sun.max"
        case .dark: return "moon"
        }
    }
}

enum FontSizeLevel: String, CaseIterable {
    case small
    case medium
    case large
    case extraLarge

    var displayName: String {
        switch self {
        case .small: return "Small"
        case .medium: return "Medium"
        case .large: return "Large"
        case .extraLarge: return "Extra Large"
        }
    }

    var scale: CGFloat {
        switch self {
        case .small: return 0.85
        case .medium: return 1.0
        case .large: return 1.15
        case .extraLarge: return 1.3
        }
    }

    var previewSize: CGFloat {
        switch self {
        case .small: return 14
        case .medium: return 17
        case .large: return 20
        case .extraLarge: return 23
        }
    }
}

@Observable
final class SettingsManager {
    static let shared = SettingsManager()

    private let defaults = UserDefaults.standard
    private let appearanceKey = "notiving_appearance_mode"
    private let fontSizeKey = "notiving_font_size_level"

    var appearanceMode: AppearanceMode {
        didSet { defaults.set(appearanceMode.rawValue, forKey: appearanceKey) }
    }

    var fontSizeLevel: FontSizeLevel {
        didSet { defaults.set(fontSizeLevel.rawValue, forKey: fontSizeKey) }
    }

    private init() {
        let savedAppearance = defaults.string(forKey: appearanceKey) ?? ""
        self.appearanceMode = AppearanceMode(rawValue: savedAppearance) ?? .system

        let savedFontSize = defaults.string(forKey: fontSizeKey) ?? ""
        self.fontSizeLevel = FontSizeLevel(rawValue: savedFontSize) ?? .medium
    }
}
