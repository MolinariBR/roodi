class CommerceProductData {
  const CommerceProductData({
    required this.id,
    required this.name,
    required this.description,
    required this.priceBrl,
    required this.stock,
    required this.status,
    required this.createdAt,
  });

  final String id;
  final String name;
  final String? description;
  final double priceBrl;
  final int stock;
  final String status;
  final DateTime createdAt;

  bool get isActive => status == 'active';

  bool get lowStock => stock > 0 && stock <= 5;
  bool get outOfStock => stock <= 0;

  CommerceProductData copyWith({
    String? id,
    String? name,
    String? description,
    double? priceBrl,
    int? stock,
    String? status,
    DateTime? createdAt,
  }) {
    return CommerceProductData(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      priceBrl: priceBrl ?? this.priceBrl,
      stock: stock ?? this.stock,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  factory CommerceProductData.fromMap(Map<String, dynamic> map) {
    final id = map['id'];
    final name = map['name'];
    final description = map['description'];
    final priceBrl = map['price_brl'];
    final stock = map['stock'];
    final status = map['status'];
    final createdAt = map['created_at'];

    if (id is! String ||
        name is! String ||
        priceBrl is! num ||
        status is! String ||
        createdAt is! String) {
      throw const FormatException('Produto inválido.');
    }

    return CommerceProductData(
      id: id,
      name: name,
      description: description is String && description.trim().isNotEmpty
          ? description.trim()
          : null,
      priceBrl: priceBrl.toDouble(),
      stock: stock is num ? stock.toInt() : 0,
      status: status,
      createdAt: DateTime.parse(createdAt),
    );
  }
}

class UpsertCommerceProductInput {
  const UpsertCommerceProductInput({
    required this.name,
    required this.priceBrl,
    required this.stock,
    this.description,
  });

  final String name;
  final double priceBrl;
  final int stock;
  final String? description;
}
