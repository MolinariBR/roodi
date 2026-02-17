import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/token_storage.dart';
import 'interceptors/auth_interceptor.dart';
import 'interceptors/refresh_interceptor.dart';

final apiBaseUrlProvider = Provider<String>((ref) {
  const configured = String.fromEnvironment('ROODI_API_BASE_URL');
  if (configured.isNotEmpty) {
    return configured;
  }

  // Release builds must talk to production by default. Dev/debug can override via:
  // `--dart-define=ROODI_API_BASE_URL=http://127.0.0.1:3333` (with adb reverse).
  if (kReleaseMode) {
    return 'https://api.roodi.app';
  }

  return 'http://localhost:3333';
});

final baseDioProvider = Provider<Dio>((ref) {
  return Dio(_baseOptions(ref.read(apiBaseUrlProvider)));
});

final apiDioProvider = Provider<Dio>((ref) {
  final baseUrl = ref.read(apiBaseUrlProvider);
  final tokenStorage = ref.read(tokenStorageProvider);

  final dio = Dio(_baseOptions(baseUrl));
  final refreshDio = Dio(_baseOptions(baseUrl));

  dio.interceptors.addAll(<Interceptor>[
    AuthInterceptor(tokenStorage: tokenStorage),
    RefreshInterceptor(
      client: dio,
      refreshClient: refreshDio,
      tokenStorage: tokenStorage,
    ),
  ]);

  return dio;
});

BaseOptions _baseOptions(String baseUrl) {
  return BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
    sendTimeout: const Duration(seconds: 10),
    headers: const <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  );
}
