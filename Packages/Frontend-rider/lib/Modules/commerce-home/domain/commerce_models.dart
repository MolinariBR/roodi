class CommerceAddressData {
  const CommerceAddressData({
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

  factory CommerceAddressData.fromMap(Map<String, dynamic> map) {
    return CommerceAddressData(
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

class CommerceOrderData {
  const CommerceOrderData({
    required this.id,
    required this.status,
    required this.totalBrl,
    required this.createdAt,
    this.paymentStatus,
    this.paymentRequired,
    this.riderId,
    this.quoteId,
    this.urgency,
    this.distanceM,
    this.durationS,
    this.etaMin,
    this.zone,
    this.destination,
    this.confirmationCodeRequired,
    this.confirmationCodeStatus,
  });

  final String id;
  final String status;
  final double totalBrl;
  final DateTime createdAt;
  final String? paymentStatus;
  final bool? paymentRequired;
  final String? riderId;
  final String? quoteId;
  final String? urgency;
  final int? distanceM;
  final int? durationS;
  final int? etaMin;
  final int? zone;
  final CommerceAddressData? destination;
  final bool? confirmationCodeRequired;
  final String? confirmationCodeStatus;

  factory CommerceOrderData.fromMap(Map<String, dynamic> map) {
    final id = map['id'];
    final status = map['status'];
    final totalBrl = map['total_brl'];
    final createdAt = map['created_at'];

    if (id is! String ||
        status is! String ||
        totalBrl is! num ||
        createdAt is! String) {
      throw const FormatException('Pedido commerce invalido.');
    }

    final destination = map['destination'];

    return CommerceOrderData(
      id: id,
      status: status,
      totalBrl: totalBrl.toDouble(),
      createdAt: DateTime.parse(createdAt),
      paymentStatus: map['payment_status'] is String
          ? map['payment_status'] as String
          : null,
      paymentRequired: map['payment_required'] is bool
          ? map['payment_required'] as bool
          : null,
      riderId: map['rider_id'] is String ? map['rider_id'] as String : null,
      quoteId: map['quote_id'] is String ? map['quote_id'] as String : null,
      urgency: map['urgency'] is String ? map['urgency'] as String : null,
      distanceM: map['distance_m'] is num
          ? (map['distance_m'] as num).toInt()
          : null,
      durationS: map['duration_s'] is num
          ? (map['duration_s'] as num).toInt()
          : null,
      etaMin: map['eta_min'] is num ? (map['eta_min'] as num).toInt() : null,
      zone: map['zone'] is num ? (map['zone'] as num).toInt() : null,
      destination: destination is Map<String, dynamic>
          ? CommerceAddressData.fromMap(destination)
          : null,
      confirmationCodeRequired: map['confirmation_code_required'] is bool
          ? map['confirmation_code_required'] as bool
          : null,
      confirmationCodeStatus: map['confirmation_code_status'] is String
          ? map['confirmation_code_status'] as String
          : null,
    );
  }
}

class CommercePaginationData {
  const CommercePaginationData({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  final int page;
  final int limit;
  final int total;
  final int totalPages;

  factory CommercePaginationData.fromMap(Map<String, dynamic> map) {
    final page = map['page'];
    final limit = map['limit'];
    final total = map['total'];
    final totalPages = map['total_pages'];

    if (page is! num || limit is! num || total is! num || totalPages is! num) {
      throw const FormatException('Paginacao commerce invalida.');
    }

    return CommercePaginationData(
      page: page.toInt(),
      limit: limit.toInt(),
      total: total.toInt(),
      totalPages: totalPages.toInt(),
    );
  }
}

class CommerceOrderListData {
  const CommerceOrderListData({required this.items, required this.pagination});

  final List<CommerceOrderData> items;
  final CommercePaginationData pagination;

  factory CommerceOrderListData.fromEnvelope(Map<String, dynamic> map) {
    final data = map['data'];
    final pagination = map['pagination'];

    if (data is! List || pagination is! Map<String, dynamic>) {
      throw const FormatException('Lista de pedidos commerce invalida.');
    }

    return CommerceOrderListData(
      items: data
          .whereType<Map<String, dynamic>>()
          .map(CommerceOrderData.fromMap)
          .toList(growable: false),
      pagination: CommercePaginationData.fromMap(pagination),
    );
  }
}

class CommerceTrackingEventData {
  const CommerceTrackingEventData({
    required this.id,
    required this.orderId,
    required this.eventType,
    required this.occurredAt,
    this.actorRole,
    this.note,
  });

  final String id;
  final String orderId;
  final String eventType;
  final DateTime occurredAt;
  final String? actorRole;
  final String? note;

  factory CommerceTrackingEventData.fromMap(Map<String, dynamic> map) {
    final id = map['id'];
    final orderId = map['order_id'];
    final eventType = map['event_type'];
    final occurredAt = map['occurred_at'];

    if (id is! String ||
        orderId is! String ||
        eventType is! String ||
        occurredAt is! String) {
      throw const FormatException('Evento de tracking invalido.');
    }

    return CommerceTrackingEventData(
      id: id,
      orderId: orderId,
      eventType: eventType,
      occurredAt: DateTime.parse(occurredAt),
      actorRole: map['actor_role'] is String
          ? map['actor_role'] as String
          : null,
      note: map['note'] is String ? map['note'] as String : null,
    );
  }

  static List<CommerceTrackingEventData> listFromEnvelope(
    Map<String, dynamic> map,
  ) {
    final data = map['data'];
    if (data is! List) {
      throw const FormatException('Tracking commerce invalido.');
    }

    return data
        .whereType<Map<String, dynamic>>()
        .map(CommerceTrackingEventData.fromMap)
        .toList(growable: false);
  }
}

class CommerceQuotePriceData {
  const CommerceQuotePriceData({
    required this.baseZoneBrl,
    required this.urgencyBrl,
    required this.sundayBrl,
    required this.holidayBrl,
    required this.rainBrl,
    required this.peakBrl,
    required this.totalBrl,
  });

  final double baseZoneBrl;
  final double urgencyBrl;
  final double sundayBrl;
  final double holidayBrl;
  final double rainBrl;
  final double peakBrl;
  final double totalBrl;

  factory CommerceQuotePriceData.fromMap(Map<String, dynamic> map) {
    final baseZoneBrl = map['base_zone_brl'];
    final urgencyBrl = map['urgency_brl'];
    final sundayBrl = map['sunday_brl'];
    final holidayBrl = map['holiday_brl'];
    final rainBrl = map['rain_brl'];
    final peakBrl = map['peak_brl'];
    final totalBrl = map['total_brl'];

    if (baseZoneBrl is! num ||
        urgencyBrl is! num ||
        sundayBrl is! num ||
        holidayBrl is! num ||
        rainBrl is! num ||
        peakBrl is! num ||
        totalBrl is! num) {
      throw const FormatException('Preco da quote invalido.');
    }

    return CommerceQuotePriceData(
      baseZoneBrl: baseZoneBrl.toDouble(),
      urgencyBrl: urgencyBrl.toDouble(),
      sundayBrl: sundayBrl.toDouble(),
      holidayBrl: holidayBrl.toDouble(),
      rainBrl: rainBrl.toDouble(),
      peakBrl: peakBrl.toDouble(),
      totalBrl: totalBrl.toDouble(),
    );
  }
}

class CommerceQuoteData {
  const CommerceQuoteData({
    required this.quoteId,
    required this.originBairro,
    required this.destinationBairro,
    required this.distanceM,
    required this.durationS,
    required this.etaMin,
    required this.zone,
    required this.price,
  });

  final String quoteId;
  final String originBairro;
  final String destinationBairro;
  final int distanceM;
  final int durationS;
  final int etaMin;
  final int zone;
  final CommerceQuotePriceData price;

  factory CommerceQuoteData.fromEnvelope(Map<String, dynamic> map) {
    final data = map['data'];
    if (data is! Map<String, dynamic>) {
      throw const FormatException('Resposta de quote invalida.');
    }

    final quoteId = data['quote_id'];
    final originBairro = data['origin_bairro'];
    final destinationBairro = data['destination_bairro'];
    final distanceM = data['distance_m'];
    final durationS = data['duration_s'];
    final etaMin = data['eta_min'];
    final zone = data['zone'];
    final price = data['price'];

    if (quoteId is! String ||
        originBairro is! String ||
        destinationBairro is! String ||
        distanceM is! num ||
        durationS is! num ||
        etaMin is! num ||
        zone is! num ||
        price is! Map<String, dynamic>) {
      throw const FormatException('Dados de quote invalidos.');
    }

    return CommerceQuoteData(
      quoteId: quoteId,
      originBairro: originBairro,
      destinationBairro: destinationBairro,
      distanceM: distanceM.toInt(),
      durationS: durationS.toInt(),
      etaMin: etaMin.toInt(),
      zone: zone.toInt(),
      price: CommerceQuotePriceData.fromMap(price),
    );
  }
}

class CommerceCreditsBalanceData {
  const CommerceCreditsBalanceData({
    required this.balanceBrl,
    required this.reservedBrl,
    required this.availableBrl,
    required this.updatedAt,
  });

  final double balanceBrl;
  final double reservedBrl;
  final double availableBrl;
  final DateTime updatedAt;

  factory CommerceCreditsBalanceData.fromEnvelope(Map<String, dynamic> map) {
    final data = map['data'];
    if (data is! Map<String, dynamic>) {
      throw const FormatException('Saldo de creditos invalido.');
    }

    final balanceBrl = data['balance_brl'];
    final reservedBrl = data['reserved_brl'];
    final availableBrl = data['available_brl'];
    final updatedAt = data['updated_at'];

    if (balanceBrl is! num ||
        reservedBrl is! num ||
        availableBrl is! num ||
        updatedAt is! String) {
      throw const FormatException('Saldo de creditos invalido.');
    }

    return CommerceCreditsBalanceData(
      balanceBrl: balanceBrl.toDouble(),
      reservedBrl: reservedBrl.toDouble(),
      availableBrl: availableBrl.toDouble(),
      updatedAt: DateTime.parse(updatedAt),
    );
  }
}

class CommerceCreditsLedgerItemData {
  const CommerceCreditsLedgerItemData({
    required this.id,
    required this.type,
    required this.amountBrl,
    required this.balanceAfterBrl,
    required this.createdAt,
    this.orderId,
    this.reference,
  });

  final String id;
  final String type;
  final double amountBrl;
  final double balanceAfterBrl;
  final DateTime createdAt;
  final String? orderId;
  final String? reference;

  factory CommerceCreditsLedgerItemData.fromMap(Map<String, dynamic> map) {
    final id = map['id'];
    final type = map['type'];
    final amountBrl = map['amount_brl'];
    final balanceAfterBrl = map['balance_after_brl'];
    final createdAt = map['created_at'];

    if (id is! String ||
        type is! String ||
        amountBrl is! num ||
        balanceAfterBrl is! num ||
        createdAt is! String) {
      throw const FormatException('Item de extrato invalido.');
    }

    return CommerceCreditsLedgerItemData(
      id: id,
      type: type,
      amountBrl: amountBrl.toDouble(),
      balanceAfterBrl: balanceAfterBrl.toDouble(),
      createdAt: DateTime.parse(createdAt),
      orderId: map['order_id'] is String ? map['order_id'] as String : null,
      reference: map['reference'] is String ? map['reference'] as String : null,
    );
  }
}

class CommerceCreditsLedgerData {
  const CommerceCreditsLedgerData({
    required this.items,
    required this.pagination,
  });

  final List<CommerceCreditsLedgerItemData> items;
  final CommercePaginationData pagination;

  factory CommerceCreditsLedgerData.fromEnvelope(Map<String, dynamic> map) {
    final data = map['data'];
    final pagination = map['pagination'];

    if (data is! List || pagination is! Map<String, dynamic>) {
      throw const FormatException('Extrato de creditos invalido.');
    }

    return CommerceCreditsLedgerData(
      items: data
          .whereType<Map<String, dynamic>>()
          .map(CommerceCreditsLedgerItemData.fromMap)
          .toList(growable: false),
      pagination: CommercePaginationData.fromMap(pagination),
    );
  }
}

class CommercePurchaseIntentData {
  const CommercePurchaseIntentData({
    required this.paymentId,
    required this.checkoutUrl,
    required this.orderNsu,
  });

  final String paymentId;
  final String checkoutUrl;
  final String orderNsu;

  factory CommercePurchaseIntentData.fromEnvelope(Map<String, dynamic> map) {
    final data = map['data'];
    if (data is! Map<String, dynamic>) {
      throw const FormatException('Purchase intent invalido.');
    }

    final paymentId = data['payment_id'];
    final checkoutUrl = data['checkout_url'];
    final orderNsu = data['order_nsu'];

    if (paymentId is! String || checkoutUrl is! String || orderNsu is! String) {
      throw const FormatException('Purchase intent invalido.');
    }

    return CommercePurchaseIntentData(
      paymentId: paymentId,
      checkoutUrl: checkoutUrl,
      orderNsu: orderNsu,
    );
  }
}

class CommercePaymentCheckData {
  const CommercePaymentCheckData({
    required this.success,
    required this.paid,
    required this.amount,
    required this.paidAmount,
    required this.installments,
    required this.captureMethod,
  });

  final bool success;
  final bool paid;
  final double amount;
  final double paidAmount;
  final int installments;
  final String captureMethod;

  factory CommercePaymentCheckData.fromMap(Map<String, dynamic> map) {
    final success = map['success'];
    final paid = map['paid'];
    final amount = map['amount'];
    final paidAmount = map['paid_amount'];
    final installments = map['installments'];
    final captureMethod = map['capture_method'];

    if (success is! bool ||
        paid is! bool ||
        amount is! num ||
        paidAmount is! num ||
        installments is! num ||
        captureMethod is! String) {
      throw const FormatException('Resposta de check de pagamento invalida.');
    }

    return CommercePaymentCheckData(
      success: success,
      paid: paid,
      amount: amount.toDouble(),
      paidAmount: paidAmount.toDouble(),
      installments: installments.toInt(),
      captureMethod: captureMethod,
    );
  }
}

class CommerceOrderPaymentIntentData {
  const CommerceOrderPaymentIntentData({
    required this.paymentId,
    required this.provider,
    required this.purpose,
    required this.status,
    required this.checkoutUrl,
    required this.orderNsu,
    required this.amountBrl,
    this.orderId,
  });

  final String paymentId;
  final String provider;
  final String purpose;
  final String status;
  final String checkoutUrl;
  final String orderNsu;
  final double amountBrl;
  final String? orderId;

  factory CommerceOrderPaymentIntentData.fromMap(Map<String, dynamic> map) {
    final paymentId = map['payment_id'];
    final provider = map['provider'];
    final purpose = map['purpose'];
    final status = map['status'];
    final checkoutUrl = map['checkout_url'];
    final orderNsu = map['order_nsu'];
    final amountBrl = map['amount_brl'];

    if (paymentId is! String ||
        provider is! String ||
        purpose is! String ||
        status is! String ||
        checkoutUrl is! String ||
        orderNsu is! String ||
        amountBrl is! num) {
      throw const FormatException('Intent de pagamento do pedido invalida.');
    }

    return CommerceOrderPaymentIntentData(
      paymentId: paymentId,
      provider: provider,
      purpose: purpose,
      status: status,
      checkoutUrl: checkoutUrl,
      orderNsu: orderNsu,
      amountBrl: amountBrl.toDouble(),
      orderId: map['order_id'] is String ? map['order_id'] as String : null,
    );
  }

  factory CommerceOrderPaymentIntentData.fromEnvelope(
    Map<String, dynamic> map,
  ) {
    final data = map['data'];
    if (data is! Map<String, dynamic>) {
      throw const FormatException('Intent de pagamento do pedido invalida.');
    }
    return CommerceOrderPaymentIntentData.fromMap(data);
  }
}

class CommerceOrderPaymentStatusData {
  const CommerceOrderPaymentStatusData({
    required this.orderId,
    required this.paymentStatus,
    required this.paid,
    this.payment,
  });

  final String orderId;
  final String paymentStatus;
  final bool paid;
  final CommerceOrderPaymentIntentData? payment;

  factory CommerceOrderPaymentStatusData.fromEnvelope(
    Map<String, dynamic> map,
  ) {
    final data = map['data'];
    if (data is! Map<String, dynamic>) {
      throw const FormatException('Status de pagamento invalido.');
    }

    final orderId = data['order_id'];
    final paymentStatus = data['payment_status'];
    final paid = data['paid'];
    final payment = data['payment'];

    if (orderId is! String || paymentStatus is! String || paid is! bool) {
      throw const FormatException('Status de pagamento invalido.');
    }

    return CommerceOrderPaymentStatusData(
      orderId: orderId,
      paymentStatus: paymentStatus,
      paid: paid,
      payment: payment is Map<String, dynamic>
          ? CommerceOrderPaymentIntentData.fromMap(payment)
          : null,
    );
  }
}

class CommerceProfileData {
  const CommerceProfileData({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.status,
    this.phoneNumber,
    this.whatsapp,
    this.rankLevel,
    this.rating,
    this.commerceCode,
    this.addressHome,
    this.addressBase,
  });

  final String id;
  final String name;
  final String email;
  final String role;
  final String status;
  final String? phoneNumber;
  final String? whatsapp;
  final String? rankLevel;
  final double? rating;
  final String? commerceCode;
  final CommerceAddressData? addressHome;
  final CommerceAddressData? addressBase;

  factory CommerceProfileData.fromEnvelope(Map<String, dynamic> map) {
    final data = map['data'];
    if (data is! Map<String, dynamic>) {
      throw const FormatException('Perfil commerce invalido.');
    }

    final id = data['id'];
    final name = data['name'];
    final email = data['email'];
    final role = data['role'];
    final status = data['status'];

    if (id is! String ||
        name is! String ||
        email is! String ||
        role is! String ||
        status is! String) {
      throw const FormatException('Perfil commerce invalido.');
    }

    return CommerceProfileData(
      id: id,
      name: name,
      email: email,
      role: role,
      status: status,
      phoneNumber: data['phone_number'] is String
          ? data['phone_number'] as String
          : null,
      whatsapp: data['whatsapp'] is String ? data['whatsapp'] as String : null,
      rankLevel: data['rank_level'] is String
          ? data['rank_level'] as String
          : null,
      rating: data['rating'] is num ? (data['rating'] as num).toDouble() : null,
      commerceCode: data['commerce_id'] is String
          ? data['commerce_id'] as String
          : null,
      addressHome: data['address_home'] is Map<String, dynamic>
          ? CommerceAddressData.fromMap(
              data['address_home'] as Map<String, dynamic>,
            )
          : null,
      addressBase: data['address_base'] is Map<String, dynamic>
          ? CommerceAddressData.fromMap(
              data['address_base'] as Map<String, dynamic>,
            )
          : null,
    );
  }
}
