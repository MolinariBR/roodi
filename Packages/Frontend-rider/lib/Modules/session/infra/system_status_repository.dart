import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../Core/api-client/api_client.dart';

final systemStatusRepositoryProvider = Provider<SystemStatusRepository>((ref) {
  return SystemStatusRepository(dio: ref.read(baseDioProvider));
});

class SystemStatusRepository {
  SystemStatusRepository({required Dio dio}) : _dio = dio;

  final Dio _dio;

  Future<SystemStatusSnapshot> fetchStatus() async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/system/status',
      options: Options(
        extra: const <String, dynamic>{'skipAuth': true, 'skipRefresh': true},
      ),
    );

    final body = response.data;
    if (body == null || body['data'] is! Map<String, dynamic>) {
      throw const FormatException('Resposta de status do sistema invalida.');
    }

    return SystemStatusSnapshot.fromMap(body['data'] as Map<String, dynamic>);
  }
}

enum SystemRuntimeStatus { ok, degraded, maintenance }

class SystemStatusSnapshot {
  const SystemStatusSnapshot({
    required this.status,
    required this.maintenanceMode,
    required this.appVersion,
    required this.apiVersion,
    required this.timestamp,
    this.maintenanceMessage,
  });

  final SystemRuntimeStatus status;
  final bool maintenanceMode;
  final String appVersion;
  final String apiVersion;
  final DateTime timestamp;
  final String? maintenanceMessage;

  bool get shouldForceMaintenance =>
      status == SystemRuntimeStatus.maintenance || maintenanceMode;

  bool get shouldRecommendUpdate => status == SystemRuntimeStatus.degraded;

  factory SystemStatusSnapshot.fromMap(Map<String, dynamic> map) {
    final status = map['status'];
    final maintenanceMode = map['maintenance_mode'];
    final appVersion = map['app_version'];
    final apiVersion = map['api_version'];
    final timestamp = map['timestamp'];
    final maintenanceMessage = map['maintenance_message'];

    if (status is! String ||
        maintenanceMode is! bool ||
        appVersion is! String ||
        apiVersion is! String ||
        timestamp is! String) {
      throw const FormatException('Resposta de status do sistema invalida.');
    }

    return SystemStatusSnapshot(
      status: _parseStatus(status),
      maintenanceMode: maintenanceMode,
      maintenanceMessage: maintenanceMessage is String
          ? maintenanceMessage
          : null,
      appVersion: appVersion,
      apiVersion: apiVersion,
      timestamp: DateTime.parse(timestamp),
    );
  }

  static SystemRuntimeStatus _parseStatus(String status) {
    switch (status) {
      case 'ok':
        return SystemRuntimeStatus.ok;
      case 'degraded':
        return SystemRuntimeStatus.degraded;
      case 'maintenance':
        return SystemRuntimeStatus.maintenance;
      default:
        throw const FormatException('Status de sistema desconhecido.');
    }
  }
}
