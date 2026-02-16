import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../Core/api-client/api_client.dart';
import '../domain/product_models.dart';

final productsRepositoryProvider = Provider<ProductsRepository>((ref) {
  return ProductsRepository(dio: ref.read(apiDioProvider));
});

class ProductsRepository {
  ProductsRepository({required Dio dio}) : _dio = dio;

  final Dio _dio;

  Future<List<CommerceProductData>> list({
    int page = 1,
    int limit = 50,
    String? status,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/commerce/products',
      queryParameters: <String, dynamic>{
        'page': page,
        'limit': limit,
        if (status != null && status.trim().isNotEmpty) 'status': status.trim(),
      },
    );

    final body = response.data;
    if (body == null || body['data'] is! List) {
      throw const FormatException('Resposta de produtos inválida.');
    }

    return (body['data'] as List)
        .whereType<Map<String, dynamic>>()
        .map(CommerceProductData.fromMap)
        .toList(growable: false);
  }

  Future<CommerceProductData> create(UpsertCommerceProductInput input) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/commerce/products',
      data: _upsertPayload(input),
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de criação de produto inválida.');
    }
    return CommerceProductData.fromMap(body);
  }

  Future<CommerceProductData> update({
    required String productId,
    required UpsertCommerceProductInput input,
  }) async {
    final response = await _dio.patch<Map<String, dynamic>>(
      '/v1/commerce/products/$productId',
      data: _upsertPayload(input),
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException(
        'Resposta de atualização de produto inválida.',
      );
    }
    return CommerceProductData.fromMap(body);
  }

  Future<CommerceProductData> updateStatus({
    required String productId,
    required String status,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/commerce/products/$productId/status',
      data: <String, dynamic>{'status': status},
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de status de produto inválida.');
    }
    return CommerceProductData.fromMap(body);
  }

  Map<String, dynamic> _upsertPayload(UpsertCommerceProductInput input) {
    return <String, dynamic>{
      'name': input.name.trim(),
      'price_brl': input.priceBrl,
      'stock': input.stock,
      if (input.description != null && input.description!.trim().isNotEmpty)
        'description': input.description!.trim(),
    };
  }
}
