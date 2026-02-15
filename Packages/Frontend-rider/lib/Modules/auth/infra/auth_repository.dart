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
