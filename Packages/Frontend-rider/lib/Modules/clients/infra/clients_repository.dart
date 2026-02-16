import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../Core/api-client/api_client.dart';
import '../domain/client_models.dart';

final clientsRepositoryProvider = Provider<ClientsRepository>((ref) {
  return ClientsRepository(dio: ref.read(apiDioProvider));
});

class ClientsRepository {
  ClientsRepository({required Dio dio}) : _dio = dio;

  final Dio _dio;

  Future<List<CommerceClientData>> list({
    int page = 1,
    int limit = 50,
    String? search,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/commerce/clients',
      queryParameters: <String, dynamic>{
        'page': page,
        'limit': limit,
        if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
      },
    );

    final body = response.data;
    if (body == null || body['data'] is! List) {
      throw const FormatException('Resposta de clientes inválida.');
    }

    return (body['data'] as List)
        .whereType<Map<String, dynamic>>()
        .map(CommerceClientData.fromMap)
        .toList(growable: false);
  }

  Future<CommerceClientData> create(CreateCommerceClientInput input) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/commerce/clients',
      data: <String, dynamic>{
        'name': input.name.trim(),
        'phone_number': input.phone.trim(),
        'address': <String, dynamic>{
          'street': input.address.trim(),
          if (input.neighborhood != null &&
              input.neighborhood!.trim().isNotEmpty)
            'neighborhood': input.neighborhood!.trim(),
          if (input.complement != null && input.complement!.trim().isNotEmpty)
            'complement': input.complement!.trim(),
        },
      },
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de criação de cliente inválida.');
    }
    return CommerceClientData.fromMap(body);
  }
}
