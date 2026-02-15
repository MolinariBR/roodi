class RiderOrderData {
  const RiderOrderData({
    required this.id,
    required this.status,
    required this.totalBrl,
    required this.createdAt,
    this.urgency,
    this.distanceM,
    this.durationS,
    this.etaMin,
    this.zone,
    this.confirmationCodeRequired,
    this.confirmationCodeStatus,
    this.destination,
  });

  final String id;
  final String status;
  final double totalBrl;
  final DateTime createdAt;
  final String? urgency;
  final int? distanceM;
  final int? durationS;
  final int? etaMin;
  final int? zone;
  final bool? confirmationCodeRequired;
  final String? confirmationCodeStatus;
  final RiderAddressData? destination;

  factory RiderOrderData.fromMap(Map<String, dynamic> map) {
    final id = map['id'];
    final status = map['status'];
    final totalBrl = map['total_brl'];
    final createdAt = map['created_at'];

    if (id is! String ||
        status is! String ||
        totalBrl is! num ||
        createdAt is! String) {
      throw const FormatException('Pedido rider invalido.');
    }

    final destination = map['destination'];

    return RiderOrderData(
      id: id,
      status: status,
      totalBrl: totalBrl.toDouble(),
      createdAt: DateTime.parse(createdAt),
      urgency: map['urgency'] is String ? map['urgency'] as String : null,
      distanceM: map['distance_m'] is num
          ? (map['distance_m'] as num).toInt()
          : null,
      durationS: map['duration_s'] is num
          ? (map['duration_s'] as num).toInt()
          : null,
      etaMin: map['eta_min'] is num ? (map['eta_min'] as num).toInt() : null,
      zone: map['zone'] is num ? (map['zone'] as num).toInt() : null,
      confirmationCodeRequired: map['confirmation_code_required'] is bool
          ? map['confirmation_code_required'] as bool
          : null,
      confirmationCodeStatus: map['confirmation_code_status'] is String
          ? map['confirmation_code_status'] as String
          : null,
      destination: destination is Map<String, dynamic>
          ? RiderAddressData.fromMap(destination)
          : null,
    );
  }
}

class RiderAddressData {
  const RiderAddressData({
    this.cep,
    this.state,
    this.city,
    this.neighborhood,
    this.street,
    this.number,
    this.complement,
  });

  final String? cep;
  final String? state;
  final String? city;
  final String? neighborhood;
  final String? street;
  final String? number;
  final String? complement;

  factory RiderAddressData.fromMap(Map<String, dynamic> map) {
    return RiderAddressData(
      cep: map['cep'] is String ? map['cep'] as String : null,
      state: map['state'] is String ? map['state'] as String : null,
      city: map['city'] is String ? map['city'] as String : null,
      neighborhood: map['neighborhood'] is String
          ? map['neighborhood'] as String
          : null,
      street: map['street'] is String ? map['street'] as String : null,
      number: map['number'] is String ? map['number'] as String : null,
      complement: map['complement'] is String
          ? map['complement'] as String
          : null,
    );
  }

  String asSingleLine() {
    final parts = <String>[
      if (street != null && street!.isNotEmpty) street!,
      if (number != null && number!.isNotEmpty) number!,
      if (neighborhood != null && neighborhood!.isNotEmpty) neighborhood!,
      if (city != null && city!.isNotEmpty) city!,
      if (state != null && state!.isNotEmpty) state!,
    ];

    if (parts.isEmpty) {
      return 'Endereco nao informado';
    }
    return parts.join(', ');
  }
}

class RiderOfferData {
  const RiderOfferData({
    required this.offerId,
    required this.orderId,
    required this.expiresAt,
    required this.quote,
  });

  final String offerId;
  final String orderId;
  final DateTime expiresAt;
  final RiderOfferQuoteData quote;

  factory RiderOfferData.fromMap(Map<String, dynamic> map) {
    final offerId = map['offer_id'];
    final orderId = map['order_id'];
    final expiresAt = map['expires_at'];
    final quote = map['quote'];

    if (offerId is! String ||
        orderId is! String ||
        expiresAt is! String ||
        quote is! Map<String, dynamic>) {
      throw const FormatException('Oferta rider invalida.');
    }

    return RiderOfferData(
      offerId: offerId,
      orderId: orderId,
      expiresAt: DateTime.parse(expiresAt),
      quote: RiderOfferQuoteData.fromMap(quote),
    );
  }
}

class RiderOfferQuoteData {
  const RiderOfferQuoteData({
    required this.pickupType,
    required this.estimatedValueBrl,
    required this.totalDistanceM,
    required this.routeSummary,
  });

  final String pickupType;
  final double estimatedValueBrl;
  final int totalDistanceM;
  final String routeSummary;

