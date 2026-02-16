import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/api-client/api_error_parser.dart';
import '../../../Core/navigation/app_routes.dart';
import '../../commerce-home/domain/commerce_models.dart';
import '../../commerce-home/infra/commerce_repository.dart';

enum _CommerceHistoryFilter { today, sevenDays, completed, inRoute, canceled }

class CommerceHistoryPage extends ConsumerStatefulWidget {
  const CommerceHistoryPage({super.key});

  @override
  ConsumerState<CommerceHistoryPage> createState() =>
      _CommerceHistoryPageState();
}

class _CommerceHistoryPageState extends ConsumerState<CommerceHistoryPage> {
  _CommerceHistoryFilter _filter = _CommerceHistoryFilter.today;
  bool _isLoading = true;
  String? _errorMessage;

  List<CommerceOrderData> _orders = const <CommerceOrderData>[];

  @override
  void initState() {
    super.initState();
    Future<void>.microtask(_loadData);
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filteredOrders();
    final todayOrders = _orders
        .where((item) => _isToday(item.createdAt))
        .toList();
    final completedToday = todayOrders
        .where((item) => item.status == 'completed')
        .length;
    final canceledToday = todayOrders
        .where((item) => item.status == 'canceled')
        .length;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: PopupMenuButton<String>(
          icon: const Icon(Icons.menu_rounded),
          color: const Color(0xFF111214),
          onSelected: (value) {
            if (value == 'home') {
              context.go(AppRoutes.commerceHome);
              return;
            }
            if (value == 'orders') {
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
        title: const Text(
          'Histórico de Chamados',
          style: TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
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
              _buildSummaryCard(
                todayCount: todayOrders.length,
                completedCount: completedToday,
                canceledCount: canceledToday,
              ),
              const SizedBox(height: 14),
              _buildFilterCard(),
              const SizedBox(height: 14),
              _buildHeaderActions(),
              const SizedBox(height: 8),
              if (_isLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (_errorMessage != null)
                _buildErrorCard()
              else if (filtered.isEmpty)
                _emptyCard('Nenhum chamado encontrado para este filtro.')
              else
                ...filtered.map(_historyCard),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryCard({
    required int todayCount,
    required int completedCount,
    required int canceledCount,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        const Text(
          'Resumo Diário',
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
                icon: Icons.today_rounded,
                iconColor: const Color(0xFF67E8F9),
                label: 'Hoje',
                value: '$todayCount',
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _metricCard(
                icon: Icons.check_circle_outline_rounded,
                iconColor: const Color(0xFF86EFAC),
                label: 'Concluídos',
                value: '$completedCount',
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _metricCard(
                icon: Icons.cancel_outlined,
                iconColor: const Color(0xFFF87171),
                label: 'Cancelados',
                value: '$canceledCount',
              ),
            ),
          ],
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
          Wrap(
            alignment: WrapAlignment.center,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 6,
            runSpacing: 4,
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
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFFCBD5E1),
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
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
              fontSize: 17,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              const Text(
                'Filtros',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Spacer(),
              TextButton(
                onPressed: () {
                  setState(() {
                    _filter = _CommerceHistoryFilter.today;
                  });
                },
                child: const Text(
                  'Limpar',
                  style: TextStyle(
                    color: Color(0xFF67E8F9),
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _CommerceHistoryFilter.values
                .map(
                  (value) =>
                      _filterChip(value: value, label: _labelForFilter(value)),
                )
                .toList(growable: false),
          ),
        ],
      ),
    );
  }

  Widget _filterChip({
    required _CommerceHistoryFilter value,
    required String label,
  }) {
    final active = _filter == value;
    return OutlinedButton(
      onPressed: _isLoading
          ? null
          : () {
              if (_filter == value) {
                return;
              }
              setState(() {
                _filter = value;
              });
            },
      style: OutlinedButton.styleFrom(
        side: BorderSide(
          color: active
              ? const Color(0xFF19B3E6)
              : Colors.white.withValues(alpha: 0.16),
        ),
        backgroundColor: active
            ? const Color(0x3319B3E6)
            : Colors.white.withValues(alpha: 0.03),
        foregroundColor: active ? const Color(0xFF67E8F9) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      ),
      child: Text(
        label,
        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
      ),
    );
  }

  Widget _buildHeaderActions() {
    return Row(
      children: <Widget>[
        const Text(
          'Chamados',
          style: TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
        const Spacer(),
        TextButton(
          onPressed: () => context.go(AppRoutes.commerceCreateCall),
          child: const Text(
            'Novo',
            style: TextStyle(
              color: Color(0xFF67E8F9),
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }

  Widget _historyCard(CommerceOrderData order) {
    final statusColor = _statusColor(order.status);
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Expanded(
                child: Text(
                  'Chamado #${order.id.substring(0, 8)}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  _statusLabel(order.status),
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          _row(
            label: 'Destino',
            value: order.destination?.asSingleLine() ?? 'Não informado',
          ),
          const SizedBox(height: 4),
          _row(label: 'Taxa', value: _formatCurrency(order.totalBrl)),
          const SizedBox(height: 4),
          _row(label: 'Horário', value: _formatTime(order.createdAt)),
          const SizedBox(height: 10),
          Row(
            children: <Widget>[
              if (!_isFinalStatus(order.status))
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => context.go(
                      AppRoutes.commerceTrackingByOrderId(order.id),
                    ),
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size.fromHeight(40),
                      elevation: 0,
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    icon: const Icon(Icons.map_rounded, size: 16),
                    label: const Text(
                      'Acompanhar tracking',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                )
              else
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _showOrderDetails(order),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size.fromHeight(40),
                      side: BorderSide(
                        color: Colors.white.withValues(alpha: 0.14),
                      ),
                      foregroundColor: const Color(0xFFCBD5E1),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    icon: const Icon(Icons.visibility_rounded, size: 16),
                    label: const Text(
                      'Ver detalhes',
                      style: TextStyle(
                        fontSize: 12,
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

  Widget _row({required String label, required String value}) {
    return Row(
      children: <Widget>[
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF94A3B8),
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
            'Falha ao carregar histórico',
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

  Future<void> _showOrderDetails(CommerceOrderData order) async {
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: const Color(0xFF0A0B0C),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Container(
                width: 42,
                height: 4,
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
              Text(
                'Chamado #${order.id.substring(0, 8)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 10),
              _row(label: 'Status', value: _statusLabel(order.status)),
              const SizedBox(height: 6),
              _row(
                label: 'Destino',
                value: order.destination?.asSingleLine() ?? 'Não informado',
              ),
              const SizedBox(height: 6),
              _row(label: 'Taxa', value: _formatCurrency(order.totalBrl)),
              const SizedBox(height: 6),
              _row(label: 'Criado em', value: _formatDateTime(order.createdAt)),
            ],
          ),
        );
      },
    );
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final status = _statusFromFilter(_filter);
      final response = await ref
          .read(commerceRepositoryProvider)
          .getOrders(limit: 100, status: status);

      if (!mounted) {
        return;
      }
      setState(() {
        _orders = response.items;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _errorMessage = mapApiErrorMessage(
          error,
          fallbackMessage: 'Não foi possível carregar o histórico.',
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

  List<CommerceOrderData> _filteredOrders() {
    switch (_filter) {
      case _CommerceHistoryFilter.today:
        return _orders.where((item) => _isToday(item.createdAt)).toList();
      case _CommerceHistoryFilter.sevenDays:
        final threshold = DateTime.now().subtract(const Duration(days: 7));
        return _orders
            .where((item) => item.createdAt.isAfter(threshold))
            .toList();
      case _CommerceHistoryFilter.completed:
        return _orders.where((item) => item.status == 'completed').toList();
      case _CommerceHistoryFilter.inRoute:
        return _orders.where((item) => _isInRoute(item.status)).toList();
      case _CommerceHistoryFilter.canceled:
        return _orders.where((item) => item.status == 'canceled').toList();
    }
  }

  String? _statusFromFilter(_CommerceHistoryFilter filter) {
    switch (filter) {
      case _CommerceHistoryFilter.completed:
        return 'completed';
      case _CommerceHistoryFilter.canceled:
        return 'canceled';
      case _CommerceHistoryFilter.today:
      case _CommerceHistoryFilter.sevenDays:
      case _CommerceHistoryFilter.inRoute:
        return null;
    }
  }

  String _labelForFilter(_CommerceHistoryFilter filter) {
    switch (filter) {
      case _CommerceHistoryFilter.today:
        return 'Hoje';
      case _CommerceHistoryFilter.sevenDays:
        return '7 dias';
      case _CommerceHistoryFilter.completed:
        return 'Concluídos';
      case _CommerceHistoryFilter.inRoute:
        return 'Em rota';
      case _CommerceHistoryFilter.canceled:
        return 'Cancelados';
    }
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
        return 'Em rota';
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

  bool _isInRoute(String status) {
    return <String>{
      'searching_rider',
      'rider_assigned',
      'to_merchant',
      'at_merchant',
      'waiting_order',
      'to_customer',
      'at_customer',
      'finishing_delivery',
    }.contains(status);
  }

  bool _isFinalStatus(String status) =>
      status == 'completed' || status == 'canceled';

  bool _isToday(DateTime date) {
    final now = DateTime.now();
    return now.year == date.year &&
        now.month == date.month &&
        now.day == date.day;
  }

  String _formatDateTime(DateTime value) {
    final day = value.day.toString().padLeft(2, '0');
    final month = value.month.toString().padLeft(2, '0');
    final hour = value.hour.toString().padLeft(2, '0');
    final minute = value.minute.toString().padLeft(2, '0');
    return '$day/$month $hour:$minute';
  }

  String _formatTime(DateTime value) {
    final hour = value.hour.toString().padLeft(2, '0');
    final minute = value.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  String _formatCurrency(double value) {
    final normalized = value.toStringAsFixed(2).replaceAll('.', ',');
    return 'R\$ $normalized';
  }
}
