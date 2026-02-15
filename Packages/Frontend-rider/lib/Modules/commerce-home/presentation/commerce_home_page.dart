import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/api-client/api_error_parser.dart';
import '../../../Core/navigation/app_routes.dart';
import '../domain/commerce_models.dart';
import '../infra/commerce_repository.dart';

class CommerceHomePage extends ConsumerStatefulWidget {
  const CommerceHomePage({super.key});

  @override
  ConsumerState<CommerceHomePage> createState() => _CommerceHomePageState();
}

class _CommerceHomePageState extends ConsumerState<CommerceHomePage> {
  bool _isLoading = true;
  String? _errorMessage;

  CommerceProfileData? _profile;
  CommerceCreditsBalanceData? _balance;
  List<CommerceOrderData> _orders = const <CommerceOrderData>[];

  @override
  void initState() {
    super.initState();
    Future<void>.microtask(_loadData);
  }

  @override
  Widget build(BuildContext context) {
    final profileName = _profile?.name ?? 'Painel da Empresa';
    final activeOrder = _orders.firstWhere(
      (item) => !_isFinalStatus(item.status),
      orElse: () => _orders.isNotEmpty ? _orders.first : _emptyOrder(),
    );
    final hasActiveOrder =
        _orders.isNotEmpty && !_isFinalStatus(activeOrder.status);

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
        leading: PopupMenuButton<String>(
          icon: const Icon(Icons.menu_rounded),
          color: const Color(0xFF111214),
          onSelected: (value) {
            if (value == 'home') {
              return;
            }
            if (value == 'orders') {
              context.go(AppRoutes.commerceHistory);
              return;
            }
            context.go(AppRoutes.commerceProfile);
          },
          itemBuilder: (context) => const <PopupMenuEntry<String>>[
            PopupMenuItem<String>(value: 'home', child: Text('Início')),
            PopupMenuItem<String>(value: 'orders', child: Text('Pedidos')),
            PopupMenuItem<String>(value: 'profile', child: Text('Perfil')),
          ],
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const Text(
              'Comerciante',
              style: TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
              ),
            ),
            Text(
              profileName,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        actions: <Widget>[
          IconButton(
            onPressed: () => context.go(AppRoutes.notifications),
            icon: const Icon(Icons.notifications_rounded),
          ),
        ],
      ),
      body: SafeArea(
        top: false,
        child: RefreshIndicator(
          onRefresh: _loadData,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 18),
            children: <Widget>[
              _buildMainCallCard(activeOrder, hasActiveOrder),
              const SizedBox(height: 14),
              if (_isLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (_errorMessage != null)
                _buildErrorCard()
              else ...<Widget>[
                _buildOrdersSection(),
                const SizedBox(height: 14),
                _buildTodaySection(),
                const SizedBox(height: 14),
                _buildShortcutsSection(),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMainCallCard(
    CommerceOrderData activeOrder,
    bool hasActiveOrder,
  ) {
    final statusLabel = hasActiveOrder
        ? _statusLabel(activeOrder.status)
        : 'Sem chamado ativo';
    final statusColor = hasActiveOrder
        ? const Color(0xFF86EFAC)
        : const Color(0xFFCBD5E1);
    final destination = hasActiveOrder
        ? activeOrder.destination?.asSingleLine() ?? 'Destino não informado'
        : 'Crie um novo chamado para iniciar despacho.';
    final recipient = hasActiveOrder
        ? 'Pedido ${activeOrder.id.substring(0, 8)}'
        : 'Sem destinatário';
    final fee = hasActiveOrder
        ? _formatCurrency(activeOrder.totalBrl)
        : _formatCurrency(0);
    final distance = hasActiveOrder && activeOrder.distanceM != null
        ? _formatDistance(activeOrder.distanceM!)
        : '--';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  statusLabel,
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
              const Spacer(),
              const Text(
                'Agora',
                style: TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.03),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
            ),
            child: ListTile(
              leading: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFF19B3E6).withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: const Icon(
                  Icons.two_wheeler_rounded,
                  color: Color(0xFF67E8F9),
                  size: 20,
                ),
              ),
              title: Text(
                hasActiveOrder ? 'Chamado em andamento' : 'Pronto para envio',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
              subtitle: Text(
                recipient,
                style: const TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  Text(
                    distance,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF19B3E6).withValues(alpha: 0.16),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Text(
                      'Distância',
                      style: TextStyle(
                        color: Color(0xFF67E8F9),
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          _detailRow(label: 'Destino', value: destination),
          const SizedBox(height: 6),
          _detailRow(label: 'Taxa de entrega', value: fee),
          const SizedBox(height: 10),
          Row(
            children: <Widget>[
              Expanded(
                flex: 3,
                child: OutlinedButton(
                  onPressed: hasActiveOrder
                      ? () => _cancelOrder(activeOrder.id)
                      : null,
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(46),
                    side: BorderSide(
                      color: Colors.white.withValues(alpha: 0.14),
                    ),
                    foregroundColor: const Color(0xFFCBD5E1),
                    backgroundColor: Colors.white.withValues(alpha: 0.03),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Cancelar',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                flex: 7,
                child: ElevatedButton.icon(
                  onPressed: hasActiveOrder
                      ? () => context.go(
                          AppRoutes.commerceTrackingByOrderId(activeOrder.id),
                        )
                      : () => context.go(AppRoutes.commerceCreateCall),
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size.fromHeight(46),
                    elevation: 0,
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  icon: const Icon(Icons.arrow_forward_rounded, size: 18),
                  label: Text(
                    hasActiveOrder ? 'Acompanhar Tracking' : 'Chamar Rider',
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
    );
  }

  Widget _detailRow({required String label, required String value}) {
    return Row(
      children: <Widget>[
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFFCBD5E1),
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        const Spacer(),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOrdersSection() {
    final items = _orders.take(3).toList(growable: false);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Row(
          children: <Widget>[
            const Text(
              'Chamados de Rider',
              style: TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Spacer(),
            TextButton(
              onPressed: () => context.go(AppRoutes.commerceHistory),
              child: const Text(
                'Ver todos',
                style: TextStyle(
                  color: Color(0xFF67E8F9),
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        if (items.isEmpty)
          _emptyCard('Nenhum chamado encontrado.')
        else
          ...items.map(_orderListCard),
      ],
    );
  }

  Widget _orderListCard(CommerceOrderData order) {
    final statusColor = _statusColor(order.status);
    final etaLabel = order.etaMin != null
        ? '${order.etaMin} min'
        : _statusLabel(order.status);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: ListTile(
        onTap: () => context.go(AppRoutes.commerceTrackingByOrderId(order.id)),
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: statusColor.withValues(alpha: 0.18),
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Icon(Icons.receipt_long_rounded, color: statusColor, size: 20),
        ),
        title: Text(
          'Chamado #${order.id.substring(0, 8)}',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
        subtitle: Text(
          _orderSubtitle(order),
          style: const TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: <Widget>[
            Text(
              _formatCurrency(order.totalBrl),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: statusColor.withValues(alpha: 0.16),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                etaLabel,
                style: TextStyle(
                  color: statusColor,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTodaySection() {
    final todayOrders = _orders
        .where((item) => _isToday(item.createdAt))
        .toList();
    final concludedCount = todayOrders
        .where((item) => item.status == 'completed')
        .length;
    final totalFee = todayOrders.fold<double>(
      0,
      (value, item) => value + item.totalBrl,
    );
    final avgEta = _averageEta(todayOrders);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        const Text(
          'Operação de Hoje',
          style: TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: <Widget>[
            Expanded(
              child: _metricCard(
                icon: Icons.payments_outlined,
                iconColor: const Color(0xFF34D399),
                label: 'Taxa entrega',
                value: _formatCurrency(totalFee),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _metricCard(
                icon: Icons.receipt_long_rounded,
                iconColor: const Color(0xFF60A5FA),
                label: 'Chamados',
                value: '${todayOrders.length}',
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _metricCard(
                icon: Icons.timer_outlined,
                iconColor: const Color(0xFFF59E0B),
                label: 'Despacho',
                value: avgEta > 0 ? '${avgEta}min' : '--',
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Concluídos hoje: $concludedCount',
          style: const TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _metricCard({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        children: <Widget>[
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(8),
                ),
                alignment: Alignment.center,
                child: Icon(icon, size: 14, color: iconColor),
              ),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  label,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Color(0xFFCBD5E1),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShortcutsSection() {
    final balanceLabel = _balance == null
        ? 'Saldo indisponível'
        : 'Saldo ${_formatCurrency(_balance!.balanceBrl)}';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        const Text(
          'Atalhos da Empresa',
          style: TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 8),
        _shortcutCard(
          icon: Icons.groups_rounded,
          iconColor: const Color(0xFF60A5FA),
          title: 'Clientes Salvos',
          subtitle: 'Contato e endereço já cadastrados',
          onTap: () => context.go(AppRoutes.commerceClients),
        ),
        _shortcutCard(
          icon: Icons.account_balance_wallet_outlined,
          iconColor: const Color(0xFF34D399),
          title: 'Comprar Créditos',
          subtitle: balanceLabel,
          onTap: () => context.go(AppRoutes.commerceCredits),
        ),
        _shortcutCard(
          icon: Icons.inventory_2_outlined,
          iconColor: const Color(0xFFF59E0B),
          title: 'Produtos',
          subtitle: 'Catálogo e disponibilidade',
          onTap: () => context.go(AppRoutes.commerceProducts),
        ),
      ],
    );
  }

  Widget _shortcutCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.18),
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Icon(icon, color: iconColor, size: 20),
        ),
        title: Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(999),
          ),
          child: const Text(
            'Abrir',
            style: TextStyle(
              color: Color(0xFFCBD5E1),
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildErrorCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0x22EF4444),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0x44EF4444)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Text(
            'Falha ao carregar painel da empresa',
            style: TextStyle(
              color: Color(0xFFFCA5A5),
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            _errorMessage!,
            style: const TextStyle(
              color: Color(0xFFFECACA),
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            onPressed: _loadData,
            icon: const Icon(Icons.refresh_rounded, size: 18),
            label: const Text('Tentar novamente'),
          ),
        ],
      ),
    );
  }

  Widget _emptyCard(String message) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Text(
        message,
        style: const TextStyle(
          color: Color(0xFF94A3B8),
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final repository = ref.read(commerceRepositoryProvider);
      final results = await Future.wait<Object>(<Future<Object>>[
        repository.getProfile(),
        repository.getCreditsBalance(),
        repository.getOrders(limit: 20),
      ]);

      if (!mounted) {
        return;
      }

      setState(() {
        _profile = results[0] as CommerceProfileData;
        _balance = results[1] as CommerceCreditsBalanceData;
        _orders = (results[2] as CommerceOrderListData).items;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _errorMessage = mapApiErrorMessage(
          error,
          fallbackMessage: 'Não foi possível carregar os dados do comércio.',
        );
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _cancelOrder(String orderId) async {
    final reasonController = TextEditingController();
    final detailsController = TextEditingController();

    final shouldCancel = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0A0B0C),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.fromLTRB(
            20,
            16,
            20,
            20 + MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              const Text(
                'Cancelar chamado',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: reasonController,
                style: const TextStyle(color: Colors.white),
                decoration: _sheetInputDecoration('Motivo'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: detailsController,
                maxLines: 2,
                style: const TextStyle(color: Colors.white),
                decoration: _sheetInputDecoration('Detalhes (opcional)'),
              ),
              const SizedBox(height: 12),
              Row(
                children: <Widget>[
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(false),
                      child: const Text('Voltar'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        if (reasonController.text.trim().isEmpty) {
                          return;
                        }
                        Navigator.of(context).pop(true);
                      },
                      child: const Text('Cancelar chamado'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );

    final reason = reasonController.text.trim();
    final details = detailsController.text.trim();
    reasonController.dispose();
    detailsController.dispose();

    if (shouldCancel != true || reason.isEmpty) {
      return;
    }

    try {
      await ref
          .read(commerceRepositoryProvider)
          .cancelOrder(
            orderId: orderId,
            reason: reason,
            details: details.isEmpty ? null : details,
          );
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Chamado cancelado com sucesso.')),
      );
      await _loadData();
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            mapApiErrorMessage(
              error,
              fallbackMessage: 'Não foi possível cancelar o chamado.',
            ),
          ),
        ),
      );
    }
  }

  InputDecoration _sheetInputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
      filled: true,
      fillColor: Colors.white.withValues(alpha: 0.04),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
      ),
      focusedBorder: const OutlineInputBorder(
        borderRadius: BorderRadius.all(Radius.circular(12)),
        borderSide: BorderSide(color: Color(0xFF19B3E6)),
      ),
    );
  }

  bool _isFinalStatus(String status) {
    return status == 'completed' || status == 'canceled';
  }

  bool _isToday(DateTime dateTime) {
    final now = DateTime.now();
    return dateTime.year == now.year &&
        dateTime.month == now.month &&
        dateTime.day == now.day;
  }

  int _averageEta(List<CommerceOrderData> orders) {
    final etas = orders
        .where((item) => item.etaMin != null)
        .map((item) => item.etaMin!)
        .toList(growable: false);
    if (etas.isEmpty) {
      return 0;
    }
    final sum = etas.fold<int>(0, (acc, value) => acc + value);
    return (sum / etas.length).round();
  }

  String _orderSubtitle(CommerceOrderData order) {
    if (order.status == 'completed') {
      return 'Entrega concluída';
    }
    if (order.status == 'canceled') {
      return 'Chamado cancelado';
    }
    final distance = order.distanceM != null
        ? _formatDistance(order.distanceM!)
        : '--';
    return '${_statusLabel(order.status)} • $distance';
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'searching_rider':
        return 'Aguardando aceite';
      case 'rider_assigned':
      case 'to_merchant':
        return 'Rider a caminho';
      case 'at_merchant':
        return 'Rider no comércio';
      case 'waiting_order':
        return 'Aguardando pedido';
      case 'to_customer':
        return 'Rota para cliente';
      case 'at_customer':
      case 'finishing_delivery':
        return 'Finalização';
      case 'completed':
        return 'Concluído';
      case 'canceled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'searching_rider':
      case 'rider_assigned':
        return const Color(0xFFFCD34D);
      case 'to_merchant':
      case 'at_merchant':
      case 'waiting_order':
      case 'to_customer':
      case 'at_customer':
      case 'finishing_delivery':
        return const Color(0xFF67E8F9);
      case 'completed':
        return const Color(0xFF86EFAC);
      case 'canceled':
        return const Color(0xFFF87171);
      default:
        return const Color(0xFFCBD5E1);
    }
  }

  String _formatCurrency(double value) {
    final normalized = value.toStringAsFixed(2).replaceAll('.', ',');
    return 'R\$ $normalized';
  }

  String _formatDistance(int distanceM) {
    return '${(distanceM / 1000).toStringAsFixed(1)} km';
  }

  CommerceOrderData _emptyOrder() {
    return CommerceOrderData(
      id: '00000000',
      status: 'idle',
      totalBrl: 0,
      createdAt: DateTime.now(),
    );
  }
}
