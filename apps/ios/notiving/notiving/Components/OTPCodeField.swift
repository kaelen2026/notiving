import SwiftUI

struct OTPCodeField: View {
    @Binding var code: String
    var length: Int = 6
    @FocusState private var isFocused: Bool

    var body: some View {
        ZStack {
            TextField("", text: $code)
                .keyboardType(.numberPad)
                .textContentType(.oneTimeCode)
                .focused($isFocused)
                .opacity(0)
                .frame(width: 1, height: 1)

            HStack(spacing: NVSpacing.sm) {
                ForEach(0..<length, id: \.self) { index in
                    let char = index < code.count
                        ? String(code[code.index(code.startIndex, offsetBy: index)])
                        : ""
                    Text(char)
                        .font(.title2.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                        .background(Color.nvBackground)
                        .clipShape(RoundedRectangle(cornerRadius: NVRadius.md))
                        .overlay(
                            RoundedRectangle(cornerRadius: NVRadius.md)
                                .stroke(
                                    index == code.count && isFocused
                                        ? Color.nvPrimary
                                        : Color.nvBorder,
                                    lineWidth: index == code.count && isFocused ? 2 : 1
                                )
                        )
                }
            }
            .contentShape(Rectangle())
            .onTapGesture {
                isFocused = true
            }
        }
        .onAppear {
            isFocused = true
        }
    }
}
