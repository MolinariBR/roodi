import 'package:dio/dio.dart';

String mapApiErrorMessage(
  Object error, {
  String fallbackMessage = 'Nao foi possivel concluir a operacao.',
}) {
  if (error is DioException) {
    final responseData = error.response?.data;
    if (responseData is Map<String, dynamic>) {
      final payloadError = responseData['error'];
      if (payloadError is Map<String, dynamic>) {
        final message = payloadError['message'];
        if (message is String && message.trim().isNotEmpty) {
          return message.trim();
        }
      }
    }

    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError) {
      return 'Falha de conexao com o servidor.';
    }
  }

  return fallbackMessage;
}
