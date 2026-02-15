import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/client_models.dart';

final clientsControllerProvider =
    NotifierProvider<ClientsController, List<CommerceClientData>>(
      ClientsController.new,
    );

class ClientsController extends Notifier<List<CommerceClientData>> {
  static final List<CommerceClientData> _seedClients = <CommerceClientData>[
    const CommerceClientData(
      id: 'cli_001',
      name: 'Amanda Silva',
      phone: '(11) 98888-2211',
      address: 'Rua das Flores, 210',
      complement: 'Portao azul',
      lastOrderLabel: 'Hoje, 14:20',
      tag: 'Recente',
    ),
    const CommerceClientData(
      id: 'cli_002',
      name: 'Rafael Costa',
      phone: '(11) 97777-1122',
      address: 'Av. Brasil, 502',
      complement: 'Apto 31B',
      lastOrderLabel: 'Ontem, 18:04',
      tag: 'Frequente',
    ),
    const CommerceClientData(
      id: 'cli_003',
      name: 'Carla Mendes',
      phone: '(11) 96666-4455',
      address: 'Rua Aurora, 98',
      complement: 'Casa',
      lastOrderLabel: '05/02, 12:22',
      tag: '2 enderecos',
    ),
  ];

  @override
  List<CommerceClientData> build() {
    return _seedClients;
  }

  void addClient(CommerceClientData client) {
    state = <CommerceClientData>[client, ...state];
  }
}
