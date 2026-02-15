import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../Core/api-client/api_client.dart';
import '../domain/rider_profile_models.dart';

final riderProfileRepositoryProvider = Provider<RiderProfileRepository>((ref) {
  return RiderProfileRepository(dio: ref.read(apiDioProvider));
});

class RiderProfileRepository {
  RiderProfileRepository({required Dio dio}) : _dio = dio;

  final Dio _dio;

  Future<RiderProfileData> getProfile() async {
    final response = await _dio.get<Map<String, dynamic>>('/v1/me');
    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de perfil vazia.');
    }
    return RiderProfileData.fromEnvelope(body);
  }

  Future<RiderProfileData> updateProfile(Map<String, dynamic> payload) async {
    final response = await _dio.patch<Map<String, dynamic>>(
      '/v1/me',
      data: payload,
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de atualizacao de perfil vazia.');
    }
    return RiderProfileData.fromEnvelope(body);
  }
}
