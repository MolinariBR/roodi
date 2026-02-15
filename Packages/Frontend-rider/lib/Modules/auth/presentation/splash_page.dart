import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/design-system/tokens/color_tokens.dart';
import '../../../Core/navigation/app_routes.dart';
import '../../../Core/state/session_controller.dart';
import '../../../Core/state/session_state.dart';
import '../../session/infra/system_status_repository.dart';

class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage> {
  bool _navigationScheduled = false;

  @override
  Widget build(BuildContext context) {
    final sessionAsync = ref.watch(sessionControllerProvider);

    if (!_navigationScheduled &&
        (sessionAsync.hasValue || sessionAsync.hasError)) {
      _navigationScheduled = true;
      final session =
          sessionAsync.valueOrNull ??
          const SessionState.unauthenticated(onboardingCompleted: false);
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _scheduleNavigation(session);
      });
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  Container(
                    width: 96,
                    height: 96,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(26),
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: <Color>[Color(0x3319B3E6), Color(0x1A3B82F6)],
                      ),
                      border: Border.all(
                        color: ColorTokens.primary.withValues(alpha: 0.25),
                      ),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(
                      Icons.bolt_rounded,
                      color: ColorTokens.primary,
                      size: 42,
                    ),
                  ),
                  const SizedBox(height: 22),
                  const Text(
                    'ROODI',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 34,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'CONECTANDO COMERCIO E ENTREGADOR',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.4,
                    ),
                  ),
                  const SizedBox(height: 28),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: const LinearProgressIndicator(
                      minHeight: 7,
                      color: ColorTokens.primary,
                      backgroundColor: Color(0x1AFFFFFF),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    sessionAsync.isLoading
                        ? 'Carregando aplicacao...'
                        : 'Inicializando sessao...',
                    style: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 18),
                  const Text(
                    'v1.0.0',
                    style: TextStyle(
                      color: Color(0xFF475569),
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.2,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _scheduleNavigation(SessionState session) async {
    await Future<void>.delayed(const Duration(milliseconds: 1400));
    if (!mounted) {
      return;
    }

    final nextRoute = _resolveSessionRoute(session);
    final targetRoute = await _resolveSystemAwareRoute(nextRoute);

    if (!mounted) {
      return;
    }

    context.go(targetRoute);
  }

  String _resolveSessionRoute(SessionState session) {
    if (!session.onboardingCompleted) {
      return AppRoutes.onboarding1;
    }

    if (session.isAuthenticated) {
      return session.homeRoute;
    }

    return AppRoutes.login;
  }

  Future<String> _resolveSystemAwareRoute(String nextRoute) async {
    try {
      final snapshot = await ref
          .read(systemStatusRepositoryProvider)
          .fetchStatus();

      if (snapshot.shouldForceMaintenance) {
        return AppRoutes.maintenance;
      }

      if (snapshot.shouldRecommendUpdate) {
        return Uri(
          path: AppRoutes.update,
          queryParameters: <String, String>{'next': nextRoute},
        ).toString();
      }

      return nextRoute;
    } catch (_) {
      return AppRoutes.error;
    }
  }
}
