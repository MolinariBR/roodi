import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/navigation/app_routes.dart';
import '../../../Core/state/session_controller.dart';
import '../../../Core/state/session_state.dart';

class LoginPage extends ConsumerWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(sessionControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Entrar')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          Text(
            'Escolha o contexto para iniciar a sessao.',
            style: Theme.of(context).textTheme.bodyLarge,
          ),
          const SizedBox(height: 16),
          const TextField(decoration: InputDecoration(labelText: 'Email')),
          const SizedBox(height: 12),
          const TextField(
            obscureText: true,
            decoration: InputDecoration(labelText: 'Senha'),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () {
              ref.read(sessionControllerProvider.notifier).loginAsRider();
              context.go(AppRoutes.riderHome);
            },
            icon: const Icon(Icons.pedal_bike_rounded),
            label: const Text('Entrar como Rider'),
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: () {
              ref.read(sessionControllerProvider.notifier).loginAsCommerce();
              context.go(AppRoutes.commerceHome);
            },
            icon: const Icon(Icons.storefront_rounded),
            label: const Text('Entrar como Comercio'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: () => context.go(AppRoutes.register),
            child: const Text('Criar conta'),
          ),
          TextButton(
            onPressed: () => context.go(AppRoutes.forgotPassword),
            child: const Text('Esqueci minha senha'),
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Text(
                'Sessao atual: ${session.status == SessionStatus.authenticated ? session.context?.name : 'nao autenticado'}',
              ),
            ),
          ),
        ],
      ),
    );
  }
}
