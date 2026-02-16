import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:frontend_rider/Core/navigation/app_routes.dart';
import 'package:frontend_rider/Core/state/session_controller.dart';
import 'package:frontend_rider/Core/state/session_state.dart';
import 'package:frontend_rider/Core/auth/token_storage.dart';
import 'package:frontend_rider/Modules/auth/application/password_reset_flow_controller.dart';
import 'package:frontend_rider/Modules/auth/infra/auth_repository.dart';
import 'package:frontend_rider/Modules/auth/presentation/forgot_password_page.dart';
import 'package:frontend_rider/Modules/auth/presentation/login_page.dart';
import 'package:frontend_rider/Modules/auth/presentation/onboarding_page.dart';
import 'package:frontend_rider/Modules/auth/presentation/otp_page.dart';
import 'package:frontend_rider/Modules/auth/presentation/register_page.dart';
import 'package:frontend_rider/Modules/auth/presentation/reset_password_page.dart';

class _FakeSessionController extends SessionController {
  @override
  Future<SessionState> build() async {
    return const SessionState.unauthenticated(onboardingCompleted: true);
  }

  @override
  Future<void> completeOnboarding() async {
    state = const AsyncData(
      SessionState.unauthenticated(onboardingCompleted: true),
    );
  }

  @override
  Future<void> signIn({
    required String email,
    required String password,
    required UserContext context,
  }) async {
    state = AsyncData(
      SessionState.authenticated(context, onboardingCompleted: true),
    );
  }

  @override
  Future<void> signUp({
    required String name,
    required String email,
    required String password,
    required UserContext context,
    String? phoneNumber,
  }) async {
    state = AsyncData(
      SessionState.authenticated(context, onboardingCompleted: true),
    );
  }

  @override
  Future<void> logout() async {
    state = const AsyncData(
      SessionState.unauthenticated(onboardingCompleted: true),
    );
  }
}

class _FakeAuthRepository extends AuthRepository {
  _FakeAuthRepository()
    : super(
        dio: Dio(),
        tokenStorage: TokenStorage(secureStorage: const FlutterSecureStorage()),
      );

  int forgotPasswordCalls = 0;
  int verifyOtpCalls = 0;

  @override
  Future<OtpChallengeData> forgotPassword({required String email}) async {
    forgotPasswordCalls += 1;
    return OtpChallengeData(
      challengeId: 'challenge-test-01',
      email: email.trim().toLowerCase(),
      expiresAt: DateTime.now().add(const Duration(minutes: 5)),
      resendInSeconds: 30,
    );
  }

  @override
  Future<OtpVerifyData> verifyOtp({
    required String challengeId,
    required String otp,
  }) async {
    verifyOtpCalls += 1;
    if (otp != '123456') {
      throw Exception('OTP inválido para teste');
    }

    return OtpVerifyData(
      resetToken: 'reset-token-01',
      expiresAt: DateTime.now().add(const Duration(minutes: 10)),
    );
  }
}

