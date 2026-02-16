import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/product_models.dart';
import '../infra/products_repository.dart';

final productsControllerProvider =
    AsyncNotifierProvider<ProductsController, List<CommerceProductData>>(
      ProductsController.new,
    );

class ProductsController extends AsyncNotifier<List<CommerceProductData>> {
  @override
  Future<List<CommerceProductData>> build() async {
    return _load();
  }

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_load);
  }

  Future<void> addProduct(UpsertCommerceProductInput input) async {
    final repository = ref.read(productsRepositoryProvider);
    final created = await repository.create(input);
    final current = state.valueOrNull ?? const <CommerceProductData>[];
    state = AsyncData(<CommerceProductData>[created, ...current]);
  }

  Future<void> updateProduct({
    required String productId,
    required UpsertCommerceProductInput input,
  }) async {
    final repository = ref.read(productsRepositoryProvider);
    final updated = await repository.update(productId: productId, input: input);
    final current = state.valueOrNull ?? const <CommerceProductData>[];
    state = AsyncData(
      current
          .map((item) => item.id == productId ? updated : item)
          .toList(growable: false),
    );
  }

  Future<void> toggleStatus(String productId) async {
    final current = state.valueOrNull ?? const <CommerceProductData>[];
    CommerceProductData? target;
    for (final item in current) {
      if (item.id == productId) {
        target = item;
        break;
      }
    }
    if (target == null) {
      return;
    }

    final nextStatus = target.isActive ? 'paused' : 'active';
    final repository = ref.read(productsRepositoryProvider);
    final updated = await repository.updateStatus(
      productId: productId,
      status: nextStatus,
    );

    state = AsyncData(
      current
          .map((item) => item.id == productId ? updated : item)
          .toList(growable: false),
    );
  }

  Future<List<CommerceProductData>> _load() async {
    final repository = ref.read(productsRepositoryProvider);
    return repository.list();
  }
}
