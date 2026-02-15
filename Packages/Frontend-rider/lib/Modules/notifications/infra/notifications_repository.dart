import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../Core/api-client/api_client.dart';

final notificationsRepositoryProvider = Provider<NotificationsRepository>((
  ref,
) {
  return NotificationsRepository(dio: ref.read(apiDioProvider));
});

class NotificationsRepository {
  NotificationsRepository({required Dio dio}) : _dio = dio;

  final Dio _dio;

  Future<NotificationsPageData> list({
    int page = 1,
    int limit = 20,
    NotificationReadFilter filter = NotificationReadFilter.all,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/notifications',
      queryParameters: <String, dynamic>{
        'page': page,
        'limit': limit,
        'status': _statusParam(filter),
      },
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de notificacoes vazia.');
    }

    final rawItems = body['data'];
    final rawPagination = body['pagination'];
    if (rawItems is! List || rawPagination is! Map<String, dynamic>) {
      throw const FormatException('Resposta de notificacoes invalida.');
    }

    final items = rawItems
        .whereType<Map<String, dynamic>>()
        .map(AppNotification.fromMap)
        .toList(growable: false);

    return NotificationsPageData(
      items: items,
      pagination: ApiPagination.fromMap(rawPagination),
    );
  }

  Future<AppNotification> markAsRead(String notificationId) async {
    final response = await _dio.patch<Map<String, dynamic>>(
      '/v1/notifications/$notificationId/read',
    );
    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de notificacao invalida.');
    }
    return AppNotification.fromMap(body);
  }

  Future<void> markAllAsRead() async {
    await _dio.post<void>('/v1/notifications/mark-all-read');
  }

  String _statusParam(NotificationReadFilter filter) {
    switch (filter) {
      case NotificationReadFilter.all:
        return 'all';
      case NotificationReadFilter.unread:
        return 'unread';
      case NotificationReadFilter.read:
        return 'read';
    }
  }
}

enum NotificationReadFilter { all, unread, read }

class NotificationsPageData {
  const NotificationsPageData({required this.items, required this.pagination});

  final List<AppNotification> items;
  final ApiPagination pagination;
}

class ApiPagination {
  const ApiPagination({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  final int page;
  final int limit;
  final int total;
  final int totalPages;

  factory ApiPagination.fromMap(Map<String, dynamic> map) {
    final page = map['page'];
    final limit = map['limit'];
    final total = map['total'];
    final totalPages = map['total_pages'];

    if (page is! num || limit is! num || total is! num || totalPages is! num) {
      throw const FormatException('Paginacao invalida.');
    }

    return ApiPagination(
      page: page.toInt(),
      limit: limit.toInt(),
      total: total.toInt(),
      totalPages: totalPages.toInt(),
    );
  }
}

class AppNotification {
  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.read,
    required this.createdAt,
    this.data,
  });

  final String id;
  final String title;
  final String body;
  final bool read;
  final DateTime createdAt;
  final Map<String, dynamic>? data;

  factory AppNotification.fromMap(Map<String, dynamic> map) {
    final id = map['id'];
    final title = map['title'];
    final body = map['body'];
    final read = map['read'];
    final createdAt = map['created_at'];
    final data = map['data'];

    if (id is! String ||
        title is! String ||
        body is! String ||
        read is! bool ||
        createdAt is! String) {
      throw const FormatException('Notificacao invalida.');
    }

    return AppNotification(
      id: id,
      title: title,
      body: body,
      read: read,
      createdAt: DateTime.parse(createdAt),
      data: data is Map<String, dynamic> ? data : null,
    );
  }
}
