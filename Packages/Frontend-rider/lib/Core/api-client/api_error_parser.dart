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
        final details = payloadError['details'];
        if (details is Map<String, dynamic>) {
          final issues = details['issues'];
          if (issues is List && issues.isNotEmpty) {
            final firstIssue = issues.first;
            if (firstIssue is Map<String, dynamic>) {
              final issuePath = firstIssue['path'];
              final issueMessage = firstIssue['message'];
              if (issueMessage is String && issueMessage.trim().isNotEmpty) {
                if (issuePath is String && issuePath.trim().isNotEmpty) {
                  return '${issuePath.trim()}: ${issueMessage.trim()}';
                }
                return issueMessage.trim();
              }
            }
          }
        }

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
