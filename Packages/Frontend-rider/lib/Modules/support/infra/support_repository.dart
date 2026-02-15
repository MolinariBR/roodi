import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../Core/api-client/api_client.dart';

final supportRepositoryProvider = Provider<SupportRepository>((ref) {
  return SupportRepository(dio: ref.read(apiDioProvider));
});

class SupportRepository {
  SupportRepository({required Dio dio}) : _dio = dio;

  final Dio _dio;

  Future<List<FaqItem>> listFaqs() async {
    final response = await _dio.get<Map<String, dynamic>>('/v1/support/faqs');
    final body = response.data;
    if (body == null || body['data'] is! List) {
      throw const FormatException('Resposta de FAQ invalida.');
    }

    return (body['data'] as List)
        .whereType<Map<String, dynamic>>()
        .map(FaqItem.fromMap)
        .toList(growable: false);
  }

  Future<SupportTicketsPageData> listTickets({
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/support/tickets',
      queryParameters: <String, dynamic>{'page': page, 'limit': limit},
    );
    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de tickets invalida.');
    }

    final rawItems = body['data'];
    final rawPagination = body['pagination'];
    if (rawItems is! List || rawPagination is! Map<String, dynamic>) {
      throw const FormatException('Resposta de tickets invalida.');
    }

    return SupportTicketsPageData(
      items: rawItems
          .whereType<Map<String, dynamic>>()
          .map(SupportTicket.fromMap)
          .toList(growable: false),
      pagination: SupportApiPagination.fromMap(rawPagination),
    );
  }

  Future<SupportTicket> createTicket({
    required String subject,
    required String description,
    required SupportTicketPriority priority,
    String? orderId,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/v1/support/tickets',
      data: <String, dynamic>{
        'subject': subject.trim(),
        'description': description.trim(),
        'priority': priority.name,
        if (orderId != null && orderId.trim().isNotEmpty)
          'order_id': orderId.trim(),
      },
    );

    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de ticket invalida.');
    }

    return SupportTicket.fromMap(body);
  }

  Future<SupportTicket> getTicket(String ticketId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/v1/support/tickets/$ticketId',
    );
    final body = response.data;
    if (body == null) {
      throw const FormatException('Resposta de ticket invalida.');
    }

    return SupportTicket.fromMap(body);
  }
}

class FaqItem {
  const FaqItem({
    required this.id,
    required this.question,
    required this.answer,
  });

  final String id;
  final String question;
  final String answer;

  factory FaqItem.fromMap(Map<String, dynamic> map) {
    final id = map['id'];
    final question = map['question'];
    final answer = map['answer'];
    if (id is! String || question is! String || answer is! String) {
      throw const FormatException('FAQ invalido.');
    }
    return FaqItem(id: id, question: question, answer: answer);
  }
}

class SupportTicket {
  const SupportTicket({
    required this.id,
    required this.subject,
    required this.description,
    required this.status,
    required this.priority,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String subject;
  final String description;
  final String status;
  final String priority;
  final DateTime createdAt;
  final DateTime updatedAt;

  factory SupportTicket.fromMap(Map<String, dynamic> map) {
    final id = map['id'];
    final subject = map['subject'];
    final description = map['description'];
    final status = map['status'];
    final priority = map['priority'];
    final createdAt = map['created_at'];
    final updatedAt = map['updated_at'];
    if (id is! String ||
        subject is! String ||
        description is! String ||
        status is! String ||
        priority is! String ||
        createdAt is! String ||
        updatedAt is! String) {
      throw const FormatException('Ticket invalido.');
    }

    return SupportTicket(
      id: id,
      subject: subject,
      description: description,
      status: status,
      priority: priority,
      createdAt: DateTime.parse(createdAt),
      updatedAt: DateTime.parse(updatedAt),
    );
  }
}

class SupportTicketsPageData {
  const SupportTicketsPageData({required this.items, required this.pagination});

  final List<SupportTicket> items;
  final SupportApiPagination pagination;
}

class SupportApiPagination {
  const SupportApiPagination({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  final int page;
  final int limit;
  final int total;
  final int totalPages;

  factory SupportApiPagination.fromMap(Map<String, dynamic> map) {
    final page = map['page'];
    final limit = map['limit'];
    final total = map['total'];
    final totalPages = map['total_pages'];
    if (page is! num || limit is! num || total is! num || totalPages is! num) {
      throw const FormatException('Paginacao de ticket invalida.');
    }

    return SupportApiPagination(
      page: page.toInt(),
      limit: limit.toInt(),
      total: total.toInt(),
      totalPages: totalPages.toInt(),
    );
  }
}

enum SupportTicketPriority { low, medium, high, urgent }
