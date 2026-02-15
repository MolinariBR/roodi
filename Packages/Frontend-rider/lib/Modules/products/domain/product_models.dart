class CommerceProductData {
  const CommerceProductData({
    required this.id,
    required this.name,
    required this.category,
    required this.sku,
    required this.priceBrl,
    required this.stock,
    required this.sales,
    required this.isActive,
  });

  final String id;
  final String name;
  final String category;
  final String sku;
  final double priceBrl;
  final int stock;
  final int sales;
  final bool isActive;

  bool get lowStock => stock > 0 && stock <= 5;
  bool get outOfStock => stock <= 0;

  CommerceProductData copyWith({
    String? id,
    String? name,
    String? category,
    String? sku,
    double? priceBrl,
    int? stock,
    int? sales,
    bool? isActive,
  }) {
    return CommerceProductData(
      id: id ?? this.id,
      name: name ?? this.name,
      category: category ?? this.category,
      sku: sku ?? this.sku,
      priceBrl: priceBrl ?? this.priceBrl,
      stock: stock ?? this.stock,
      sales: sales ?? this.sales,
      isActive: isActive ?? this.isActive,
    );
  }
}
