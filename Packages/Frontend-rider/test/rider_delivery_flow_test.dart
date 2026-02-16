import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:frontend_rider/Modules/rider-home-flow/domain/rider_models.dart';
import 'package:frontend_rider/Modules/rider-home-flow/infra/rider_repository.dart';
import 'package:frontend_rider/Modules/rider-home-flow/presentation/rider_home_page.dart';

class _FakeRiderRepository extends RiderRepository {
  _FakeRiderRepository() : super(dio: Dio());

  bool _online = false;
  bool _hasOffer = false;
  String? _activeStatus;
  int completeCalls = 0;

  @override
  Future<RiderDashboardData> getDashboard() async {
    return RiderDashboardData(
      availability: _online ? 'online' : 'offline',
      todayEarningsBrl: 86.50,
      monthEarningsBrl: 450.00,
      todayDeliveries: 8,
      todayOnlineMinutes: 252,
      completedDeliveriesTotal: 120,
      updatedAt: DateTime.now(),
      activeOrder: _buildActiveOrder(),
    );
  }

  @override
  Future<RiderOfferData?> getCurrentOffer() async {
    if (!_online || !_hasOffer) {
      return null;
    }

    return RiderOfferData(
      offerId: 'offer-01',
      orderId: 'order-01',
      expiresAt: DateTime.now().add(const Duration(minutes: 2)),
      quote: const RiderOfferQuoteData(
        pickupType: 'Comida',
        estimatedValueBrl: 12.50,
        totalDistanceM: 3100,
        routeSummary: '1.2 km ate o comercio + 1.9 km ate o cliente',
      ),
    );
  }

  @override
  Future<RiderOrderData?> getActiveOrder() async {
    return _buildActiveOrder();
  }

  @override
  Future<RiderAvailabilityData> setAvailability({required bool online}) async {
    _online = online;
    if (online) {
      _hasOffer = true;
    } else {
      _hasOffer = false;
      _activeStatus = null;
    }

    return RiderAvailabilityData(
      status: online ? 'online' : 'offline',
      updatedAt: DateTime.now(),
    );
  }

  @override
  Future<RiderOrderData> acceptOffer(String offerId) async {
    _hasOffer = false;
    _activeStatus = 'to_merchant';
    return _buildActiveOrder()!;
  }

  @override
  Future<void> rejectOffer({required String offerId, String? reason}) async {
    _hasOffer = false;
  }

  @override
  Future<void> appendOrderEvent({
    required String orderId,
    required String eventType,
    String? note,
  }) async {
    switch (eventType) {
      case 'rider_at_merchant':
        _activeStatus = 'at_merchant';
        break;
      case 'waiting_order':
        _activeStatus = 'waiting_order';
        break;
      case 'rider_to_customer':
        _activeStatus = 'to_customer';
        break;
      case 'rider_at_customer':
        _activeStatus = 'at_customer';
        break;
      case 'finishing_delivery':
        _activeStatus = 'finishing_delivery';
        break;
      default:
        break;
    }
  }

  @override
  Future<RiderOrderData> completeOrder({
    required String orderId,
    required String confirmationCode,
  }) async {
    if (confirmationCode != '1234') {
      throw Exception('codigo invalido');
    }

    completeCalls += 1;
    _activeStatus = null;
    _hasOffer = false;
    return RiderOrderData(
      id: 'order-01',
      status: 'completed',
      totalBrl: 12.50,
      createdAt: DateTime.now(),
      distanceM: 3100,
      durationS: 1080,
      etaMin: 0,
    );
  }

  RiderOrderData? _buildActiveOrder() {
    if (_activeStatus == null) {
      return null;
    }

    return RiderOrderData(
      id: 'order-01',
      status: _activeStatus!,
      totalBrl: 12.50,
      createdAt: DateTime.now(),
      distanceM: 3100,
      durationS: 1080,
      etaMin: 18,
      destination: const RiderAddressData(
        street: 'Rua Alvorada',
        number: '120',
        neighborhood: 'Sao Jose',
        city: 'Imperatriz',
        state: 'MA',
      ),
    );
  }
}

Future<void> _pumpForAction(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 300));
}

void main() {
  testWidgets('rider: fluxo completo ate entrega finalizada', (
    WidgetTester tester,
  ) async {
    final fakeRepository = _FakeRiderRepository();

    await tester.pumpWidget(
      ProviderScope(
        overrides: <Override>[
          riderRepositoryProvider.overrideWithValue(fakeRepository),
        ],
        child: const MaterialApp(home: RiderHomePage()),
      ),
    );

    await _pumpForAction(tester);
    expect(find.text('Ficar online'), findsOneWidget);

    await tester.tap(find.text('Ficar online'));
    await _pumpForAction(tester);
    expect(find.text('Aceitar pedido'), findsOneWidget);

    await tester.tap(find.text('Aceitar pedido'));
    await _pumpForAction(tester);
    expect(find.textContaining('Cheguei no'), findsOneWidget);

    await tester.tap(find.textContaining('Cheguei no'));
    await _pumpForAction(tester);
    expect(find.text('Pedido em preparo'), findsOneWidget);

    await tester.tap(find.text('Pedido em preparo'));
    await _pumpForAction(tester);
    expect(find.text('Pedido pronto'), findsOneWidget);

    await tester.tap(find.text('Pedido pronto'));
    await _pumpForAction(tester);
    expect(find.text('Cheguei no cliente'), findsOneWidget);

    await tester.tap(find.text('Cheguei no cliente'));
    await _pumpForAction(tester);
    expect(find.text('Iniciar finalização'), findsOneWidget);

    await tester.tap(find.text('Iniciar finalização'));
    await _pumpForAction(tester);

    await tester.enterText(find.byType(TextField).first, '1234');
    await tester.tap(find.text('Confirmar entrega'));
    await _pumpForAction(tester);

    expect(fakeRepository.completeCalls, 1);
    expect(find.textContaining('Aguardando solicita'), findsOneWidget);
  });
}
