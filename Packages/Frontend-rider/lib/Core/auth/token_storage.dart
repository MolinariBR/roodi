import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'auth_tokens.dart';

final tokenStorageProvider = Provider<TokenStorage>((ref) {
  return TokenStorage();
});

class TokenStorage {
  TokenStorage({FlutterSecureStorage? secureStorage})
    : _secureStorage =
          secureStorage ??
          const FlutterSecureStorage(
            aOptions: AndroidOptions(encryptedSharedPreferences: true),
          );

  static const _tokensKey = 'roodi.auth.tokens';

  final FlutterSecureStorage _secureStorage;

  Future<AuthTokens?> read() async {
    final rawValue = await _secureStorage.read(key: _tokensKey);
    if (rawValue == null || rawValue.isEmpty) {
      return null;
    }

    try {
      return AuthTokens.fromJson(rawValue);
    } catch (_) {
      await clear();
      return null;
    }
  }

  Future<void> write(AuthTokens tokens) async {
    await _secureStorage.write(key: _tokensKey, value: tokens.toJson());
  }

  Future<void> clear() async {
    await _secureStorage.delete(key: _tokensKey);
  }
}
