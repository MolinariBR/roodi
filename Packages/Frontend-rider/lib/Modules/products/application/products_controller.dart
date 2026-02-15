import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/product_models.dart';

final productsControllerProvider =
    NotifierProvider<ProductsController, List<CommerceProductData>>(
      ProductsController.new,
    );

class ProductsController extends Notifier<List<CommerceProductData>> {
  static final List<CommerceProductData> _seedProducts = <CommerceProductData>[
    const CommerceProductData(
      id: 'prd_001',
      name: 'Combo Burger Artesanal',
      category: 'Lanches',
      sku: 'BRG-102',
      priceBrl: 28.90,
      stock: 37,
      sales: 124,
      isActive: true,
    ),
    const CommerceProductData(
      id: 'prd_002',
      name: 'Cafe Gelado 400ml',
      category: 'Bebidas',
      sku: 'CAF-211',
      priceBrl: 11.50,
      stock: 4,
      sales: 78,
      isActive: true,
    ),
    const CommerceProductData(
      id: 'prd_003',
      name: 'Milkshake Choco 500ml',
      category: 'Sobremesas',
      sku: 'MLK-330',
      priceBrl: 17.90,
      stock: 0,
      sales: 0,
      isActive: false,
    ),
  ];

  @override
  List<CommerceProductData> build() {
    return _seedProducts;
  }

  void addProduct(CommerceProductData product) {
    state = <CommerceProductData>[product, ...state];
  }

  void toggleStatus(String productId) {
    state = state
        .map((item) {
          if (item.id != productId) {
            return item;
          }
          return item.copyWith(isActive: !item.isActive);
        })
        .toList(growable: false);
  }
}
