class RiderProfileData {
  const RiderProfileData({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.status,
    this.phoneNumber,
    this.whatsapp,
    this.rankLevel,
    this.rating,
    this.riderCode,
    this.addressHome,
    this.addressBase,
    this.bankAccount,
    this.vehicle,
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
  final String? riderCode;
  final RiderProfileAddressData? addressHome;
  final RiderProfileAddressData? addressBase;
  final RiderProfileBankAccountData? bankAccount;
  final RiderProfileVehicleData? vehicle;

  factory RiderProfileData.fromEnvelope(Map<String, dynamic> map) {
    final data = map['data'];
    if (data is! Map<String, dynamic>) {
      throw const FormatException('Resposta de perfil invalida.');
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
      throw const FormatException('Dados de perfil invalidos.');
    }

    return RiderProfileData(
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
      riderCode: data['rider_id'] is String ? data['rider_id'] as String : null,
      addressHome: data['address_home'] is Map<String, dynamic>
          ? RiderProfileAddressData.fromMap(
              data['address_home'] as Map<String, dynamic>,
            )
          : null,
      addressBase: data['address_base'] is Map<String, dynamic>
          ? RiderProfileAddressData.fromMap(
              data['address_base'] as Map<String, dynamic>,
            )
          : null,
      bankAccount: data['bank_account'] is Map<String, dynamic>
          ? RiderProfileBankAccountData.fromMap(
              data['bank_account'] as Map<String, dynamic>,
            )
          : null,
      vehicle: data['vehicle'] is Map<String, dynamic>
          ? RiderProfileVehicleData.fromMap(
              data['vehicle'] as Map<String, dynamic>,
            )
          : null,
    );
  }
}

class RiderProfileAddressData {
  const RiderProfileAddressData({
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

  factory RiderProfileAddressData.fromMap(Map<String, dynamic> map) {
    return RiderProfileAddressData(
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

  String summary() {
    final parts = <String>[
      if (street != null && street!.isNotEmpty) street!,
      if (number != null && number!.isNotEmpty) number!,
      if (neighborhood != null && neighborhood!.isNotEmpty) neighborhood!,
      if (city != null && city!.isNotEmpty) city!,
    ];
    if (parts.isEmpty) {
      return 'Nao informado';
    }
    return parts.join(' • ');
  }

  Map<String, dynamic> toRequestMap() {
    return <String, dynamic>{
      if (cep != null) 'cep': cep,
      if (state != null) 'state': state,
      if (city != null) 'city': city,
      if (neighborhood != null) 'neighborhood': neighborhood,
      if (street != null) 'street': street,
      if (number != null) 'number': number,
      if (complement != null) 'complement': complement,
    };
  }
}

class RiderProfileBankAccountData {
  const RiderProfileBankAccountData({
    this.bank,
    this.agency,
    this.account,
    this.accountType,
    this.pixKey,
  });

  final String? bank;
  final String? agency;
  final String? account;
  final String? accountType;
  final String? pixKey;

  factory RiderProfileBankAccountData.fromMap(Map<String, dynamic> map) {
    return RiderProfileBankAccountData(
      bank: map['bank'] is String ? map['bank'] as String : null,
      agency: map['agency'] is String ? map['agency'] as String : null,
      account: map['account'] is String ? map['account'] as String : null,
      accountType: map['account_type'] is String
          ? map['account_type'] as String
          : null,
      pixKey: map['pix_key'] is String ? map['pix_key'] as String : null,
    );
  }

  Map<String, dynamic> toRequestMap() {
    return <String, dynamic>{
      if (bank != null) 'bank': bank,
      if (agency != null) 'agency': agency,
      if (account != null) 'account': account,
      if (accountType != null) 'account_type': accountType,
      if (pixKey != null) 'pix_key': pixKey,
    };
  }
}

class RiderProfileVehicleData {
  const RiderProfileVehicleData({
    this.type,
    this.brand,
    this.model,
    this.year,
    this.plate,
  });

  final String? type;
  final String? brand;
  final String? model;
  final int? year;
  final String? plate;

  factory RiderProfileVehicleData.fromMap(Map<String, dynamic> map) {
    return RiderProfileVehicleData(
      type: map['type'] is String ? map['type'] as String : null,
      brand: map['brand'] is String ? map['brand'] as String : null,
      model: map['model'] is String ? map['model'] as String : null,
      year: map['year'] is num ? (map['year'] as num).toInt() : null,
      plate: map['plate'] is String ? map['plate'] as String : null,
    );
  }

  String summary() {
    final parts = <String>[
      if (brand != null && brand!.isNotEmpty) brand!,
      if (model != null && model!.isNotEmpty) model!,
      if (year != null) '$year',
    ];
    if (parts.isEmpty) {
      return 'Nao informado';
    }
    return parts.join(' ');
  }

  Map<String, dynamic> toRequestMap() {
    return <String, dynamic>{
      if (type != null) 'type': type,
      if (brand != null) 'brand': brand,
      if (model != null) 'model': model,
      if (year != null) 'year': year,
      if (plate != null) 'plate': plate,
    };
  }
}
