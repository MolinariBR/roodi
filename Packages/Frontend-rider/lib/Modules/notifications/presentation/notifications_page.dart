import 'package:flutter/material.dart';

class NotificationsPage extends StatelessWidget {
  const NotificationsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notificacoes')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const <Widget>[
          Card(
            child: ListTile(
              title: Text('Pedido aceito'),
              subtitle: Text('Rider a caminho do comercio.'),
            ),
          ),
          Card(
            child: ListTile(
              title: Text('Pedido coletado'),
              subtitle: Text('Rider a caminho do cliente.'),
            ),
          ),
        ],
      ),
    );
  }
}
