import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/navigation/app_routes.dart';
import '../../../Core/state/session_controller.dart';

class CommerceHomePage extends ConsumerWidget {
  const CommerceHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Commerce Home'),
        actions: <Widget>[
          IconButton(
            onPressed: () => context.go(AppRoutes.notifications),
            icon: const Icon(Icons.notifications_outlined),
          ),
          IconButton(
            onPressed: () => context.go(AppRoutes.support),
            icon: const Icon(Icons.help_outline),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          const Card(
            child: ListTile(
              title: Text('Operacao de chamados'),
              subtitle: Text(
                'Abertura, acompanhamento e historico de entregas.',
              ),
              trailing: Icon(Icons.store_mall_directory_outlined),
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: () async {
              await ref.read(sessionControllerProvider.notifier).logout();
              if (!context.mounted) {
                return;
              }
              context.go(AppRoutes.login);
            },
            child: const Text('Sair'),
          ),
        ],
      ),
    );
  }
}