  factory RiderOfferQuoteData.fromMap(Map<String, dynamic> map) {
    final pickupType = map['pickup_type'];
    final estimatedValueBrl = map['estimated_value_brl'];
    final totalDistanceM = map['total_distance_m'];
    final routeSummary = map['route_summary'];

    if (pickupType is! String ||
        estimatedValueBrl is! num ||
        totalDistanceM is! num ||
        routeSummary is! String) {
      throw const FormatException('Quote da oferta invalida.');
    }

    return RiderOfferQuoteData(
      pickupType: pickupType,
      estimatedValueBrl: estimatedValueBrl.toDouble(),
      totalDistanceM: totalDistanceM.toInt(),
      routeSummary: routeSummary,
    );
  }
}

class RiderDashboardData {
  const RiderDashboardData({
    required this.availability,
    required this.todayEarningsBrl,
    required this.monthEarningsBrl,
    required this.todayDeliveries,
    required this.todayOnlineMinutes,
    required this.completedDeliveriesTotal,
    required this.updatedAt,
    this.activeOrder,
  });

  final String availability;
  final double todayEarningsBrl;
  final double monthEarningsBrl;
  final int todayDeliveries;
  final int todayOnlineMinutes;
  final int completedDeliveriesTotal;
  final DateTime updatedAt;
  final RiderOrderData? activeOrder;

  bool get isOnline => availability == 'online';

  factory RiderDashboardData.fromEnvelope(Map<String, dynamic> map) {
    final data = map['data'];
    if (data is! Map<String, dynamic>) {
      throw const FormatException('Resposta de dashboard rider invalida.');
    }

    final availability = data['availability'];
    final todayEarnings = data['today_earnings_brl'];
    final monthEarnings = data['month_earnings_brl'];
    final todayDeliveries = data['today_deliveries'];
    final todayOnlineMinutes = data['today_online_minutes'];
    final completedDeliveriesTotal = data['completed_deliveries_total'];
    final updatedAt = data['updated_at'];

    if (availability is! String ||
        todayEarnings is! num ||
        monthEarnings is! num ||
        todayDeliveries is! num ||
        todayOnlineMinutes is! num ||
        completedDeliveriesTotal is! num ||
        updatedAt is! String) {
      throw const FormatException('Dados de dashboard rider invalidos.');
    }

    final activeOrder = data['active_order'];

    return RiderDashboardData(
      availability: availability,
      todayEarningsBrl: todayEarnings.toDouble(),
      monthEarningsBrl: monthEarnings.toDouble(),
      todayDeliveries: todayDeliveries.toInt(),
      todayOnlineMinutes: todayOnlineMinutes.toInt(),
      completedDeliveriesTotal: completedDeliveriesTotal.toInt(),
      updatedAt: DateTime.parse(updatedAt),
      activeOrder: activeOrder is Map<String, dynamic>
          ? RiderOrderData.fromMap(activeOrder)
          : null,
    );
  }
}

class RiderAvailabilityData {
  const RiderAvailabilityData({required this.status, required this.updatedAt});

  final String status;
  final DateTime updatedAt;

  factory RiderAvailabilityData.fromEnvelope(Map<String, dynamic> map) {
    final data = map['data'];
    if (data is! Map<String, dynamic>) {
      throw const FormatException('Resposta de disponibilidade invalida.');
    }

    final status = data['status'];
    final updatedAt = data['updated_at'];
    if (status is! String || updatedAt is! String) {
      throw const FormatException('Resposta de disponibilidade invalida.');
    }

    return RiderAvailabilityData(
      status: status,
      updatedAt: DateTime.parse(updatedAt),
    );
  }
}

class RiderOrderHistoryData {
  const RiderOrderHistoryData({required this.items, required this.pagination});

  final List<RiderOrderData> items;
  final RiderPagination pagination;

  factory RiderOrderHistoryData.fromEnvelope(Map<String, dynamic> map) {
    final data = map['data'];
    final pagination = map['pagination'];
    if (data is! List || pagination is! Map<String, dynamic>) {
      throw const FormatException('Historico de pedidos invalido.');
    }

    return RiderOrderHistoryData(
      items: data
          .whereType<Map<String, dynamic>>()
          .map(RiderOrderData.fromMap)
          .toList(growable: false),
      pagination: RiderPagination.fromMap(pagination),
    );
  }
}

class RiderPagination {
  const RiderPagination({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  final int page;
  final int limit;
  final int total;
  final int totalPages;

  factory RiderPagination.fromMap(Map<String, dynamic> map) {
    final page = map['page'];
    final limit = map['limit'];
    final total = map['total'];
    final totalPages = map['total_pages'];
    if (page is! num || limit is! num || total is! num || totalPages is! num) {
      throw const FormatException('Paginacao invalida.');
    }

    return RiderPagination(
      page: page.toInt(),
      limit: limit.toInt(),
      total: total.toInt(),
      totalPages: totalPages.toInt(),
    );
  }
}
