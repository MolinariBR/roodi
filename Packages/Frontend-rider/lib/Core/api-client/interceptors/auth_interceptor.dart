import 'package:dio/dio.dart';

import '../../auth/token_storage.dart';

class AuthInterceptor extends Interceptor {
  AuthInterceptor({required TokenStorage tokenStorage})
    : _tokenStorage = tokenStorage;

  final TokenStorage _tokenStorage;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (_shouldSkip(options)) {
      handler.next(options);
      return;
    }

    final tokens = await _tokenStorage.read();
    if (tokens != null) {
      options.headers['Authorization'] =
          '${tokens.tokenType} ${tokens.accessToken}';
    }

    handler.next(options);
  }

  bool _shouldSkip(RequestOptions options) {
    if (options.extra['skipAuth'] == true) {
      return true;
    }

    const noAuthPaths = <String>{
      '/v1/auth/login',
      '/v1/auth/register',
      '/v1/auth/refresh',
      '/v1/auth/password/forgot',
      '/v1/auth/password/otp/verify',
      '/v1/auth/password/reset',
    };

    return noAuthPaths.contains(options.path);
  }
}
