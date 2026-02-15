import 'dart:convert';

class AuthTokens {
  const AuthTokens({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresInSeconds,
    required this.tokenType,
  });

  final String accessToken;
  final String refreshToken;
  final int expiresInSeconds;
  final String tokenType;

  factory AuthTokens.fromAuthResponse(Map<String, dynamic> response) {
    final data = response['data'];
    if (data is! Map<String, dynamic>) {
      throw const FormatException(
        'Invalid auth response payload: data is missing.',
      );
    }

    final accessToken = data['access_token'];
    final refreshToken = data['refresh_token'];
    final expiresIn = data['expires_in'];
    final tokenType = data['token_type'];

    if (accessToken is! String || accessToken.isEmpty) {
      throw const FormatException(
        'Invalid auth response payload: access_token.',
      );
    }
    if (refreshToken is! String || refreshToken.isEmpty) {
      throw const FormatException(
        'Invalid auth response payload: refresh_token.',
      );
    }
    if (expiresIn is! num) {
      throw const FormatException('Invalid auth response payload: expires_in.');
    }

    return AuthTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresInSeconds: expiresIn.toInt(),
      tokenType: tokenType is String && tokenType.isNotEmpty
          ? tokenType
          : 'Bearer',
    );
  }

  factory AuthTokens.fromJson(String rawJson) {
    final parsed = jsonDecode(rawJson);
    if (parsed is! Map<String, dynamic>) {
      throw const FormatException('Invalid token payload.');
    }

    final accessToken = parsed['access_token'];
    final refreshToken = parsed['refresh_token'];
    final expiresIn = parsed['expires_in'];
    final tokenType = parsed['token_type'];

    if (accessToken is! String ||
        refreshToken is! String ||
        expiresIn is! num ||
        tokenType is! String) {
      throw const FormatException('Invalid token payload.');
    }

    return AuthTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresInSeconds: expiresIn.toInt(),
      tokenType: tokenType,
    );
  }

  String toJson() {
    return jsonEncode(<String, dynamic>{
      'access_token': accessToken,
      'refresh_token': refreshToken,
      'expires_in': expiresInSeconds,
      'token_type': tokenType,
    });
  }
}
