import SwiftUI

struct LoginScreen: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = LoginViewModel()
    var onLoginSuccess: (User, String) -> Void

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: NVSpacing.xxl) {
                    headerView
                    oauthSection
                    divider
                    modePicker
                    formFields
                    submitButton
                    errorMessage
                }
                .padding(.horizontal, NVSpacing.xxl)
                .padding(.top, NVSpacing.xxxl)
            }
            .background(Color.nvBackgroundSecondary)
            .navigationTitle("Log In")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Color.nvForegroundSecondary)
                }
            }
        }
    }

    // MARK: - Header

    private var headerView: some View {
        VStack(spacing: NVSpacing.sm) {
            Image(systemName: "person.circle.fill")
                .font(.system(size: 56))
                .foregroundStyle(Color.nvPrimary)
            Text("Welcome Back")
                .font(.nv2XL.bold())
                .foregroundStyle(Color.nvForeground)
            Text("Log in to access your profile")
                .font(.nvSM)
                .foregroundStyle(Color.nvForegroundSecondary)
        }
    }

    // MARK: - OAuth

    private var oauthSection: some View {
        VStack(spacing: NVSpacing.md) {
            OAuthButton(provider: .apple, isLoading: viewModel.isOAuthLoading) {
                Task {
                    if let (user, token) = await viewModel.signInWithApple() {
                        onLoginSuccess(user, token)
                        dismiss()
                    }
                }
            }
            OAuthButton(provider: .google, isLoading: viewModel.isOAuthLoading) {
                Task {
                    if let (user, token) = await viewModel.signInWithGoogle() {
                        onLoginSuccess(user, token)
                        dismiss()
                    }
                }
            }
        }
    }

    private var divider: some View {
        HStack {
            Rectangle()
                .fill(Color.nvBorder)
                .frame(height: 1)
            Text("or")
                .font(.nvSM)
                .foregroundStyle(Color.nvForegroundTertiary)
            Rectangle()
                .fill(Color.nvBorder)
                .frame(height: 1)
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
        VStack(spacing: NVSpacing.lg) {
            emailField

            switch viewModel.mode {
            case .password:
                passwordField
            case .otp:
                if viewModel.otpStep == .code {
                    codeSection
                }
            }
        }
    }

    private var emailField: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Email")
                .font(.nvSM.weight(.medium))
                .foregroundStyle(Color.nvForeground)
            TextField("your@email.com", text: $viewModel.email)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
                .disabled(viewModel.mode == .otp && viewModel.otpStep == .code)
                .padding(NVSpacing.md)
                .background(Color.nvBackground)
                .clipShape(RoundedRectangle(cornerRadius: NVRadius.md))
                .overlay(
                    RoundedRectangle(cornerRadius: NVRadius.md)
                        .stroke(Color.nvBorder, lineWidth: 1)
                )
        }
    }

    private var passwordField: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Password")
                .font(.nvSM.weight(.medium))
                .foregroundStyle(Color.nvForeground)
            SecureField("Password", text: $viewModel.password)
                .textContentType(.password)
                .padding(NVSpacing.md)
                .background(Color.nvBackground)
                .clipShape(RoundedRectangle(cornerRadius: NVRadius.md))
                .overlay(
                    RoundedRectangle(cornerRadius: NVRadius.md)
                        .stroke(Color.nvBorder, lineWidth: 1)
                )
        }
    }

    private var codeSection: some View {
        VStack(spacing: NVSpacing.md) {
            HStack {
                Text("Verification Code")
                    .font(.nvSM.weight(.medium))
                    .foregroundStyle(Color.nvForeground)
                Spacer()
                Button("Change email") {
                    viewModel.changeEmail()
                }
                .font(.nvXS)
                .foregroundStyle(Color.nvPrimary)
            }

            Text("Sent to \(viewModel.email.trimmingCharacters(in: .whitespaces))")
                .font(.nvXS)
                .foregroundStyle(Color.nvForegroundSecondary)
                .frame(maxWidth: .infinity, alignment: .leading)

            OTPCodeField(code: $viewModel.codeText)

            resendButton
        }
    }

    private var resendButton: some View {
        Group {
            if viewModel.countdown > 0 {
                Text("Resend in \(viewModel.countdown)s")
                    .font(.nvXS)
                    .foregroundStyle(Color.nvForegroundTertiary)
            } else {
                Button {
                    Task { await viewModel.sendCode() }
                } label: {
                    Text("Resend code")
                        .font(.nvXS)
                        .foregroundStyle(Color.nvPrimary)
                }
                .disabled(viewModel.isLoading)
            }
        }
    }

    // MARK: - Submit

    private var submitButton: some View {
        BrandButton(
            title: viewModel.submitButtonTitle,
            isLoading: viewModel.isLoading,
            isEnabled: viewModel.isFormValid
        ) {
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
        }
    }

    // MARK: - Error

    @ViewBuilder
    private var errorMessage: some View {
        if let error = viewModel.error {
            Text(error)
                .font(.nvSM)
                .foregroundStyle(Color.nvDestructive)
                .multilineTextAlignment(.center)
        }
    }
}
