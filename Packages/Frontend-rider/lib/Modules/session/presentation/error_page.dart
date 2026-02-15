import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/navigation/app_routes.dart';
import 'widgets/status_screen.dart';

class ErrorPage extends StatelessWidget {
  const ErrorPage({super.key});

  @override
  Widget build(BuildContext context) {
    return StatusScreen(
      icon: Icons.error_outline_rounded,
      iconBackground: const Color(0x22EF4444),
      iconColor: const Color(0xFFFCA5A5),
      title: 'Nao foi possivel continuar',
      description:
          'Encontramos um problema ao carregar esta tela. Verifique sua conexao e tente novamente.',
      panelTitle: 'Codigo do erro',
      panelValue: 'ERR-503-SERVICE',
      panelChipLabel: 'Temporario',
      panelChipColor: const Color(0xFFFCD34D),
      panelChipBackground: const Color(0x22F59E0B),
      primaryLabel: 'Tentar novamente',
      primaryIcon: Icons.refresh_rounded,
      onPrimaryPressed: () => context.go(AppRoutes.splash),
      secondaryLabel: 'Suporte',
      onSecondaryPressed: () => context.go(AppRoutes.support),
      footerText: 'Roodi status',
    );
  }
}
