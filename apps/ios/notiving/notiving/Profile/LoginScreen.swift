import Combine
import SwiftUI

struct LoginScreen: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = LoginViewModel()
    var onLoginSuccess: (User, String) -> Void

    @FocusState private var focusedCodeIndex: Int?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 32) {
                    headerView
                    modePicker
                    formFields
                    loginButton
                    errorMessage
                }
                .padding(.horizontal, 24)
                .padding(.top, 40)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Log In")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    // MARK: - Header

    private var headerView: some View {
        VStack(spacing: 8) {
            Image(systemName: "person.circle.fill")
                .font(.system(size: 64))
                .foregroundStyle(.tint)
            Text("Welcome Back")
                .font(.title2.bold())
            Text("Log in to access your profile")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    // MARK: - Mode Picker

    private var modePicker: some View {
        Picker("Login Mode", selection: Binding(
            get: { viewModel.mode },
            set: { viewModel.switchMode($0) }
        )) {
            ForEach(LoginMode.allCases) { mode in
                Text(mode.rawValue).tag(mode)
            }
        }
        .pickerStyle(.segmented)
    }

    // MARK: - Form

    private var formFields: some View {
        VStack(spacing: 16) {
            emailField

            switch viewModel.mode {
            case .password:
                passwordField
            case .otp:
                if viewModel.otpStep == .code {
                    codeField
                }
            }
        }
    }

    private var emailField: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Email")
                .font(.subheadline.weight(.medium))
            TextField("your@email.com", text: $viewModel.email)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
                .disabled(viewModel.mode == .otp && viewModel.otpStep == .code)
                .padding(12)
                .background(Color(.systemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 10))
        }
    }

    private var passwordField: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Password")
                .font(.subheadline.weight(.medium))
            SecureField("Password", text: $viewModel.password)
                .textContentType(.password)
                .padding(12)
                .background(Color(.systemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 10))
        }
    }

    private var codeField: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Verification Code")
                    .font(.subheadline.weight(.medium))
                Spacer()
                Button("Change email") {
                    viewModel.changeEmail()
                }
                .font(.caption)
                .foregroundStyle(.tint)
            }

            Text("Sent to \(viewModel.email.trimmingCharacters(in: .whitespaces))")
                .font(.caption)
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 8) {
                ForEach(0..<6, id: \.self) { index in
                    TextField("", text: Binding(
                        get: { viewModel.code[index] },
                        set: { newValue in
                            handleCodeInput(index: index, value: newValue)
                        }
                    ))
                    .keyboardType(.numberPad)
                    .textContentType(.oneTimeCode)
                    .multilineTextAlignment(.center)
                    .font(.title2.weight(.semibold))
                    .frame(height: 48)
                    .background(Color(.systemBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .focused($focusedCodeIndex, equals: index)
                }
            }
            .onAppear {
                focusedCodeIndex = 0
            }

            resendButton
        }
    }

    private var resendButton: some View {
        Group {
            if viewModel.countdown > 0 {
                Text("Resend in \(viewModel.countdown)s")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            } else {
                Button {
                    Task { await viewModel.sendCode() }
                } label: {
                    Text("Resend code")
                        .font(.caption)
                        .foregroundStyle(.tint)
                }
                .disabled(viewModel.isLoading)
            }
        }
    }

    // MARK: - Button

    private var loginButton: some View {
        Button {
            Task {
                switch viewModel.mode {
                case .password:
                    if let (user, token) = await viewModel.login() {
                        onLoginSuccess(user, token)
                        dismiss()
                    }
                case .otp:
                    switch viewModel.otpStep {
                    case .email:
                        await viewModel.sendCode()
                    case .code:
                        if let (user, token) = await viewModel.verifyCode() {
                            onLoginSuccess(user, token)
                            dismiss()
                        }
                    }
                }
            }
        } label: {
            HStack {
                if viewModel.isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text(viewModel.submitButtonTitle)
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(viewModel.isFormValid ? Color.accentColor : Color.gray.opacity(0.3))
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .disabled(!viewModel.isFormValid || viewModel.isLoading)
    }

    // MARK: - Error

    @ViewBuilder
    private var errorMessage: some View {
        if let error = viewModel.error {
            Text(error)
                .font(.footnote)
                .foregroundStyle(.red)
                .multilineTextAlignment(.center)
        }
    }

    // MARK: - Code Input Helpers

    private func handleCodeInput(index: Int, value: String) {
        let filtered = value.filter { $0.isNumber }

        if filtered.count > 1 {
            // Paste handling
            let chars = Array(filtered.prefix(6))
            for i in 0..<6 {
                viewModel.code[i] = i < chars.count ? String(chars[i]) : ""
            }
            focusedCodeIndex = min(chars.count, 5)
            return
        }

        if filtered.isEmpty && viewModel.code[index].isEmpty && index > 0 {
            // Backspace on empty → move back
            focusedCodeIndex = index - 1
            return
        }

        viewModel.code[index] = String(filtered.prefix(1))

        if !filtered.isEmpty && index < 5 {
            focusedCodeIndex = index + 1
        }
    }
}
