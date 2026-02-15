import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/api-client/api_error_parser.dart';
import '../../../Core/navigation/app_routes.dart';
import '../../rider-home-flow/domain/rider_models.dart';
import '../../rider-home-flow/infra/rider_repository.dart';

enum RiderHistoryFilter { today, sevenDays, completed, canceled }

class RiderOrdersPage extends ConsumerStatefulWidget {
  const RiderOrdersPage({super.key});

  @override
  ConsumerState<RiderOrdersPage> createState() => _RiderOrdersPageState();
}

class _RiderOrdersPageState extends ConsumerState<RiderOrdersPage> {
  RiderHistoryFilter _filter = RiderHistoryFilter.today;
  bool _isLoading = true;
  String? _errorMessage;

  RiderDashboardData? _dashboard;
  RiderOrderHistoryData? _historyData;

  @override
  void initState() {
    super.initState();
    Future<void>.microtask(_loadData);
  }

  @override
  Widget build(BuildContext context) {
    final orders = _filteredOrders();

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
              context.go(AppRoutes.riderHome);
              return;
            }
            if (value == 'orders') {
              return;
            }
            context.go(AppRoutes.riderProfile);
          },
          itemBuilder: (context) => const <PopupMenuEntry<String>>[
            PopupMenuItem<String>(value: 'home', child: Text('Início')),
            PopupMenuItem<String>(value: 'orders', child: Text('Pedidos')),
            PopupMenuItem<String>(value: 'profile', child: Text('Perfil')),
          ],
        ),
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              'Rider',
              style: TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
              ),
            ),
            Text(
              'Pedidos',
              style: TextStyle(
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
              _buildSummaryCard(),
              const SizedBox(height: 14),
              _buildHistoryHeader(),
              const SizedBox(height: 8),
              _buildFilterBar(),
              const SizedBox(height: 10),
              if (_isLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 32),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (_errorMessage != null)
                _buildErrorCard()
              else if (orders.isEmpty)
                _buildEmptyCard()
              else
                ...orders.map(_buildOrderCard),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryCard() {
    final earnings = _dashboard?.todayEarningsBrl ?? 0;
    final trips = _dashboard?.todayDeliveries ?? 0;
    final onlineMinutes = _dashboard?.todayOnlineMinutes ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Row(
          children: <Widget>[
            const Text(
              'Resumo do Dia',
              style: TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Spacer(),
            TextButton(
              onPressed: _isLoading ? null : _loadData,
              child: const Text(
                'Atualizar',
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
        Row(
          children: <Widget>[
            Expanded(
              child: _metricCard(
                icon: Icons.payments_outlined,
                iconColor: const Color(0xFF34D399),
                label: 'Ganho',
                value: _formatCurrency(earnings),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _metricCard(
                icon: Icons.delivery_dining_rounded,
                iconColor: const Color(0xFF60A5FA),
                label: 'Viagens',
                value: '$trips',
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _metricCard(
                icon: Icons.schedule_rounded,
                iconColor: const Color(0xFFF59E0B),
                label: 'Online',
                value: _formatHours(onlineMinutes),
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
              Text(
                label,
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

  Widget _buildHistoryHeader() {
    return Row(
      children: <Widget>[
        const Text(
          'Histórico de Corridas',
          style: TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
        const Spacer(),
        TextButton(
          onPressed: _openFiltersSheet,
          child: const Text(
            'Filtrar',
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

  Widget _buildFilterBar() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: RiderHistoryFilter.values
            .map(
              (value) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: _filterChip(value: value, label: _labelForFilter(value)),
              ),
            )
            .toList(growable: false),
      ),
    );
  }

  Widget _filterChip({
    required RiderHistoryFilter value,
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
              _loadData();
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

  Widget _buildOrderCard(RiderOrderData order) {
    final color = _statusColor(order.status);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: ListTile(
        onTap: () => _openOrderDetails(order.id),
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.18),
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Icon(Icons.storefront_rounded, color: color, size: 20),
        ),
        title: Text(
          _resolveOrderTitle(order),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
        subtitle: Text(
          _resolveOrderSubtitle(order),
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
            _statusBadge(order.status),
          ],
        ),
      ),
    );
  }

  Widget _statusBadge(String status) {
    final color = _statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        _statusLabel(status),
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w700,
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
            'Falha ao carregar pedidos',
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

  Widget _buildEmptyCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: const Text(
        'Nenhuma corrida encontrada para o filtro selecionado.',
        style: TextStyle(
          color: Color(0xFF94A3B8),
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Future<void> _openOrderDetails(String orderId) async {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0A0B0C),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) {
        return FutureBuilder<RiderOrderData>(
          future: ref.read(riderRepositoryProvider).getOrderById(orderId),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Padding(
                padding: EdgeInsets.all(24),
                child: Center(child: CircularProgressIndicator()),
              );
            }

            if (snapshot.hasError || !snapshot.hasData) {
              return const Padding(
                padding: EdgeInsets.all(20),
                child: Text(
                  'Nao foi possivel carregar detalhes da corrida.',
                  style: TextStyle(
                    color: Color(0xFFFCA5A5),
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              );
            }

            final order = snapshot.data!;
            return Padding(
              padding: EdgeInsets.fromLTRB(
                20,
                14,
                20,
                20 + MediaQuery.of(context).viewInsets.bottom,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Container(
                    width: 42,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 14),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                  const Text(
                    'Detalhes da corrida',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _detailLine('Pedido', order.id),
                  _detailLine('Status', _statusLabel(order.status)),
                  _detailLine('Valor', _formatCurrency(order.totalBrl)),
                  _detailLine(
                    'Distância',
                    order.distanceM == null
                        ? '-'
                        : '${(order.distanceM! / 1000).toStringAsFixed(1)} km',
                  ),
                  _detailLine(
                    'Duração',
                    order.durationS == null
                        ? '-'
                        : '${(order.durationS! / 60).ceil()} min',
                  ),
                  _detailLine(
                    'ETA',
                    order.etaMin == null ? '-' : '${order.etaMin} min',
                  ),
                  _detailLine(
                    'Destino',
                    order.destination?.asSingleLine() ?? 'Nao informado',
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: <Widget>[
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => context.go(AppRoutes.support),
                          child: const Text('Ajuda'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: const Text('Fechar'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _detailLine(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: 82,
            child: Text(
              label,
              style: const TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 11,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final repository = ref.read(riderRepositoryProvider);
      final statusFilter = _statusFilterFor(_filter);

      final results = await Future.wait<Object>(<Future<Object>>[
        repository.getDashboard(),
        repository.getOrdersHistory(status: statusFilter, limit: 30),
      ]);

      if (!mounted) {
        return;
      }

      setState(() {
        _dashboard = results[0] as RiderDashboardData;
        _historyData = results[1] as RiderOrderHistoryData;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _errorMessage = mapApiErrorMessage(
          error,
          fallbackMessage: 'Nao foi possivel carregar o historico de corridas.',
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

  List<RiderOrderData> _filteredOrders() {
    final items = _historyData?.items ?? const <RiderOrderData>[];
    final now = DateTime.now();

    switch (_filter) {
      case RiderHistoryFilter.today:
        final startOfDay = DateTime(now.year, now.month, now.day);
        return items
            .where((item) => item.createdAt.isAfter(startOfDay))
            .toList(growable: false);
      case RiderHistoryFilter.sevenDays:
        final sevenDaysAgo = now.subtract(const Duration(days: 7));
        return items
            .where((item) => item.createdAt.isAfter(sevenDaysAgo))
            .toList(growable: false);
      case RiderHistoryFilter.completed:
        return items
            .where((item) => item.status == 'completed')
            .toList(growable: false);
      case RiderHistoryFilter.canceled:
        return items
            .where((item) => item.status == 'canceled')
            .toList(growable: false);
    }
  }

  String? _statusFilterFor(RiderHistoryFilter filter) {
    switch (filter) {
      case RiderHistoryFilter.completed:
        return 'completed';
      case RiderHistoryFilter.canceled:
        return 'canceled';
      case RiderHistoryFilter.today:
      case RiderHistoryFilter.sevenDays:
        return null;
    }
  }

  void _openFiltersSheet() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: const Color(0xFF0A0B0C),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              const Text(
                'Filtrar histórico',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 12),
              ...RiderHistoryFilter.values.map((value) {
                final isSelected = _filter == value;
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  onTap: () {
                    if (_filter == value) {
                      Navigator.of(context).pop();
                      return;
                    }
                    setState(() {
                      _filter = value;
                    });
                    Navigator.of(context).pop();
                    _loadData();
                  },
                  title: Text(
                    _labelForFilter(value),
                    style: TextStyle(
                      color: isSelected
                          ? const Color(0xFF67E8F9)
                          : Colors.white,
                      fontWeight: isSelected
                          ? FontWeight.w700
                          : FontWeight.w500,
                    ),
                  ),
                  trailing: Icon(
                    isSelected
                        ? Icons.check_circle_rounded
                        : Icons.radio_button_unchecked_rounded,
                    color: isSelected
                        ? const Color(0xFF19B3E6)
                        : const Color(0xFF94A3B8),
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }

  String _labelForFilter(RiderHistoryFilter filter) {
    switch (filter) {
      case RiderHistoryFilter.today:
        return 'Hoje';
      case RiderHistoryFilter.sevenDays:
        return '7 dias';
      case RiderHistoryFilter.completed:
        return 'Concluídas';
      case RiderHistoryFilter.canceled:
        return 'Canceladas';
    }
  }

  String _resolveOrderTitle(RiderOrderData order) {
    final neighborhood = order.destination?.neighborhood;
    final city = order.destination?.city;
    if (neighborhood != null && neighborhood.isNotEmpty) {
      return 'Entrega • $neighborhood';
    }
    if (city != null && city.isNotEmpty) {
      return 'Entrega • $city';
    }
    return 'Pedido ${order.id.substring(0, 8)}';
  }

  String _resolveOrderSubtitle(RiderOrderData order) {
    final distance = order.distanceM == null
        ? '-'
        : '${(order.distanceM! / 1000).toStringAsFixed(1)} km';
    final minutes = order.durationS == null
        ? '-'
        : '${(order.durationS! / 60).ceil()} min';
    final hourText =
        '${order.createdAt.hour.toString().padLeft(2, '0')}:${order.createdAt.minute.toString().padLeft(2, '0')}';

    return 'Distância $distance • $minutes • $hourText';
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'canceled':
        return 'Cancelada';
      case 'to_merchant':
        return 'A caminho comércio';
      case 'at_merchant':
        return 'No comércio';
      case 'waiting_order':
        return 'Aguardando pedido';
      case 'to_customer':
        return 'A caminho cliente';
      case 'at_customer':
        return 'No cliente';
      case 'finishing_delivery':
        return 'Finalizando';
      default:
        return status;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'completed':
        return const Color(0xFF34D399);
      case 'canceled':
        return const Color(0xFFF87171);
      case 'finishing_delivery':
        return const Color(0xFF67E8F9);
      default:
        return const Color(0xFF94A3B8);
    }
  }

  String _formatCurrency(double value) {
    final normalized = value.toStringAsFixed(2).replaceAll('.', ',');
    return 'R\$ $normalized';
  }

  String _formatHours(int minutes) {
    final hours = minutes / 60;
    return '${hours.toStringAsFixed(1)}h';
  }
}
