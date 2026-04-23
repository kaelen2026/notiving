import Combine
import SwiftUI

struct SettingsScreen: View {
    @State private var settings = SettingsManager.shared
    @StateObject private var viewModel = SettingsViewModel()

    var body: some View {
        List {
            appearanceSection
            fontSizeSection
            cacheSection
        }
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.large)
        .task {
            viewModel.calculateCacheSize()
        }
        .alert("Cache Cleared", isPresented: $viewModel.showClearSuccess) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("All cached data has been removed.")
        }
    }

    // MARK: - Appearance

    private var appearanceSection: some View {
        Section {
            ForEach(AppearanceMode.allCases, id: \.self) { (mode: AppearanceMode) in
                Button {
                    withAnimation { settings.appearanceMode = mode }
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: mode.iconName)
                            .frame(width: 24)
                            .foregroundStyle(.primary)
                        Text(mode.displayName)
                            .foregroundStyle(.primary)
                        Spacer()
                        if settings.appearanceMode == mode {
                            Image(systemName: "checkmark")
                                .foregroundStyle(.tint)
                                .fontWeight(.semibold)
                        }
                    }
                }
            }
        } header: {
            Text("Appearance")
        } footer: {
            Text("Choose how the app looks. \"Follow System\" uses your device setting.")
        }
    }

    // MARK: - Font Size

    private var fontSizeSection: some View {
        Section {
            ForEach(FontSizeLevel.allCases, id: \.self) { (level: FontSizeLevel) in
                Button {
                    withAnimation { settings.fontSizeLevel = level }
                } label: {
                    HStack(spacing: 12) {
                        Text("Aa")
                            .font(.system(size: level.previewSize, weight: .medium))
                            .frame(width: 24)
                            .foregroundStyle(.primary)
                        Text(level.displayName)
                            .foregroundStyle(.primary)
                        Spacer()
                        if settings.fontSizeLevel == level {
                            Image(systemName: "checkmark")
                                .foregroundStyle(.tint)
                                .fontWeight(.semibold)
                        }
                    }
                }
            }

            previewCard
        } header: {
            Text("Font Size")
        }
    }

    private var previewCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Preview")
                .font(.system(size: 13))
                .foregroundStyle(.secondary)
            Text("This is how text will look with the selected size.")
                .font(.system(size: settings.fontSizeLevel.previewSize))
        }
        .padding(.vertical, 4)
    }

    // MARK: - Cache

    private var cacheSection: some View {
        Section {
            HStack {
                Label("Cache Size", systemImage: "internaldrive")
                Spacer()
                Text(viewModel.cacheSize)
                    .foregroundStyle(.secondary)
            }

            Button(role: .destructive) {
                viewModel.clearCache()
            } label: {
                HStack {
                    Label("Clear Cache", systemImage: "trash")
                    Spacer()
                    if viewModel.isClearing {
                        ProgressView()
                    }
                }
            }
            .disabled(viewModel.isClearing)
        } header: {
            Text("Storage")
        } footer: {
            Text("Clearing the cache will remove temporary files. Your account data won't be affected.")
        }
    }
}
