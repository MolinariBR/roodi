import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../Core/api-client/api_client.dart';
import '../domain/commerce_models.dart';

final commerceRepositoryProvider = Provider<CommerceRepository>((ref) {
  return CommerceRepository(dio: ref.read(apiDioProvider));
});

class CommerceRepository {
  CommerceRepository({required Dio dio}) : _dio = dio;

  final Dio _dio;

  Future<CommerceProfileData> getProfile() async {
    final response = await _dio.get<Map<String, dynamic>>('/v1/me');
    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de perfil vazia.');
    }
    return CommerceProfileData.fromEnvelope(body);
  }

  Future<CommerceProfileData> updateProfile(
    Map<String, dynamic> payload,
  ) async {
    final response = await _dio.patch<Map<String, dynamic>>(
      '/v1/me',
      data: payload,
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de atualizacao de perfil vazia.');
    }
    return CommerceProfileData.fromEnvelope(body);
  }

  Future<CommerceCreditsBalanceData> getCreditsBalance() async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/commerce/credits/balance',
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de saldo vazia.');
    }

    return CommerceCreditsBalanceData.fromEnvelope(body);
  }

  Future<CommerceCreditsLedgerData> getCreditsLedger({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/commerce/credits/ledger',
      queryParameters: <String, dynamic>{'page': page, 'limit': limit},
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de extrato vazia.');
    }

    return CommerceCreditsLedgerData.fromEnvelope(body);
  }

  Future<CommercePurchaseIntentData> createCreditPurchaseIntent({
    required double amountBrl,
    String? redirectUrl,
    String? webhookUrl,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/commerce/credits/purchase-intents',
      data: <String, dynamic>{
        'amount_brl': amountBrl,
        if (redirectUrl != null && redirectUrl.trim().isNotEmpty)
          'redirect_url': redirectUrl.trim(),
        if (webhookUrl != null && webhookUrl.trim().isNotEmpty)
          'webhook_url': webhookUrl.trim(),
      },
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de purchase intent vazia.');
    }
    return CommercePurchaseIntentData.fromEnvelope(body);
  }

  Future<CommercePaymentCheckData> checkPayment({
    required String paymentId,
    required String handle,
    required String orderNsu,
    required String transactionNsu,
    required String slug,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/commerce/payments/$paymentId/check',
      data: <String, dynamic>{
        'handle': handle.trim(),
        'order_nsu': orderNsu.trim(),
        'transaction_nsu': transactionNsu.trim(),
        'slug': slug.trim(),
      },
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de check de pagamento vazia.');
    }
    return CommercePaymentCheckData.fromMap(body);
  }

  Future<CommerceQuoteData> createQuote({
    required String originBairro,
    required String destinationBairro,
    required String urgency,
    required DateTime requestedAt,
    bool? isHoliday,
    bool? isSunday,
    bool? isPeak,
    String? orderId,
    String? commerceId,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/commerce/quotes',
      data: <String, dynamic>{
        'origin_bairro': originBairro.trim(),
        'destination_bairro': destinationBairro.trim(),
        'urgency': urgency,
        'requested_at_iso': requestedAt.toUtc().toIso8601String(),
        ...?isHoliday != null
            ? <String, dynamic>{'is_holiday': isHoliday}
            : null,
        ...?isSunday != null ? <String, dynamic>{'is_sunday': isSunday} : null,
        ...?isPeak != null ? <String, dynamic>{'is_peak': isPeak} : null,
        if (orderId != null && orderId.trim().isNotEmpty) 'order_id': orderId,
        if (commerceId != null && commerceId.trim().isNotEmpty)
          'commerce_id': commerceId,
      },
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de quote vazia.');
    }

    return CommerceQuoteData.fromEnvelope(body);
  }

  Future<CommerceOrderData> createOrder({
    required String quoteId,
    required String urgency,
    required Map<String, dynamic> destination,
    String? clientId,
    String? recipientName,
    String? recipientPhone,
    String? notes,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/commerce/orders',
      data: <String, dynamic>{
        'quote_id': quoteId,
        'urgency': urgency,
        if (clientId != null && clientId.trim().isNotEmpty)
          'client_id': clientId.trim(),
        'destination': destination,
        if (recipientName != null && recipientName.trim().isNotEmpty)
          'recipient_name': recipientName.trim(),
        if (recipientPhone != null && recipientPhone.trim().isNotEmpty)
          'recipient_phone': recipientPhone.trim(),
        if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
      },
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de criacao de pedido vazia.');
    }

    return CommerceOrderData.fromMap(body);
  }

  Future<CommerceOrderListData> getOrders({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/commerce/orders',
      queryParameters: <String, dynamic>{
        'page': page,
        'limit': limit,
        if (status != null && status.trim().isNotEmpty) 'status': status,
      },
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de pedidos vazia.');
    }

    return CommerceOrderListData.fromEnvelope(body);
  }

  Future<CommerceOrderData> getOrderById(String orderId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/commerce/orders/$orderId',
    );
    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de pedido vazia.');
    }
    return CommerceOrderData.fromMap(body);
  }

  Future<CommerceOrderData> cancelOrder({
    required String orderId,
    required String reason,
    String? details,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/commerce/orders/$orderId/cancel',
      data: <String, dynamic>{
        'reason': reason.trim(),
        if (details != null && details.trim().isNotEmpty)
          'details': details.trim(),
      },
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de cancelamento vazia.');
    }
    return CommerceOrderData.fromMap(body);
  }

  Future<List<CommerceTrackingEventData>> getOrderTracking(
    String orderId,
  ) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/commerce/orders/$orderId/tracking',
    );
    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de tracking vazia.');
    }
    return CommerceTrackingEventData.listFromEnvelope(body);
  }
}
