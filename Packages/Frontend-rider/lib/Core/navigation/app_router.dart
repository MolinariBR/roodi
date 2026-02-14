import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../Modules/auth/presentation/forgot_password_page.dart';
import '../../Modules/auth/presentation/login_page.dart';
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

String? _redirectForSession(SessionState session, String location) {
  final isAuthenticated = session.status == SessionStatus.authenticated;
  final isAuthRoute = AppRoutes.isAuthRoute(location);
  final isProtected = AppRoutes.isProtectedRoute(location);

  if (!isAuthenticated && isProtected) {
    return AppRoutes.login;
  }

  if (isAuthenticated && isAuthRoute) {
    return session.homeRoute;
  }

  return null;
}
