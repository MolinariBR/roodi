import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/api-client/api_error_parser.dart';
import '../../../Core/navigation/app_routes.dart';
import '../../commerce-home/domain/commerce_models.dart';
import '../../commerce-home/infra/commerce_repository.dart';

class CommerceTrackingPage extends ConsumerStatefulWidget {
  const CommerceTrackingPage({super.key, required this.orderId});

  final String orderId;

  @override
  ConsumerState<CommerceTrackingPage> createState() =>
      _CommerceTrackingPageState();
}

class _CommerceTrackingPageState extends ConsumerState<CommerceTrackingPage> {
  bool _isLoading = true;
  String? _errorMessage;

  CommerceOrderData? _order;
  List<CommerceTrackingEventData> _events = const <CommerceTrackingEventData>[];
  CommerceOrderPaymentStatusData? _paymentStatus;
  bool _isPaymentActionLoading = false;

  @override
  void initState() {
    super.initState();
    Future<void>.microtask(_loadData);
  }

  @override
  Widget build(BuildContext context) {
    final order = _order;
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
        title: const Text(
          'Tracking da Entrega',
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
              if (_isLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 32),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (_errorMessage != null)
                _buildErrorCard()
              else if (order != null) ...<Widget>[
                _buildStatusCard(order),
                const SizedBox(height: 14),
                _buildTimelineCard(),
                const SizedBox(height: 14),
                _buildSummaryCard(order, _paymentStatus),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusCard(CommerceOrderData order) {
    final statusColor = _statusColor(order.status);
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
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'Chamado #${order.id.substring(0, 8)}',
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _statusLabel(order.status),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  _statusPill(order.status),
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
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
                  color: const Color(0xFF67E8F9).withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: const Icon(
                  Icons.route_rounded,
                  color: Color(0xFF67E8F9),
                  size: 20,
                ),
              ),
              title: const Text(
                'Rota ativa',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
              subtitle: Text(
                order.destination?.asSingleLine() ?? 'Destino não informado',
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
                    order.etaMin != null ? '${order.etaMin} min' : '--',
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
                      color: const Color(0xFF67E8F9).withValues(alpha: 0.16),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Text(
                      'ETA',
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
          const SizedBox(height: 8),
          Row(
            children: <Widget>[
              Expanded(
                child: _miniMetric(
                  label: 'Distância',
                  value: order.distanceM == null
                      ? '--'
                      : _formatDistance(order.distanceM!),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _miniMetric(
                  label: 'Atualizado',
                  value: _latestEventTime(),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _miniMetric(
                  label: 'Taxa',
                  value: _formatCurrency(order.totalBrl),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _miniMetric({required String label, required String value}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        children: <Widget>[
          Text(
            value,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineCard() {
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
              const Text(
                'Linha da Entrega',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Spacer(),
              TextButton(
                onPressed: _loadData,
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
          if (_events.isEmpty)
            const Text(
              'Sem eventos de tracking até o momento.',
              style: TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            )
          else
            ..._events.map(
              (item) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Container(
                      width: 10,
                      height: 10,
                      margin: const EdgeInsets.only(top: 4),
                      decoration: BoxDecoration(
                        color: _eventColor(item.eventType),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            _formatTime(item.occurredAt),
                            style: const TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1.0,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _eventLabel(item.eventType),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          if (item.note != null && item.note!.isNotEmpty)
                            Text(
                              item.note!,
                              style: const TextStyle(
                                color: Color(0xFFCBD5E1),
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(
    CommerceOrderData order,
    CommerceOrderPaymentStatusData? paymentStatus,
  ) {
    final paymentLabel = _paymentStatusLabel(paymentStatus, order);
    final showPaymentActions = _shouldShowPaymentActions(order, paymentStatus);
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
          const Text(
            'Resumo do Chamado',
            style: TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          _row(
            label: 'Destino',
            value: order.destination?.asSingleLine() ?? 'Não informado',
          ),
          const SizedBox(height: 6),
          _row(
            label: 'Taxa de entrega',
            value: _formatCurrency(order.totalBrl),
          ),
          const SizedBox(height: 6),
          _row(label: 'Status', value: _statusLabel(order.status)),
          const SizedBox(height: 6),
          _row(label: 'Pagamento', value: paymentLabel),
          if (showPaymentActions) ...<Widget>[
            const SizedBox(height: 10),
            Row(
              children: <Widget>[
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isPaymentActionLoading
                        ? null
                        : () => _payNow(order.id),
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size.fromHeight(40),
                      backgroundColor: const Color(0xFF19B3E6),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: _isPaymentActionLoading
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                            ),
                          )
                        : const Text(
                            'Pagar agora',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton(
                    onPressed: _isPaymentActionLoading ? null : _loadData,
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
                    child: const Text(
                      'Atualizar pagamento',
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
          const SizedBox(height: 8),
          Row(
            children: <Widget>[
              Expanded(
                child: OutlinedButton(
                  onPressed: () => context.go(AppRoutes.support),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(42),
                    side: BorderSide(
                      color: Colors.white.withValues(alpha: 0.14),
                    ),
                    foregroundColor: const Color(0xFFCBD5E1),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text(
                    'Reportar problema',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  onPressed: _isFinalStatus(order.status)
                      ? null
                      : () => _cancelOrder(order.id),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(42),
                    side: BorderSide(
                      color: const Color(0x44F87171).withValues(alpha: 0.7),
                    ),
                    foregroundColor: const Color(0xFFFCA5A5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text(
                    'Cancelar chamado',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
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
            'Falha ao carregar tracking',
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

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final repository = ref.read(commerceRepositoryProvider);
      final results = await Future.wait<Object>(<Future<Object>>[
        repository.getOrderById(widget.orderId),
        repository.getOrderTracking(widget.orderId),
        repository.getOrderPaymentStatus(widget.orderId),
      ]);

      if (!mounted) {
        return;
      }
      setState(() {
        _order = results[0] as CommerceOrderData;
        _events = (results[1] as List<CommerceTrackingEventData>).reversed
            .toList(growable: false);
        _paymentStatus = results[2] as CommerceOrderPaymentStatusData;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _errorMessage = mapApiErrorMessage(
          error,
          fallbackMessage: 'Não foi possível carregar o tracking do chamado.',
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

    final confirmed = await showModalBottomSheet<bool>(
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
                decoration: _inputDecoration('Motivo'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: detailsController,
                maxLines: 2,
                style: const TextStyle(color: Colors.white),
                decoration: _inputDecoration('Detalhes (opcional)'),
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
                      child: const Text('Confirmar'),
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

    if (confirmed != true || reason.isEmpty) {
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

  InputDecoration _inputDecoration(String hint) {
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

  String _statusLabel(String status) {
    switch (status) {
      case 'created':
        return 'Aguardando pagamento';
      case 'searching_rider':
        return 'Aguardando aceite do rider';
      case 'rider_assigned':
      case 'to_merchant':
        return 'Rider a caminho do comércio';
      case 'at_merchant':
        return 'Rider no comércio';
      case 'waiting_order':
        return 'Aguardando pedido';
      case 'to_customer':
        return 'Em rota para entrega';
      case 'at_customer':
        return 'Chegada no destino';
      case 'finishing_delivery':
        return 'Finalizando entrega';
      case 'completed':
        return 'Entrega concluída';
      case 'canceled':
        return 'Chamado cancelado';
      default:
        return status;
    }
  }

  String _statusPill(String status) {
    if (status == 'created') {
      return 'Pagamento pendente';
    }
    if (_isFinalStatus(status)) {
      return _statusLabel(status);
    }
    return 'Ao vivo';
  }

  String _eventLabel(String eventType) {
    switch (eventType) {
      case 'order_created':
        return 'Chamado criado';
      case 'rider_assigned':
        return 'Rider designado';
      case 'rider_accepted':
        return 'Rider aceitou o chamado';
      case 'rider_to_merchant':
        return 'Rider a caminho do comércio';
      case 'rider_at_merchant':
        return 'Rider chegou no comércio';
      case 'waiting_order':
        return 'Rider aguardando pedido';
      case 'rider_to_customer':
        return 'Rider em rota para o cliente';
      case 'rider_at_customer':
        return 'Rider chegou no cliente';
      case 'finishing_delivery':
        return 'Finalizando entrega';
      case 'completed':
        return 'Entrega finalizada';
      case 'canceled':
        return 'Chamado cancelado';
      default:
        return eventType;
    }
  }

  Color _eventColor(String eventType) {
    if (eventType == 'completed') {
      return const Color(0xFF86EFAC);
    }
    if (eventType == 'canceled') {
      return const Color(0xFFF87171);
    }
    return const Color(0xFF67E8F9);
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'created':
        return const Color(0xFFFACC15);
      case 'completed':
        return const Color(0xFF86EFAC);
      case 'canceled':
        return const Color(0xFFF87171);
      default:
        return const Color(0xFF67E8F9);
    }
  }

  bool _isFinalStatus(String status) =>
      status == 'completed' || status == 'canceled';

  String _formatDistance(int distanceM) {
    return '${(distanceM / 1000).toStringAsFixed(1)} km';
  }

  String _formatCurrency(double value) {
    final normalized = value.toStringAsFixed(2).replaceAll('.', ',');
    return 'R\$ $normalized';
  }

  String _formatTime(DateTime value) {
    final hour = value.hour.toString().padLeft(2, '0');
    final minute = value.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  String _latestEventTime() {
    if (_events.isEmpty) {
      return '--';
    }
    return _formatTime(_events.first.occurredAt);
  }

  bool _shouldShowPaymentActions(
    CommerceOrderData order,
    CommerceOrderPaymentStatusData? paymentStatus,
  ) {
    if (_isFinalStatus(order.status)) {
      return false;
    }

    if (paymentStatus == null) {
      return order.paymentRequired ?? false;
    }

    return !paymentStatus.paid;
  }

  String _paymentStatusLabel(
    CommerceOrderPaymentStatusData? paymentStatus,
    CommerceOrderData order,
  ) {
    final status = paymentStatus?.paymentStatus ?? order.paymentStatus;
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'failed':
        return 'Falhou';
      case 'canceled':
        return 'Cancelado';
      case 'pending':
        return 'Pendente';
      default:
        return (order.paymentRequired ?? false) ? 'Pendente' : 'Não aplicável';
    }
  }

  Future<void> _payNow(String orderId) async {
    setState(() {
      _isPaymentActionLoading = true;
    });

    try {
      var payment = _paymentStatus?.payment;

      if (payment == null || payment.checkoutUrl.trim().isEmpty) {
        await ref
            .read(commerceRepositoryProvider)
            .createOrderPaymentIntent(orderId: orderId);
      }

      final status = await ref
          .read(commerceRepositoryProvider)
          .getOrderPaymentStatus(orderId);
      payment = status.payment;

      if (!mounted) {
        return;
      }

      setState(() {
        _paymentStatus = status;
      });

      final checkoutUrl = payment?.checkoutUrl;
      if (checkoutUrl == null || checkoutUrl.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Pagamento criado, mas sem URL de checkout no momento.',
            ),
          ),
        );
        return;
      }

      await Clipboard.setData(ClipboardData(text: checkoutUrl));
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Link de pagamento copiado. Abra no navegador para concluir.',
          ),
        ),
      );
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            mapApiErrorMessage(
              error,
              fallbackMessage: 'Não foi possível iniciar o pagamento.',
            ),
          ),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isPaymentActionLoading = false;
        });
      }
    }
  }
}
