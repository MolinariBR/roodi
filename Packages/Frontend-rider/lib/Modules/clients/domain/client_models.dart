class CommerceClientData {
  const CommerceClientData({
    required this.id,
    required this.name,
    required this.phone,
    required this.address,
    required this.createdAt,
    this.email,
    this.complement,
    this.notes,
  });

  final String id;
  final String name;
  final String phone;
  final String address;
  final DateTime createdAt;
  final String? email;
  final String? complement;
  final String? notes;

  bool get isRecent => DateTime.now().difference(createdAt).inDays <= 2;
  bool get isFrequent => notes?.toLowerCase().contains('frequente') ?? false;
  String? get tag {
    if (isRecent) {
      return 'Recente';
    }
    if (isFrequent) {
      return 'Frequente';
    }
    return null;
  }

  CommerceClientData copyWith({
    String? id,
    String? name,
    String? phone,
    String? address,
    DateTime? createdAt,
    String? email,
    String? complement,
    String? notes,
  }) {
    return CommerceClientData(
      id: id ?? this.id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      address: address ?? this.address,
      createdAt: createdAt ?? this.createdAt,
      email: email ?? this.email,
      complement: complement ?? this.complement,
      notes: notes ?? this.notes,
    );
  }

  factory CommerceClientData.fromMap(Map<String, dynamic> map) {
    final id = map['id'];
    final name = map['name'];
    final phone = map['phone_number'];
    final createdAt = map['created_at'];
    final address = map['address'];
    final notes = map['notes'];
    final email = map['email'];

    if (id is! String ||
        name is! String ||
        phone is! String ||
        createdAt is! String) {
      throw const FormatException('Cliente inválido.');
    }

    String displayAddress = '-';
    String? complement;
    if (address is Map<String, dynamic>) {
      final parts = <String>[
        if (address['street'] is String &&
            (address['street'] as String).trim().isNotEmpty)
          (address['street'] as String).trim(),
        if (address['number'] is String &&
            (address['number'] as String).trim().isNotEmpty)
          (address['number'] as String).trim(),
        if (address['neighborhood'] is String &&
            (address['neighborhood'] as String).trim().isNotEmpty)
          (address['neighborhood'] as String).trim(),
        if (address['city'] is String &&
            (address['city'] as String).trim().isNotEmpty)
          (address['city'] as String).trim(),
      ];
      if (parts.isNotEmpty) {
        displayAddress = parts.join(', ');
      }
      if (address['complement'] is String &&
          (address['complement'] as String).trim().isNotEmpty) {
        complement = (address['complement'] as String).trim();
      }
    }

    return CommerceClientData(
      id: id,
      name: name,
      phone: phone,
      address: displayAddress,
      createdAt: DateTime.parse(createdAt),
      email: email is String && email.trim().isNotEmpty ? email.trim() : null,
      complement: complement,
      notes: notes is String && notes.trim().isNotEmpty ? notes.trim() : null,
    );
  }
}

class CreateCommerceClientInput {
  const CreateCommerceClientInput({
    required this.name,
    required this.phone,
    required this.address,
    this.complement,
    this.neighborhood,
  });

  final String name;
  final String phone;
  final String address;
  final String? complement;
  final String? neighborhood;
}
