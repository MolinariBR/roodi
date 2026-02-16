import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/client_models.dart';
import '../infra/clients_repository.dart';

final clientsControllerProvider =
    AsyncNotifierProvider<ClientsController, List<CommerceClientData>>(
      ClientsController.new,
    );

class ClientsController extends AsyncNotifier<List<CommerceClientData>> {
  @override
  Future<List<CommerceClientData>> build() async {
    return _load();
  }

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_load);
  }

  Future<void> addClient(CreateCommerceClientInput input) async {
    final repository = ref.read(clientsRepositoryProvider);
    final created = await repository.create(input);
    final current = state.valueOrNull ?? const <CommerceClientData>[];
    state = AsyncData(<CommerceClientData>[created, ...current]);
  }

  Future<List<CommerceClientData>> _load() async {
    final repository = ref.read(clientsRepositoryProvider);
    return repository.list();
  }
}
