import SwiftUI

struct RNContainer: UIViewRepresentable {
    let moduleName: String

    func makeUIView(context: Context) -> UIView {
        RNManager.shared.factory.rootViewFactory.view(withModuleName: moduleName)
    }

    func updateUIView(_ uiView: UIView, context: Context) {}
}
