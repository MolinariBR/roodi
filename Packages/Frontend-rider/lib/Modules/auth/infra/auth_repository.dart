import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../Core/api-client/api_client.dart';
import '../../../Core/auth/auth_tokens.dart';
import '../../../Core/auth/token_storage.dart';
import '../../../Core/state/session_state.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    dio: ref.read(baseDioProvider),
    tokenStorage: ref.read(tokenStorageProvider),
  );
});

class AuthRepository {
  AuthRepository({required Dio dio, required TokenStorage tokenStorage})
    : _dio = dio,
      _tokenStorage = tokenStorage;

  final Dio _dio;
  final TokenStorage _tokenStorage;

  Future<AuthTokens?> readStoredTokens() {
    return _tokenStorage.read();
  }

  Future<AuthTokens> login({
    required String email,
    required String password,
    required UserContext context,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/auth/login',
      data: <String, dynamic>{
        'email': email.trim(),
        'password': password,
        'role': _roleForContext(context),
      },
      options: Options(
        extra: const <String, dynamic>{'skipAuth': true, 'skipRefresh': true},
      ),
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de login vazia.');
    }

    final tokens = AuthTokens.fromAuthResponse(body);
    await _tokenStorage.write(tokens);
    return tokens;
  }

  Future<AuthTokens> register({
    required String name,
    required String email,
    required String password,
    required UserContext context,
    String? phoneNumber,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/auth/register',
      data: <String, dynamic>{
        'name': name.trim(),
        'email': email.trim(),
        'password': password,
        'role': _roleForContext(context),
        if (phoneNumber != null && phoneNumber.trim().isNotEmpty)
          'phone_number': phoneNumber.trim(),
      },
      options: Options(
        extra: const <String, dynamic>{'skipAuth': true, 'skipRefresh': true},
      ),
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de cadastro vazia.');
    }

    final tokens = AuthTokens.fromAuthResponse(body);
    await _tokenStorage.write(tokens);
    return tokens;
  }

  Future<OtpChallengeData> forgotPassword({required String email}) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/auth/password/forgot',
      data: <String, dynamic>{'email': email.trim()},
      options: Options(
        extra: const <String, dynamic>{'skipAuth': true, 'skipRefresh': true},
      ),
    );

    final body = response.data;
    if (body == null || body['data'] is! Map<String, dynamic>) {
      throw const FormatException('Resposta de OTP invalida.');
    }

    final data = body['data'] as Map<String, dynamic>;
    final challengeId = data['challenge_id'];
    final expiresAt = data['expires_at'];
    final resendInSeconds = data['resend_in_seconds'];
    if (challengeId is! String ||
        expiresAt is! String ||
        resendInSeconds is! num) {
      throw const FormatException('Resposta de OTP invalida.');
    }

    return OtpChallengeData(
      challengeId: challengeId,
      email: email.trim().toLowerCase(),
      expiresAt: DateTime.parse(expiresAt),
      resendInSeconds: resendInSeconds.toInt(),
    );
  }

  Future<OtpVerifyData> verifyOtp({
    required String challengeId,
    required String otp,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/auth/password/otp/verify',
      data: <String, dynamic>{'challenge_id': challengeId, 'otp': otp},
      options: Options(
        extra: const <String, dynamic>{'skipAuth': true, 'skipRefresh': true},
      ),
    );

    final body = response.data;
    if (body == null || body['data'] is! Map<String, dynamic>) {
      throw const FormatException('Resposta de verificacao OTP invalida.');
    }

    final data = body['data'] as Map<String, dynamic>;
    final resetToken = data['reset_token'];
    final expiresAt = data['expires_at'];
    if (resetToken is! String || expiresAt is! String) {
      throw const FormatException('Resposta de verificacao OTP invalida.');
    }

    return OtpVerifyData(
      resetToken: resetToken,
      expiresAt: DateTime.parse(expiresAt),
    );
  }

  Future<void> resetPassword({
    required String resetToken,
    required String newPassword,
  }) async {
    await _dio.post<void>(
      '/v1/auth/password/reset',
      data: <String, dynamic>{
        'reset_token': resetToken,
        'new_password': newPassword,
      },
      options: Options(
        extra: const <String, dynamic>{'skipAuth': true, 'skipRefresh': true},
      ),
    );
  }

  Future<void> logout() async {
    final tokens = await _tokenStorage.read();
    if (tokens == null) {
      return;
    }

    try {
      await _dio.post<Map<String, dynamic>>(
        '/v1/auth/logout',
        data: <String, dynamic>{'refresh_token': tokens.refreshToken},
        options: Options(extra: const <String, dynamic>{'skipRefresh': true}),
      );
    } catch (_) {
      // Ignora erro de rede/logout remoto e limpa sessao local.
    } finally {
      await _tokenStorage.clear();
    }
  }

  Future<void> clearSession() {
    return _tokenStorage.clear();
  }

  String _roleForContext(UserContext context) {
    switch (context) {
      case UserContext.rider:
        return 'rider';
      case UserContext.commerce:
        return 'commerce';
    }
  }
}

class OtpChallengeData {
  const OtpChallengeData({
    required this.challengeId,
    required this.email,
    required this.expiresAt,
    required this.resendInSeconds,
  });

  final String challengeId;
  final String email;
  final DateTime expiresAt;
  final int resendInSeconds;
}

class OtpVerifyData {
  const OtpVerifyData({required this.resetToken, required this.expiresAt});

  final String resetToken;
  final DateTime expiresAt;
}
