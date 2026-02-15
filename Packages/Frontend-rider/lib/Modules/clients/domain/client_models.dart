class CommerceClientData {
  const CommerceClientData({
    required this.id,
    required this.name,
    required this.phone,
    required this.address,
    this.complement,
    this.lastOrderLabel,
    this.tag,
  });

  final String id;
  final String name;
  final String phone;
  final String address;
  final String? complement;
  final String? lastOrderLabel;
  final String? tag;

  CommerceClientData copyWith({
    String? id,
    String? name,
    String? phone,
    String? address,
    String? complement,
    String? lastOrderLabel,
    String? tag,
  }) {
    return CommerceClientData(
      id: id ?? this.id,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      address: address ?? this.address,
      complement: complement ?? this.complement,
      lastOrderLabel: lastOrderLabel ?? this.lastOrderLabel,
      tag: tag ?? this.tag,
    );
  }
}
