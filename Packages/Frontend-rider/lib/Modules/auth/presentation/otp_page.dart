import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/api-client/api_error_parser.dart';
import '../../../Core/design-system/tokens/color_tokens.dart';
import '../../../Core/navigation/app_routes.dart';
import '../application/password_reset_flow_controller.dart';
import '../infra/auth_repository.dart';

class OtpPage extends ConsumerStatefulWidget {
  const OtpPage({super.key});

  @override
  ConsumerState<OtpPage> createState() => _OtpPageState();
}

class _OtpPageState extends ConsumerState<OtpPage> {
  static const _otpLength = 6;

  late final List<TextEditingController> _controllers;
  late final List<FocusNode> _focusNodes;

  Timer? _timer;
  bool _isSubmitting = false;
  bool _isResending = false;
  bool _isNoteError = false;
  int _remainingResendSeconds = 0;
  int _remainingExpirySeconds = 0;
  String _noteMessage = 'Codigo valido por 5 min.';

  @override
  void initState() {
    super.initState();
    _controllers = List<TextEditingController>.generate(
      _otpLength,
      (_) => TextEditingController(),
    );
    _focusNodes = List<FocusNode>.generate(_otpLength, (_) => FocusNode());
    _syncCountdownState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final flow = ref.watch(passwordResetFlowControllerProvider);

    if (!flow.hasChallenge || flow.email == null) {
      return _InvalidOtpFlowView(
        onBackToRecovery: () => context.go(AppRoutes.forgotPassword),
      );
    }

    final resendLabel = _remainingResendSeconds > 0
        ? 'Reenviar em ${_remainingResendSeconds}s'
        : 'Reenviar codigo';

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              child: Column(
                children: <Widget>[
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: ColorTokens.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: ColorTokens.primary.withValues(alpha: 0.2),
                      ),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(
                      Icons.password_rounded,
                      color: ColorTokens.primary,
                      size: 28,
                    ),
                  ),
                  const SizedBox(height: 18),
                  const Text(
                    'Validar codigo',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Digite o codigo de 6 digitos enviado para ${flow.email}.',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List<Widget>.generate(_otpLength, _buildOtpInput),
                  ),
                  const SizedBox(height: 14),
                  TextButton(
                    onPressed: (_isResending || _remainingResendSeconds > 0)
                        ? null
                        : _resendCode,
                    child: Text(
                      _isResending ? 'Reenviando...' : resendLabel,
                      style: const TextStyle(
                        color: ColorTokens.primary,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  Align(
                    alignment: Alignment.center,
                    child: Text(
                      _buildExpiryMessage(),
                      style: const TextStyle(
                        color: Color(0xFF64748B),
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.9,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.center,
                    child: Text(
                      _noteMessage,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: _isNoteError
                            ? const Color(0xFFFCA5A5)
                            : const Color(0xFF94A3B8),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        height: 1.35,
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _isSubmitting ? null : _verifyCode,
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size.fromHeight(48),
                        elevation: 0,
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.black,
                        disabledBackgroundColor: Colors.white.withValues(
                          alpha: 0.45,
                        ),
                        disabledForegroundColor: Colors.black87,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      icon: _isSubmitting
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.check_rounded, size: 18),
                      label: Text(
                        _isSubmitting ? 'Validando...' : 'Verificar',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.only(top: 16),
                    decoration: BoxDecoration(
                      border: Border(
                        top: BorderSide(
                          color: Colors.white.withValues(alpha: 0.1),
                        ),
                      ),
                    ),
                    child: Text.rich(
                      TextSpan(
                        text: 'Precisa alterar o e-mail? ',
                        style: const TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                        children: <InlineSpan>[
                          WidgetSpan(
                            alignment: PlaceholderAlignment.middle,
                            child: GestureDetector(
                              onTap: () => context.go(AppRoutes.forgotPassword),
                              child: const Text(
                                'Voltar',
                                style: TextStyle(
                                  color: ColorTokens.primary,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildOtpInput(int index) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: SizedBox(
        width: 44,
        child: Focus(
          onKeyEvent: (node, event) {
            if (event is! KeyDownEvent) {
              return KeyEventResult.ignored;
            }
            if (event.logicalKey == LogicalKeyboardKey.backspace &&
                _controllers[index].text.isEmpty &&
                index > 0) {
              _focusNodes[index - 1].requestFocus();
              _controllers[index - 1].clear();
              return KeyEventResult.handled;
            }
            return KeyEventResult.ignored;
          },
          child: TextField(
            controller: _controllers[index],
            focusNode: _focusNodes[index],
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            inputFormatters: <TextInputFormatter>[
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(1),
            ],
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
            decoration: InputDecoration(
              counterText: '',
              contentPadding: const EdgeInsets.symmetric(vertical: 10),
              filled: true,
              fillColor: Colors.white.withValues(alpha: 0.06),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: Colors.white.withValues(alpha: 0.16),
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: ColorTokens.primary.withValues(alpha: 0.7),
                ),
              ),
            ),
            onChanged: (value) {
              if (value.isNotEmpty && index < _otpLength - 1) {
                _focusNodes[index + 1].requestFocus();
              }
            },
          ),
        ),
      ),
    );
  }

  String _buildExpiryMessage() {
    if (_remainingExpirySeconds <= 0) {
      return 'Codigo expirado. Reenvie para continuar.';
    }

    final minutes = (_remainingExpirySeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (_remainingExpirySeconds % 60).toString().padLeft(2, '0');
    return 'Codigo valido por $minutes:$seconds';
  }

  void _syncCountdownState() {
    final flow = ref.read(passwordResetFlowControllerProvider);
    final now = DateTime.now();

    setState(() {
      _remainingResendSeconds = flow.resendInSeconds ?? 0;
      _remainingExpirySeconds = flow.challengeExpiresAt == null
          ? 0
          : flow.challengeExpiresAt!
                .difference(now)
                .inSeconds
                .clamp(0, 1 << 30);
      _isNoteError = false;
      _noteMessage = 'Digite os 6 digitos para continuar.';
    });
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        if (_remainingResendSeconds > 0) {
          _remainingResendSeconds -= 1;
        }
        if (_remainingExpirySeconds > 0) {
          _remainingExpirySeconds -= 1;
        }
      });
    });
  }

  String _typedCode() {
    return _controllers.map((controller) => controller.text).join();
  }

  void _clearOtpInputs() {
    for (final controller in _controllers) {
      controller.clear();
    }
    _focusNodes.first.requestFocus();
  }

  Future<void> _resendCode() async {
    final flow = ref.read(passwordResetFlowControllerProvider);
    final email = flow.email;
    if (email == null || email.isEmpty) {
      context.go(AppRoutes.forgotPassword);
      return;
    }

    if (_remainingResendSeconds > 0) {
      setState(() {
        _isNoteError = true;
        _noteMessage =
            'Aguarde $_remainingResendSeconds segundos para reenviar.';
      });
      return;
    }

    setState(() {
      _isResending = true;
      _isNoteError = false;
      _noteMessage = 'Reenviando codigo...';
    });

    try {
      final challenge = await ref
          .read(authRepositoryProvider)
          .forgotPassword(email: email);

      ref
          .read(passwordResetFlowControllerProvider.notifier)
          .setChallenge(
            email: challenge.email,
            challengeId: challenge.challengeId,
            expiresAt: challenge.expiresAt,
            resendInSeconds: challenge.resendInSeconds,
          );

      _clearOtpInputs();
      _syncCountdownState();
      _startTimer();
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _isNoteError = true;
        _noteMessage = mapApiErrorMessage(
          error,
          fallbackMessage: 'Falha ao reenviar codigo.',
        );
      });
    } finally {
      if (mounted) {
        setState(() {
          _isResending = false;
        });
      }
    }
  }

  Future<void> _verifyCode() async {
    final flow = ref.read(passwordResetFlowControllerProvider);
    if (!flow.hasChallenge || flow.challengeId == null) {
      context.go(AppRoutes.forgotPassword);
      return;
    }

    if (_remainingExpirySeconds <= 0) {
      setState(() {
        _isNoteError = true;
        _noteMessage = 'Codigo expirado. Reenvie para continuar.';
      });
      return;
    }

    final otp = _typedCode();
    if (otp.length != _otpLength) {
      setState(() {
        _isNoteError = true;
        _noteMessage = 'Digite os 6 digitos do codigo.';
      });
      return;
    }

    setState(() {
      _isSubmitting = true;
      _isNoteError = false;
      _noteMessage = 'Validando codigo...';
    });

    try {
      final result = await ref
          .read(authRepositoryProvider)
          .verifyOtp(challengeId: flow.challengeId!, otp: otp);

      ref
          .read(passwordResetFlowControllerProvider.notifier)
          .setResetToken(
            resetToken: result.resetToken,
            expiresAt: result.expiresAt,
          );

      if (!mounted) {
        return;
      }

      setState(() {
        _isNoteError = false;
        _noteMessage = 'Codigo validado com sucesso.';
      });
      context.go(AppRoutes.resetPassword);
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _isNoteError = true;
        _noteMessage = mapApiErrorMessage(
          error,
          fallbackMessage: 'Codigo invalido. Revise e tente novamente.',
        );
      });
      _clearOtpInputs();
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }
}

class _InvalidOtpFlowView extends StatelessWidget {
  const _InvalidOtpFlowView({required this.onBackToRecovery});

  final VoidCallback onBackToRecovery;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 360),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  const Icon(
                    Icons.warning_amber_rounded,
                    color: Color(0xFFFCD34D),
                    size: 42,
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Fluxo de OTP invalido',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Solicite um novo codigo para continuar.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: onBackToRecovery,
                      child: const Text('Voltar para recuperacao'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