Widget _buildRouterApp({
  required String initialLocation,
  required List<RouteBase> routes,
  List<Override> overrides = const <Override>[],
}) {
  final router = GoRouter(initialLocation: initialLocation, routes: routes);

  return ProviderScope(
    overrides: overrides,
    child: MaterialApp.router(
      routerConfig: router,
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

Future<void> _setTestSurface(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(480, 960));
  addTearDown(() => tester.binding.setSurfaceSize(null));
}

void main() {
  testWidgets('auth: login navega para register', (WidgetTester tester) async {
    await _setTestSurface(tester);

    await tester.pumpWidget(
      _buildRouterApp(
        initialLocation: AppRoutes.login,
        routes: <RouteBase>[
          GoRoute(path: AppRoutes.login, builder: (_, __) => const LoginPage()),
          GoRoute(
            path: AppRoutes.register,
            builder: (_, __) => const RegisterPage(),
          ),
        ],
        overrides: <Override>[
          sessionControllerProvider.overrideWith(_FakeSessionController.new),
        ],
      ),
    );

    await tester.pumpAndSettle();
    expect(find.text('Entrar no Roodi'), findsOneWidget);

    await tester.scrollUntilVisible(
      find.text('Criar conta'),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.text('Criar conta'));
    await tester.pumpAndSettle();

    expect(find.text('Perfil de cadastro'), findsOneWidget);
  });

  testWidgets('auth: onboarding conclui e abre login', (
    WidgetTester tester,
  ) async {
    await _setTestSurface(tester);

    await tester.pumpWidget(
      _buildRouterApp(
        initialLocation: AppRoutes.onboarding1,
        routes: <RouteBase>[
          GoRoute(
            path: AppRoutes.onboarding1,
            builder: (_, __) =>
                const OnboardingPage(step: OnboardingStep.step1),
          ),
          GoRoute(
            path: AppRoutes.onboarding2,
            builder: (_, __) =>
                const OnboardingPage(step: OnboardingStep.step2),
          ),
          GoRoute(
            path: AppRoutes.onboarding3,
            builder: (_, __) =>
                const OnboardingPage(step: OnboardingStep.step3),
          ),
          GoRoute(path: AppRoutes.login, builder: (_, __) => const LoginPage()),
        ],
        overrides: <Override>[
          sessionControllerProvider.overrideWith(_FakeSessionController.new),
        ],
      ),
    );

    await tester.pumpAndSettle();
    expect(find.text('Bem-vindo ao Roodi'), findsOneWidget);

    await tester.tap(find.text('Proximo'));
    await tester.pumpAndSettle();
    expect(find.text('Acompanhe em tempo real'), findsOneWidget);

    await tester.tap(find.text('Proximo'));
    await tester.pumpAndSettle();
    expect(find.text('Tudo pronto para comecar'), findsOneWidget);

    await tester.tap(find.text('Entrar no app'));
    await tester.pumpAndSettle();
    expect(find.text('Entrar no Roodi'), findsOneWidget);
  });

  testWidgets('auth: forgot -> otp -> reset', (WidgetTester tester) async {
    await _setTestSurface(tester);

    final fakeAuthRepository = _FakeAuthRepository();

    await tester.pumpWidget(
      _buildRouterApp(
        initialLocation: AppRoutes.forgotPassword,
        routes: <RouteBase>[
          GoRoute(
            path: AppRoutes.forgotPassword,
            builder: (_, __) => const ForgotPasswordPage(),
          ),
          GoRoute(path: AppRoutes.otp, builder: (_, __) => const OtpPage()),
          GoRoute(
            path: AppRoutes.resetPassword,
            builder: (_, __) => const ResetPasswordPage(),
          ),
        ],
        overrides: <Override>[
          authRepositoryProvider.overrideWithValue(fakeAuthRepository),
        ],
      ),
    );

    await tester.pumpAndSettle();
    expect(find.text('Recuperacao de senha'), findsOneWidget);

    await tester.enterText(find.byType(TextFormField).first, 'rider@roodi.app');
    await tester.tap(find.text('Enviar codigo'));
    await tester.pumpAndSettle();

    expect(fakeAuthRepository.forgotPasswordCalls, 1);
    expect(find.text('Validar codigo'), findsOneWidget);

    final otpFields = find.byType(TextField);
    expect(otpFields, findsNWidgets(6));

    for (var i = 0; i < 6; i += 1) {
      await tester.enterText(otpFields.at(i), '${i + 1}');
    }

    await tester.tap(find.text('Verificar'));
    await tester.pumpAndSettle();

    expect(fakeAuthRepository.verifyOtpCalls, 1);
    expect(find.text('Definir nova senha'), findsOneWidget);

    final container = ProviderScope.containerOf(
      tester.element(find.byType(ResetPasswordPage)),
    );
    final flow = container.read(passwordResetFlowControllerProvider);
    expect(flow.hasResetToken, isTrue);
  });
}
