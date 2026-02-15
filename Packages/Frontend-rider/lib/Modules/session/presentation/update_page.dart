import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/navigation/app_routes.dart';
import 'widgets/status_screen.dart';

class UpdatePage extends StatelessWidget {
  const UpdatePage({super.key, this.nextRoute});

  final String? nextRoute;

  @override
  Widget build(BuildContext context) {
    return StatusScreen(
      icon: Icons.system_update_rounded,
      iconBackground: const Color(0x2219B3E6),
      iconColor: const Color(0xFF7DD3FC),
      title: 'Nova atualizacao disponivel',
      description:
          'Uma nova versao do app Roodi foi publicada para melhorar estabilidade e desempenho.',
      panelTitle: 'Versao',
      panelValue: 'v1.3.0',
      panelChipLabel: 'Disponivel',
      panelChipColor: const Color(0xFF7DD3FC),
      panelChipBackground: const Color(0x2219B3E6),
      panelHighlights: const <String>[
        'Melhorias no rastreamento operacional.',
        'Correcao em notificacoes de pedidos.',
        'Otimizacao geral de performance.',
      ],
      panelHighlightDotColor: const Color(0xFF22C55E),
      panelFootnote: 'Tamanho aproximado: 18 MB',
      primaryLabel: 'Atualizar agora',
      primaryIcon: Icons.download_rounded,
      onPrimaryPressed: () => context.go(AppRoutes.splash),
      secondaryLabel: 'Depois',
      onSecondaryPressed: () => context.go(nextRoute ?? AppRoutes.login),
      footerText: 'Roodi update center',
    );
  }
}
