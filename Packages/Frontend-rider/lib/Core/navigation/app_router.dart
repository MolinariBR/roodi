import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../Modules/auth/presentation/forgot_password_page.dart';
import '../../Modules/auth/presentation/login_page.dart';
import '../../Modules/auth/presentation/onboarding_page.dart';
import '../../Modules/auth/presentation/otp_page.dart';
import '../../Modules/auth/presentation/register_page.dart';
import '../../Modules/auth/presentation/reset_password_page.dart';
import '../../Modules/auth/presentation/splash_page.dart';
import '../../Modules/commerce-home/presentation/commerce_home_page.dart';
import '../../Modules/notifications/presentation/notifications_page.dart';
import '../../Modules/rider-home-flow/presentation/rider_home_page.dart';
import '../../Modules/support/presentation/support_page.dart';
import '../state/session_controller.dart';
import '../state/session_state.dart';
import 'app_routes.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final session = ref.watch(sessionControllerProvider);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    routes: <RouteBase>[
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: AppRoutes.onboarding1,
        builder: (context, state) =>
            const OnboardingPage(step: OnboardingStep.step1),
      ),
      GoRoute(
        path: AppRoutes.onboarding2,
        builder: (context, state) =>
            const OnboardingPage(step: OnboardingStep.step2),
      ),
      GoRoute(
        path: AppRoutes.onboarding3,
        builder: (context, state) =>
            const OnboardingPage(step: OnboardingStep.step3),
      ),
      GoRoute(
        path: AppRoutes.register,
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        builder: (context, state) => const ForgotPasswordPage(),
      ),
      GoRoute(
        path: AppRoutes.otp,
        builder: (context, state) => const OtpPage(),
      ),
      GoRoute(
        path: AppRoutes.resetPassword,
        builder: (context, state) => const ResetPasswordPage(),
      ),
      GoRoute(
        path: AppRoutes.riderHome,
        builder: (context, state) => const RiderHomePage(),
      ),
      GoRoute(
        path: AppRoutes.commerceHome,
        builder: (context, state) => const CommerceHomePage(),
      ),
      GoRoute(
        path: AppRoutes.notifications,
        builder: (context, state) => const NotificationsPage(),
      ),
      GoRoute(
        path: AppRoutes.support,
        builder: (context, state) => const SupportPage(),
      ),
    ],
    redirect: (context, state) =>
        _redirectForSession(session, state.matchedLocation),
  );
});

String? _redirectForSession(
  AsyncValue<SessionState> sessionAsync,
  String location,
) {
  if (sessionAsync.isLoading) {
    return location == AppRoutes.splash ? null : AppRoutes.splash;
  }

  final session =
      sessionAsync.valueOrNull ??
      const SessionState.unauthenticated(onboardingCompleted: false);
  final isAuthenticated = session.isAuthenticated;
  final isAuthRoute = AppRoutes.isAuthRoute(location);
  final isOnboardingRoute = AppRoutes.isOnboardingRoute(location);
  final isProtected = AppRoutes.isProtectedRoute(location);

  if (!session.onboardingCompleted &&
      location != AppRoutes.splash &&
      !isOnboardingRoute) {
    return AppRoutes.onboarding1;
  }

  if (session.onboardingCompleted && isOnboardingRoute) {
    return isAuthenticated ? session.homeRoute : AppRoutes.login;
  }

  if (!isAuthenticated && isProtected) {
    return AppRoutes.login;
  }

  if (isAuthenticated && isAuthRoute) {
    return session.homeRoute;
  }

  if (isAuthenticated &&
      location.startsWith('/rider/') &&
      session.context != UserContext.rider) {
    return session.homeRoute;
  }

  if (isAuthenticated &&
      location.startsWith('/commerce/') &&
      session.context != UserContext.commerce) {
    return session.homeRoute;
  }

  return null;
}
