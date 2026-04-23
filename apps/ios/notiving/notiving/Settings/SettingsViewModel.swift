import Combine
import Foundation

@MainActor
final class SettingsViewModel: ObservableObject {
    @Published var cacheSize: String = "Calculating..."
    @Published var isClearing = false
    @Published var showClearSuccess = false

    func calculateCacheSize() {
        Task {
            let size = await Self.computeCacheSize()
            cacheSize = size
        }
    }

    func clearCache() {
        guard !isClearing else { return }
        isClearing = true

        Task {
            let cache = URLCache.shared
            cache.removeAllCachedResponses()

            let tmpDir = FileManager.default.temporaryDirectory
            let cacheDir = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first

            for dir in [tmpDir, cacheDir].compactMap({ $0 }) {
                if let files = try? FileManager.default.contentsOfDirectory(
                    at: dir,
                    includingPropertiesForKeys: nil
                ) {
                    for file in files {
                        try? FileManager.default.removeItem(at: file)
                    }
                }
            }

            let newSize = await Self.computeCacheSize()
            cacheSize = newSize
            isClearing = false
            showClearSuccess = true
        }
    }

    private static func computeCacheSize() async -> String {
        await withCheckedContinuation { continuation in
            DispatchQueue.global(qos: .utility).async {
                var totalBytes: UInt64 = 0

                totalBytes += UInt64(URLCache.shared.currentDiskUsage)

                let fm = FileManager.default
                let dirs: [URL] = [
                    fm.temporaryDirectory,
                    fm.urls(for: .cachesDirectory, in: .userDomainMask).first,
                ].compactMap { $0 }

                for dir in dirs {
                    if let enumerator = fm.enumerator(
                        at: dir,
                        includingPropertiesForKeys: [.fileSizeKey],
                        options: [.skipsHiddenFiles]
                    ) {
                        for case let fileURL as URL in enumerator {
                            if let attrs = try? fileURL.resourceValues(forKeys: [.fileSizeKey]),
                               let size = attrs.fileSize
                            {
                                totalBytes += UInt64(size)
                            }
                        }
                    }
                }

                let result = ByteCountFormatter.string(fromByteCount: Int64(totalBytes), countStyle: .file)
                continuation.resume(returning: result)
            }
        }
    }
}
