import 'package:flutter_riverpod/flutter_riverpod.dart';

final passwordResetFlowControllerProvider =
    NotifierProvider<PasswordResetFlowController, PasswordResetFlowState>(
      PasswordResetFlowController.new,
    );

class PasswordResetFlowState {
  const PasswordResetFlowState({
    this.email,
    this.challengeId,
    this.challengeExpiresAt,
    this.resendInSeconds,
    this.resetToken,
    this.resetTokenExpiresAt,
  });

  const PasswordResetFlowState.empty()
    : email = null,
      challengeId = null,
      challengeExpiresAt = null,
      resendInSeconds = null,
      resetToken = null,
      resetTokenExpiresAt = null;

  final String? email;
  final String? challengeId;
  final DateTime? challengeExpiresAt;
  final int? resendInSeconds;
  final String? resetToken;
  final DateTime? resetTokenExpiresAt;

  bool get hasChallenge => challengeId != null && challengeId!.isNotEmpty;

  bool get hasResetToken => resetToken != null && resetToken!.isNotEmpty;

  PasswordResetFlowState copyWith({
    String? email,
    String? challengeId,
    DateTime? challengeExpiresAt,
    int? resendInSeconds,
    String? resetToken,
    DateTime? resetTokenExpiresAt,
    bool clearResetToken = false,
  }) {
    return PasswordResetFlowState(
      email: email ?? this.email,
      challengeId: challengeId ?? this.challengeId,
      challengeExpiresAt: challengeExpiresAt ?? this.challengeExpiresAt,
      resendInSeconds: resendInSeconds ?? this.resendInSeconds,
      resetToken: clearResetToken ? null : resetToken ?? this.resetToken,
      resetTokenExpiresAt: clearResetToken
          ? null
          : resetTokenExpiresAt ?? this.resetTokenExpiresAt,
    );
  }
}

class PasswordResetFlowController extends Notifier<PasswordResetFlowState> {
  @override
  PasswordResetFlowState build() => const PasswordResetFlowState.empty();

  void setChallenge({
    required String email,
    required String challengeId,
    required DateTime expiresAt,
    required int resendInSeconds,
  }) {
    state = state.copyWith(
      email: email.trim().toLowerCase(),
      challengeId: challengeId,
      challengeExpiresAt: expiresAt,
      resendInSeconds: resendInSeconds,
      clearResetToken: true,
    );
  }

  void setResetToken({
    required String resetToken,
    required DateTime expiresAt,
  }) {
    state = state.copyWith(
      resetToken: resetToken,
      resetTokenExpiresAt: expiresAt,
    );
  }

  void clear() {
    state = const PasswordResetFlowState.empty();
  }
}
