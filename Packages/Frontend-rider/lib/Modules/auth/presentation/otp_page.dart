import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/navigation/app_routes.dart';

class OtpPage extends StatelessWidget {
  const OtpPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Validar OTP')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          const TextField(decoration: InputDecoration(labelText: 'Codigo OTP')),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () => context.go(AppRoutes.resetPassword),
            child: const Text('Validar codigo'),
          ),
        ],
      ),
    );
  }
}
