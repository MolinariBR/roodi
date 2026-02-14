import 'package:flutter/material.dart';

class SupportPage extends StatelessWidget {
  const SupportPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Central de Ajuda')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const <Widget>[
          Card(
            child: ListTile(
              title: Text('FAQ'),
              subtitle: Text('Duvias frequentes e orientacoes.'),
            ),
          ),
          Card(
            child: ListTile(
              title: Text('Abrir chamado'),
              subtitle: Text('Canal para incidentes operacionais.'),
            ),
          ),
        ],
      ),
    );
  }
}
