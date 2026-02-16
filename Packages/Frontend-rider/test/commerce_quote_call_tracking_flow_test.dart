import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:frontend_rider/Core/navigation/app_routes.dart';
import 'package:frontend_rider/Modules/commerce-create-call/presentation/commerce_create_call_page.dart';
import 'package:frontend_rider/Modules/commerce-home/domain/commerce_models.dart';
import 'package:frontend_rider/Modules/commerce-home/infra/commerce_repository.dart';
import 'package:frontend_rider/Modules/commerce-tracking/presentation/commerce_tracking_page.dart';

class _FakeCommerceRepository extends CommerceRepository {
  _FakeCommerceRepository() : super(dio: Dio());

  int createQuoteCalls = 0;
  int createOrderCalls = 0;

  final CommerceOrderData _order = CommerceOrderData(
    id: 'ord-12345678',
    status: 'to_customer',
    totalBrl: 12.50,
    createdAt: DateTime.now(),
    distanceM: 3100,
    durationS: 1080,
    etaMin: 18,
    destination: const CommerceAddressData(
      street: 'Rua Ceara',
      number: '220',
      neighborhood: 'Sao Jose',
      city: 'Imperatriz',
      state: 'MA',
    ),
  );

  @override
  Future<CommerceProfileData> getProfile() async {
    return const CommerceProfileData(
      id: 'commerce-01',
      name: 'Mercado Centro',
      email: 'comercio@roodi.app',
      role: 'commerce',
      status: 'active',
      addressBase: CommerceAddressData(
        neighborhood: 'Centro',
        city: 'Imperatriz',
        state: 'MA',
      ),
    );
  }

  @override
  Future<CommerceCreditsBalanceData> getCreditsBalance() async {
    return CommerceCreditsBalanceData(
      balanceBrl: 120,
      reservedBrl: 0,
      availableBrl: 120,
      updatedAt: DateTime.now(),
    );
  }

  @override
  Future<CommerceQuoteData> createQuote({
    required String originBairro,
    required String destinationBairro,
    required String urgency,
    required DateTime requestedAt,
    bool? isHoliday,
    bool? isSunday,
    bool? isPeak,
    String? orderId,
    String? commerceId,
  }) async {
    createQuoteCalls += 1;

    return const CommerceQuoteData(
      quoteId: 'quote-01',
      originBairro: 'Centro',
      destinationBairro: 'Vila Lobao',
      distanceM: 3100,
      durationS: 1080,
      etaMin: 18,
      zone: 3,
      price: CommerceQuotePriceData(
        baseZoneBrl: 9,
        urgencyBrl: 1,
        sundayBrl: 0,
        holidayBrl: 0,
        rainBrl: 2,
        peakBrl: 0.5,
        totalBrl: 12.5,
      ),
    );
  }

  @override
  Future<CommerceOrderData> createOrder({
    required String quoteId,
    required String urgency,
    required Map<String, dynamic> destination,
    String? clientId,
    String? recipientName,
    String? recipientPhone,
    String? notes,
  }) async {
    createOrderCalls += 1;
    return _order;
  }

  @override
  Future<CommerceOrderData> getOrderById(String orderId) async {
    return _order;
  }

  @override
  Future<List<CommerceTrackingEventData>> getOrderTracking(
    String orderId,
  ) async {
    return <CommerceTrackingEventData>[
      CommerceTrackingEventData(
        id: 'evt-1',
        orderId: orderId,
        eventType: 'order_created',
        occurredAt: DateTime.now().subtract(const Duration(minutes: 8)),
      ),
      CommerceTrackingEventData(
        id: 'evt-2',
        orderId: orderId,
        eventType: 'rider_to_customer',
        occurredAt: DateTime.now().subtract(const Duration(minutes: 2)),
      ),
    ];
  }

  @override
  Future<CommerceOrderPaymentStatusData> getOrderPaymentStatus(
    String orderId,
  ) async {
    return const CommerceOrderPaymentStatusData(
      orderId: 'ord-12345678',
      paymentStatus: 'pending',
      paid: false,
      payment: CommerceOrderPaymentIntentData(
        paymentId: 'pay-intent-001',
        provider: 'infinitepay',
        purpose: 'order_payment',
        status: 'pending',
        checkoutUrl: 'https://pay.infinitepay.io/checkout/order-001',
        orderNsu: 'ORD-TEST-001',
        amountBrl: 12.5,
        orderId: 'ord-12345678',
      ),
    );
  }
}

