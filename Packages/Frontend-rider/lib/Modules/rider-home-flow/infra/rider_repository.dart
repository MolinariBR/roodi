import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../Core/api-client/api_client.dart';
import '../domain/rider_models.dart';

final riderRepositoryProvider = Provider<RiderRepository>((ref) {
  return RiderRepository(dio: ref.read(apiDioProvider));
});

class RiderRepository {
  RiderRepository({required Dio dio}) : _dio = dio;

  final Dio _dio;

  Future<RiderDashboardData> getDashboard() async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/rider/dashboard',
    );
    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de dashboard vazia.');
    }
    return RiderDashboardData.fromEnvelope(body);
  }

  Future<RiderAvailabilityData> setAvailability({required bool online}) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/rider/availability',
      data: <String, dynamic>{'status': online ? 'online' : 'offline'},
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de disponibilidade vazia.');
    }

    return RiderAvailabilityData.fromEnvelope(body);
  }

  Future<RiderOfferData?> getCurrentOffer() async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/rider/offers/current',
    );

    if (response.statusCode == 204) {
      return null;
    }

    final body = response.data;
    if (body == null) {
      return null;
    }

    return RiderOfferData.fromMap(body);
  }

  Future<RiderOrderData?> getActiveOrder() async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/rider/orders/active',
    );
    if (response.statusCode == 204) {
      return null;
    }

    final body = response.data;
    if (body == null) {
      return null;
    }

    return RiderOrderData.fromMap(body);
  }

  Future<RiderOrderData> acceptOffer(String offerId) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/rider/offers/$offerId/accept',
    );
    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de aceite de oferta invalida.');
    }
    return RiderOrderData.fromMap(body);
  }

  Future<void> rejectOffer({required String offerId, String? reason}) async {
    await _dio.post<void>(
      '/v1/rider/offers/$offerId/reject',
      data: <String, dynamic>{
        if (reason != null && reason.trim().isNotEmpty) 'reason': reason.trim(),
      },
    );
  }

  Future<void> appendOrderEvent({
    required String orderId,
    required String eventType,
    String? note,
  }) async {
    await _dio.post<void>(
      '/v1/rider/orders/$orderId/events',
      data: <String, dynamic>{
        'event_type': eventType,
        'occurred_at': DateTime.now().toUtc().toIso8601String(),
        if (note != null && note.trim().isNotEmpty) 'note': note.trim(),
      },
    );
  }

  Future<RiderOrderData> completeOrder({
    required String orderId,
    required String confirmationCode,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/rider/orders/$orderId/complete',
      data: <String, dynamic>{'confirmation_code': confirmationCode.trim()},
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de conclusao de pedido invalida.');
    }

    return RiderOrderData.fromMap(body);
  }

  Future<RiderOrderHistoryData> getOrdersHistory({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/rider/orders/history',
      queryParameters: <String, dynamic>{
        'page': page,
        'limit': limit,
        if (status != null && status.trim().isNotEmpty) 'status': status,
      },
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de historico invalida.');
    }

    return RiderOrderHistoryData.fromEnvelope(body);
  }

  Future<RiderOrderData> getOrderById(String orderId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/rider/orders/$orderId',
    );
    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de detalhe do pedido invalida.');
    }
    return RiderOrderData.fromMap(body);
  }
}
