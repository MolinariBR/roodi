import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/navigation/app_routes.dart';
import 'widgets/status_screen.dart';

class MaintenancePage extends StatelessWidget {
  const MaintenancePage({super.key});

  @override
  Widget build(BuildContext context) {
    return StatusScreen(
      icon: Icons.construction_rounded,
      iconBackground: const Color(0x22F59E0B),
      iconColor: const Color(0xFFFCD34D),
      title: 'Estamos em manutencao',
      description:
          'Estamos aplicando melhorias para voce voltar a usar o Roodi com mais estabilidade e desempenho.',
      panelTitle: 'Status',
      panelValue: 'Servicos em atualizacao',
      panelChipLabel: 'Em andamento',
      panelChipColor: const Color(0xFFFCD34D),
      panelChipBackground: const Color(0x22F59E0B),
      panelHighlights: const <String>[
        'Ajustes nos servicos de pedidos.',
        'Otimizacoes de notificacoes e rastreamento.',
        'Previsao de retorno: 20 minutos.',
      ],
      panelFootnote: 'Obrigado pela paciencia',
      primaryLabel: 'Atualizar status',
      primaryIcon: Icons.refresh_rounded,
      onPrimaryPressed: () => context.go(AppRoutes.splash),
      secondaryLabel: 'Reabrir',
      onSecondaryPressed: () => context.go(AppRoutes.login),
      footerText: 'Roodi maintenance center',
    );
  }
}