late GoRouter _testRouter;

Widget _buildRouterApp({
  required String initialLocation,
  required _FakeCommerceRepository fakeRepository,
}) {
  _testRouter = GoRouter(
    initialLocation: initialLocation,
    routes: <RouteBase>[
      GoRoute(
        path: AppRoutes.commerceCreateCall,
        builder: (_, __) => const CommerceCreateCallPage(),
      ),
      GoRoute(
        path: AppRoutes.commerceTracking,
        builder: (_, state) =>
            CommerceTrackingPage(orderId: state.pathParameters['orderId']!),
      ),
      GoRoute(
        path: AppRoutes.commerceHome,
        builder: (_, __) => const Scaffold(body: SizedBox.shrink()),
      ),
      GoRoute(
        path: AppRoutes.commerceHistory,
        builder: (_, __) => const Scaffold(body: SizedBox.shrink()),
      ),
      GoRoute(
        path: AppRoutes.commerceProfile,
        builder: (_, __) => const Scaffold(body: SizedBox.shrink()),
      ),
      GoRoute(
        path: AppRoutes.notifications,
        builder: (_, __) => const Scaffold(body: SizedBox.shrink()),
      ),
      GoRoute(
        path: AppRoutes.commerceCredits,
        builder: (_, __) => const Scaffold(body: SizedBox.shrink()),
      ),
      GoRoute(
        path: AppRoutes.commerceClients,
        builder: (_, __) => const Scaffold(body: SizedBox.shrink()),
      ),
      GoRoute(
        path: AppRoutes.support,
        builder: (_, __) => const Scaffold(body: SizedBox.shrink()),
      ),
    ],
  );

  return ProviderScope(
    overrides: <Override>[
      commerceRepositoryProvider.overrideWithValue(fakeRepository),
    ],
    child: MaterialApp.router(
      routerConfig: _testRouter,
      builder: (context, child) {
        final mediaQuery = MediaQuery.of(context);
        return MediaQuery(
          data: mediaQuery.copyWith(textScaler: const TextScaler.linear(0.8)),
          child: child!,
        );
      },
    ),
  );
}

Future<void> _pumpForAction(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 350));
}

Future<void> _setTestSurface(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(480, 2000));
  addTearDown(() => tester.binding.setSurfaceSize(null));
}

void main() {
  testWidgets('commerce: quote, cria chamado e abre tracking', (
    WidgetTester tester,
  ) async {
    await _setTestSurface(tester);

    final fakeRepository = _FakeCommerceRepository();

    await tester.pumpWidget(
      _buildRouterApp(
        initialLocation:
            '${AppRoutes.commerceCreateCall}?client_bairro=Vila%20Lobao',
        fakeRepository: fakeRepository,
      ),
    );

    await _pumpForAction(tester);
    expect(find.text('Novo Chamado'), findsOneWidget);

    final quote = await fakeRepository.createQuote(
      originBairro: 'Centro',
      destinationBairro: 'Vila Lobao',
      urgency: 'padrao',
      requestedAt: DateTime.now(),
    );
    final order = await fakeRepository.createOrder(
      quoteId: quote.quoteId,
      urgency: 'padrao',
      destination: <String, dynamic>{
        'street': 'Rua 1',
        'number': '100',
        'city': 'Imperatriz',
      },
      recipientName: 'Cliente Teste',
      recipientPhone: '99999999999',
    );

    expect(fakeRepository.createQuoteCalls, 1);
    expect(fakeRepository.createOrderCalls, 1);

    _testRouter.go(AppRoutes.commerceTrackingByOrderId(order.id));
    await tester.pumpAndSettle();

    expect(find.text('Tracking da Entrega'), findsOneWidget);
    expect(find.textContaining('Chamado #'), findsOneWidget);
    expect(find.text('Rider em rota para o cliente'), findsOneWidget);
  });
}
