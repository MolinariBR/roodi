import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/navigation/app_routes.dart';
import '../../../Core/state/session_controller.dart';

enum OnboardingStep { step1, step2, step3 }

class OnboardingPage extends ConsumerWidget {
  const OnboardingPage({required this.step, super.key});

  final OnboardingStep step;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = _OnboardingConfig.fromStep(step);

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    config.stepLabel,
                    style: const TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Container(
                    height: 180,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.04),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.12),
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        _OnboardingIconTile(
                          icon: config.primaryIcon,
                          color: config.primaryIconColor,
                          iconColor: config.primaryIconGlyphColor,
                        ),
                        if (config.secondaryIcon != null) ...<Widget>[
                          const SizedBox(width: 14),
                          _OnboardingIconTile(
                            icon: config.secondaryIcon!,
                            color: config.secondaryIconColor!,
                            iconColor: config.secondaryIconGlyphColor!,
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    config.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    config.description,
                    style: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 14,
                      height: 1.45,
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: <Widget>[
                      _ProgressDot(isActive: step == OnboardingStep.step1),
                      const SizedBox(width: 7),
                      _ProgressDot(isActive: step == OnboardingStep.step2),
                      const SizedBox(width: 7),
                      _ProgressDot(isActive: step == OnboardingStep.step3),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: <Widget>[
                      Expanded(
                        flex: 3,
                        child: OutlinedButton(
                          onPressed: () async {
                            if (config.backRoute != null) {
                              context.go(config.backRoute!);
                              return;
                            }

                            await ref
                                .read(sessionControllerProvider.notifier)
                                .completeOnboarding();
                            if (!context.mounted) {
                              return;
                            }
                            context.go(AppRoutes.login);
                          },
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size.fromHeight(48),
                            side: BorderSide(
                              color: Colors.white.withValues(alpha: 0.14),
                            ),
                            foregroundColor: const Color(0xFFE2E8F0),
                            backgroundColor: Colors.white.withValues(
                              alpha: 0.04,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: Text(
                            config.backLabel,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 7,
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            final nextRoute = config.nextRoute;
                            if (nextRoute == null) {
                              await ref
                                  .read(sessionControllerProvider.notifier)
                                  .completeOnboarding();
                              if (!context.mounted) {
                                return;
                              }
                              context.go(AppRoutes.login);
                              return;
                            }

                            if (!context.mounted) {
                              return;
                            }
                            context.go(nextRoute);
                          },
                          style: ElevatedButton.styleFrom(
                            minimumSize: const Size.fromHeight(48),
                            elevation: 0,
                            backgroundColor: Colors.white,
                            foregroundColor: Colors.black,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          icon: Icon(config.nextIcon, size: 18),
                          label: Text(
                            config.nextLabel,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _OnboardingConfig {
  const _OnboardingConfig({
    required this.stepLabel,
    required this.title,
    required this.description,
    required this.primaryIcon,
    required this.primaryIconColor,
    required this.primaryIconGlyphColor,
    required this.backLabel,
    required this.backRoute,
    required this.nextLabel,
    required this.nextIcon,
    required this.nextRoute,
    this.secondaryIcon,
    this.secondaryIconColor,
    this.secondaryIconGlyphColor,
  });

  final String stepLabel;
  final String title;
  final String description;
  final IconData primaryIcon;
  final Color primaryIconColor;
  final Color primaryIconGlyphColor;
  final IconData? secondaryIcon;
  final Color? secondaryIconColor;
  final Color? secondaryIconGlyphColor;
  final String backLabel;
  final String? backRoute;
  final String nextLabel;
  final IconData nextIcon;
  final String? nextRoute;

  factory _OnboardingConfig.fromStep(OnboardingStep step) {
    switch (step) {
      case OnboardingStep.step1:
        return const _OnboardingConfig(
          stepLabel: '01 DE 03',
          title: 'Bem-vindo ao Roodi',
          description:
              'Conectamos comercios e entregadores em um unico app, com fluxo rapido para pedidos e entregas.',
          primaryIcon: Icons.delivery_dining_rounded,
          primaryIconColor: Color(0x2419B3E6),
          primaryIconGlyphColor: Color(0xFF67D2F4),
          secondaryIcon: Icons.storefront_rounded,
          secondaryIconColor: Color(0x2210B981),
          secondaryIconGlyphColor: Color(0xFF6EE7B7),
          backLabel: 'Pular',
          backRoute: null,
          nextLabel: 'Proximo',
          nextIcon: Icons.arrow_forward_rounded,
          nextRoute: AppRoutes.onboarding2,
        );
      case OnboardingStep.step2:
        return const _OnboardingConfig(
          stepLabel: '02 DE 03',
          title: 'Acompanhe em tempo real',
          description:
              'Visualize status dos pedidos, estimativa de chegada e tudo que acontece na rota de entrega.',
          primaryIcon: Icons.route_rounded,
          primaryIconColor: Color(0x2419B3E6),
          primaryIconGlyphColor: Color(0xFF67D2F4),
          backLabel: 'Pular',
          backRoute: null,
          nextLabel: 'Proximo',
          nextIcon: Icons.arrow_forward_rounded,
          nextRoute: AppRoutes.onboarding3,
        );
      case OnboardingStep.step3:
        return const _OnboardingConfig(
          stepLabel: '03 DE 03',
          title: 'Tudo pronto para comecar',
          description:
              'Ative seu perfil e comece a operar no Roodi. Voce pode ajustar preferencias e notificacoes depois.',
          primaryIcon: Icons.check_circle_rounded,
          primaryIconColor: Color(0x2210B981),
          primaryIconGlyphColor: Color(0xFF6EE7B7),
          backLabel: 'Voltar',
          backRoute: AppRoutes.onboarding2,
          nextLabel: 'Entrar no app',
          nextIcon: Icons.login_rounded,
          nextRoute: null,
        );
    }
  }
}

class _OnboardingIconTile extends StatelessWidget {
  const _OnboardingIconTile({
    required this.icon,
    required this.color,
    required this.iconColor,
  });

  final IconData icon;
  final Color color;
  final Color iconColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      width: 52,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
      ),
      alignment: Alignment.center,
      child: Icon(icon, color: iconColor, size: 26),
    );
  }
}

class _ProgressDot extends StatelessWidget {
  const _ProgressDot({required this.isActive});

  final bool isActive;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      curve: Curves.easeOut,
      height: 7,
      width: isActive ? 22 : 7,
      decoration: BoxDecoration(
        color: isActive ? Colors.white : Colors.white.withValues(alpha: 0.25),
        borderRadius: BorderRadius.circular(999),
      ),
    );
  }
}
