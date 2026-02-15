import 'dart:async';

import 'package:dio/dio.dart';

import '../../auth/auth_tokens.dart';
import '../../auth/token_storage.dart';

class RefreshInterceptor extends Interceptor {
  RefreshInterceptor({
    required Dio client,
    required Dio refreshClient,
    required TokenStorage tokenStorage,
  }) : _client = client,
       _refreshClient = refreshClient,
       _tokenStorage = tokenStorage;

  final Dio _client;
  final Dio _refreshClient;
  final TokenStorage _tokenStorage;

  Future<AuthTokens?>? _pendingRefresh;

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (!_canTryRefresh(err)) {
      handler.next(err);
      return;
    }

    final refreshedTokens = await _refreshTokens();
    if (refreshedTokens == null) {
      handler.next(err);
      return;
    }

    try {
      final retryResponse = await _retryRequest(
        err.requestOptions,
        refreshedTokens,
      );
      handler.resolve(retryResponse);
    } on DioException catch (retryError) {
      handler.next(retryError);
    } catch (_) {
      handler.next(err);
    }
  }

  bool _canTryRefresh(DioException err) {
    final requestOptions = err.requestOptions;
    final statusCode = err.response?.statusCode;

    if (statusCode != 401) {
      return false;
    }
    if (requestOptions.extra['skipRefresh'] == true) {
      return false;
    }
    if (requestOptions.extra['retriedAfterRefresh'] == true) {
      return false;
    }
    if (requestOptions.path == '/v1/auth/refresh') {
      return false;
    }

    return true;
  }

  Future<AuthTokens?> _refreshTokens() async {
    if (_pendingRefresh != null) {
      return _pendingRefresh;
    }

    _pendingRefresh = _performRefresh();
    try {
      return await _pendingRefresh;
    } finally {
      _pendingRefresh = null;
    }
  }

  Future<AuthTokens?> _performRefresh() async {
    final currentTokens = await _tokenStorage.read();
    if (currentTokens == null) {
      return null;
    }

    try {
      final response = await _refreshClient.post<Map<String, dynamic>>(
        '/v1/auth/refresh',
        data: <String, dynamic>{'refresh_token': currentTokens.refreshToken},
        options: Options(
          extra: const <String, dynamic>{'skipAuth': true, 'skipRefresh': true},
        ),
      );

      final body = response.data;
      if (body == null) {
        await _tokenStorage.clear();
        return null;
      }

      final tokens = AuthTokens.fromAuthResponse(body);
      await _tokenStorage.write(tokens);
      return tokens;
    } catch (_) {
      await _tokenStorage.clear();
      return null;
    }
  }

  Future<Response<dynamic>> _retryRequest(
    RequestOptions requestOptions,
    AuthTokens tokens,
  ) {
    final headers = Map<String, dynamic>.from(requestOptions.headers);
    headers['Authorization'] = '${tokens.tokenType} ${tokens.accessToken}';

    final options = Options(
      method: requestOptions.method,
      headers: headers,
      responseType: requestOptions.responseType,
      contentType: requestOptions.contentType,
      extra: <String, dynamic>{
        ...requestOptions.extra,
        'retriedAfterRefresh': true,
      },
      followRedirects: requestOptions.followRedirects,
      validateStatus: requestOptions.validateStatus,
      receiveDataWhenStatusError: requestOptions.receiveDataWhenStatusError,
      sendTimeout: requestOptions.sendTimeout,
      receiveTimeout: requestOptions.receiveTimeout,
    );

    return _client.request<dynamic>(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: options,
      cancelToken: requestOptions.cancelToken,
      onReceiveProgress: requestOptions.onReceiveProgress,
      onSendProgress: requestOptions.onSendProgress,
    );
  }
}
