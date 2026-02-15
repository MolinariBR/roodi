import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/api-client/api_error_parser.dart';
import '../../../Core/navigation/app_routes.dart';
import '../../rider-home-flow/domain/rider_models.dart';
import '../../rider-home-flow/infra/rider_repository.dart';

enum _RiderHomeStage {
  offline,
  onlineIdle,
  requestIncoming,
  toMerchant,
  atMerchant,
  waitingOrder,
  toCustomer,
  atCustomer,
  finishingDelivery,
}

class RiderHomePage extends ConsumerStatefulWidget {
  const RiderHomePage({super.key});

  @override
  ConsumerState<RiderHomePage> createState() => _RiderHomePageState();
}

class _RiderHomePageState extends ConsumerState<RiderHomePage> {
  bool _isLoading = true;
  bool _isActionInProgress = false;
  String? _errorMessage;

  RiderDashboardData? _dashboard;
  RiderOfferData? _offer;
  RiderOrderData? _activeOrder;

  final TextEditingController _confirmationCodeController =
      TextEditingController();

  @override
  void initState() {
    super.initState();
    Future<void>.microtask(_loadData);
  }

  @override
  void dispose() {
    _confirmationCodeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final stage = _resolveStage();

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
              context.go(AppRoutes.riderOrders);
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
              'Início',
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
              _buildStateCard(stage),
              const SizedBox(height: 14),
              _buildRouteSection(),
              const SizedBox(height: 14),
              _buildDailySummarySection(),
            ],
          ),
        ),
      ),
    );
  }

  _RiderHomeStage _resolveStage() {
    final dashboard = _dashboard;
    if (dashboard == null) {
      return _RiderHomeStage.offline;
    }

    if (!dashboard.isOnline) {
      return _RiderHomeStage.offline;
    }

    if (_offer != null) {
      return _RiderHomeStage.requestIncoming;
    }

    final order = _activeOrder ?? dashboard.activeOrder;
    if (order == null) {
      return _RiderHomeStage.onlineIdle;
    }

    switch (order.status) {
      case 'rider_assigned':
      case 'to_merchant':
        return _RiderHomeStage.toMerchant;
      case 'at_merchant':
        return _RiderHomeStage.atMerchant;
      case 'waiting_order':
        return _RiderHomeStage.waitingOrder;
      case 'to_customer':
        return _RiderHomeStage.toCustomer;
      case 'at_customer':
        return _RiderHomeStage.atCustomer;
      case 'finishing_delivery':
        return _RiderHomeStage.finishingDelivery;
      default:
        return _RiderHomeStage.onlineIdle;
    }
  }

  Widget _buildStateCard(_RiderHomeStage stage) {
    final stageMeta = _stageMeta(stage);
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
                  color: stageMeta.badgeColor.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  stageMeta.badgeLabel,
                  style: TextStyle(
                    color: stageMeta.badgeColor,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                stageMeta.phaseLabel,
                style: const TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            stageMeta.title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            stageMeta.description,
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 12),
          if (_isLoading)
            const Center(child: CircularProgressIndicator())
          else if (_errorMessage != null)
            _buildErrorCard()
          else
            _buildStateBody(stage),
        ],
      ),
    );
  }

  Widget _buildErrorCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0x22EF4444),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0x44EF4444)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Padding(
            padding: EdgeInsets.only(top: 2),
            child: Icon(
              Icons.error_outline_rounded,
              color: Color(0xFFFCA5A5),
              size: 18,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              _errorMessage!,
              style: const TextStyle(
                color: Color(0xFFFECACA),
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStateBody(_RiderHomeStage stage) {
    switch (stage) {
      case _RiderHomeStage.offline:
        return _offlineStateBody();
      case _RiderHomeStage.onlineIdle:
        return _onlineIdleStateBody();
      case _RiderHomeStage.requestIncoming:
        return _requestIncomingBody();
      case _RiderHomeStage.toMerchant:
        return _toMerchantBody();
      case _RiderHomeStage.atMerchant:
        return _atMerchantBody();
      case _RiderHomeStage.waitingOrder:
        return _waitingOrderBody();
      case _RiderHomeStage.toCustomer:
        return _toCustomerBody();
      case _RiderHomeStage.atCustomer:
        return _atCustomerBody();
      case _RiderHomeStage.finishingDelivery:
        return _finishingDeliveryBody();
    }
  }

  Widget _offlineStateBody() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        _infoBlock(
          title: 'Sem entrega ativa',
          subtitle: 'Ative o modo online para entrar na fila de solicitações.',
        ),
        const SizedBox(height: 10),
        _actionButton(
          label: 'Ficar online',
          icon: Icons.toggle_on_rounded,
          onPressed: _isActionInProgress ? null : () => _setAvailability(true),
        ),
      ],
    );
  }

  Widget _onlineIdleStateBody() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        _infoBlock(
          title: 'Sem solicitação no momento',
          subtitle: 'A próxima chamada aparecerá neste card automaticamente.',
        ),
        const SizedBox(height: 10),
        _secondaryActionButton(
          label: 'Ficar offline',
          icon: Icons.toggle_off_rounded,
          onPressed: _isActionInProgress ? null : () => _setAvailability(false),
        ),
      ],
    );
  }

  Widget _requestIncomingBody() {
    final offer = _offer;
    if (offer == null) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        _threeColumnSummary(
          leftLabel: 'Coleta',
          middleLabel: 'Rota',
          rightLabel: 'Entrega',
          leftValue: offer.quote.pickupType,
          middleValue: _formatCurrency(offer.quote.estimatedValueBrl),
          rightValue: _formatDistance(offer.quote.totalDistanceM),
        ),
        const SizedBox(height: 8),
        _infoBlock(title: 'Roadmap', subtitle: offer.quote.routeSummary),
        const SizedBox(height: 10),
        Row(
          children: <Widget>[
            Expanded(
              child: _secondaryActionButton(
                label: 'Recusar',
                icon: Icons.close_rounded,
                onPressed: _isActionInProgress ? null : _rejectOffer,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _actionButton(
                label: 'Aceitar pedido',
                icon: Icons.check_rounded,
                onPressed: _isActionInProgress ? null : _acceptOffer,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _toMerchantBody() {
    final order = _activeOrder;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        _infoBlock(title: 'Coleta', subtitle: _resolvePickupLabel(order)),
        const SizedBox(height: 8),
        _infoBlock(
          title: 'Endereço do comércio',
          subtitle:
              'Aguardando integração do endereço detalhado do comércio no backend.',
        ),
        const SizedBox(height: 10),
        _actionButton(
          label: 'Cheguei no comércio',
          icon: Icons.storefront_rounded,
          onPressed: _isActionInProgress
              ? null
              : () => _appendOrderEvent(
                  eventType: 'rider_at_merchant',
                  successMessage: 'Chegada no comércio registrada.',
                ),
        ),
      ],
    );
  }

  Widget _atMerchantBody() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        _infoBlock(
          title: 'Chegada registrada',
          subtitle:
              'Pedido em coleta. Aguarde o preparo para seguir ao cliente.',
        ),
        const SizedBox(height: 10),
        _secondaryActionButton(
          label: 'Pedido em preparo',
          icon: Icons.hourglass_top_rounded,
          onPressed: _isActionInProgress
              ? null
              : () => _appendOrderEvent(
                  eventType: 'waiting_order',
                  successMessage: 'Pedido em preparo.',
                ),
        ),
      ],
    );
  }

  Widget _waitingOrderBody() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        _infoBlock(
          title: 'Aguardando pedido',
          subtitle:
              'Quando o pedido estiver pronto, siga para entrega ao cliente.',
        ),
        const SizedBox(height: 10),
        _actionButton(
          label: 'Pedido pronto',
          icon: Icons.inventory_2_outlined,
          onPressed: _isActionInProgress
              ? null
              : () => _appendOrderEvent(
                  eventType: 'rider_to_customer',
                  successMessage: 'Rota para o cliente iniciada.',
                ),
        ),
      ],
    );
  }

  Widget _toCustomerBody() {
    final address =
        _activeOrder?.destination?.asSingleLine() ??
        'Endereço do cliente não informado.';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        _infoBlock(title: 'Entrega', subtitle: address),
        const SizedBox(height: 8),
        _infoBlock(
          title: 'Navegação',
          subtitle: 'Use sua navegação preferida para seguir a rota.',
        ),
        const SizedBox(height: 10),
        _actionButton(
          label: 'Cheguei no cliente',
          icon: Icons.location_on_rounded,
          onPressed: _isActionInProgress
              ? null
              : () => _appendOrderEvent(
                  eventType: 'rider_at_customer',
                  successMessage: 'Chegada no cliente registrada.',
                ),
        ),
      ],
    );
  }

  Widget _atCustomerBody() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        _infoBlock(
          title: 'Confirmação pendente',
          subtitle:
              'Solicite o código de confirmação ao cliente para finalizar.',
        ),
        const SizedBox(height: 10),
        _actionButton(
          label: 'Iniciar finalização',
          icon: Icons.pin_rounded,
          onPressed: _isActionInProgress
              ? null
              : () => _appendOrderEvent(
                  eventType: 'finishing_delivery',
                  successMessage: 'Etapa de finalização iniciada.',
                ),
        ),
      ],
    );
  }

  Widget _finishingDeliveryBody() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        _infoBlock(
          title: 'Código de confirmação',
          subtitle:
              'Digite o código de 4 dígitos informado pelo cliente para concluir.',
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _confirmationCodeController,
          maxLength: 4,
          keyboardType: TextInputType.number,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w700,
            letterSpacing: 2,
          ),
          decoration: InputDecoration(
            counterText: '',
            hintText: '0000',
            hintStyle: const TextStyle(
              color: Color(0xFF94A3B8),
              letterSpacing: 2,
            ),
            filled: true,
            fillColor: Colors.white.withValues(alpha: 0.04),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: Colors.white.withValues(alpha: 0.1),
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: Colors.white.withValues(alpha: 0.1),
              ),
            ),
            focusedBorder: const OutlineInputBorder(
              borderRadius: BorderRadius.all(Radius.circular(12)),
              borderSide: BorderSide(color: Color(0xFF19B3E6)),
            ),
          ),
        ),
        const SizedBox(height: 10),
        _actionButton(
          label: 'Confirmar entrega',
          icon: Icons.task_alt_rounded,
          onPressed: _isActionInProgress ? null : _completeOrder,
        ),
      ],
    );
  }

  Widget _buildRouteSection() {
    final order = _activeOrder;
    final offer = _offer;

    String title = 'Sem rota ativa';
    String subtitle = 'Nenhum pedido em andamento.';
    String sideValue = '--';
    String sideMeta = 'ETA';
    IconData icon = Icons.route_rounded;
    Color iconColor = const Color(0xFF67E8F9);

    if (order != null) {
      title = _statusTitle(order.status);
      subtitle = _resolveRouteSubtitle(order);
      sideValue = order.etaMin != null ? '${order.etaMin} min' : '--';
      sideMeta = 'ETA';
      icon = Icons.delivery_dining_rounded;
      iconColor = const Color(0xFF60A5FA);
    } else if (offer != null) {
      title = 'Solicitação disponível';
      subtitle = offer.quote.routeSummary;
      sideValue = _formatDistance(offer.quote.totalDistanceM);
      sideMeta = 'Distância';
      icon = Icons.route_rounded;
      iconColor = const Color(0xFF67E8F9);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Row(
          children: <Widget>[
            const Text(
              'Rota Ativa',
              style: TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Spacer(),
            TextButton(
              onPressed: () => context.go(AppRoutes.riderOrders),
              child: const Text(
                'Ver histórico',
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
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: <Widget>[
                Text(
                  sideValue,
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
                    color: iconColor.withValues(alpha: 0.16),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    sideMeta,
                    style: TextStyle(
                      color: iconColor,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDailySummarySection() {
    final dashboard = _dashboard;
    final earnings = dashboard?.todayEarningsBrl ?? 0;
    final trips = dashboard?.todayDeliveries ?? 0;
    final onlineMinutes = dashboard?.todayOnlineMinutes ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Row(
          children: <Widget>[
            const Text(
              'Ganhos Diários',
              style: TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Spacer(),
            TextButton(
              onPressed: () => context.go(AppRoutes.riderOrders),
              child: const Text(
                'Ver histórico',
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

  Widget _infoBlock({required String title, required String subtitle}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            title,
            style: const TextStyle(
              color: Color(0xFFCBD5E1),
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _threeColumnSummary({
    required String leftLabel,
    required String middleLabel,
    required String rightLabel,
    required String leftValue,
    required String middleValue,
    required String rightValue,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: _summaryCell(
              label: leftLabel,
              value: leftValue,
              icon: Icons.lunch_dining_rounded,
            ),
          ),
          Expanded(
            child: _summaryCell(
              label: middleLabel,
              value: middleValue,
              icon: Icons.payments_outlined,
            ),
          ),
          Expanded(
            child: _summaryCell(
              label: rightLabel,
              value: rightValue,
              icon: Icons.route_rounded,
            ),
          ),
        ],
      ),
    );
  }

  Widget _summaryCell({
    required String label,
    required String value,
    required IconData icon,
  }) {
    return Column(
      children: <Widget>[
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(icon, color: const Color(0xFF94A3B8), size: 14),
            const SizedBox(width: 4),
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
        const SizedBox(height: 5),
        Text(
          value,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  Widget _actionButton({
    required String label,
    required IconData icon,
    required VoidCallback? onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          minimumSize: const Size.fromHeight(46),
          elevation: 0,
          backgroundColor: const Color(0xFF19B3E6),
          foregroundColor: Colors.white,
          disabledBackgroundColor: const Color(
            0xFF19B3E6,
          ).withValues(alpha: 0.45),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        icon: Icon(icon, size: 18),
        label: Text(
          label,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
        ),
      ),
    );
  }

  Widget _secondaryActionButton({
    required String label,
    required IconData icon,
    required VoidCallback? onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(46),
          side: BorderSide(color: Colors.white.withValues(alpha: 0.14)),
          foregroundColor: const Color(0xFFCBD5E1),
          backgroundColor: Colors.white.withValues(alpha: 0.03),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        icon: Icon(icon, size: 18),
        label: Text(
          label,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
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
      final repository = ref.read(riderRepositoryProvider);
      final results = await Future.wait<Object?>(<Future<Object?>>[
        repository.getDashboard(),
        repository.getCurrentOffer(),
        repository.getActiveOrder(),
      ]);

      if (!mounted) {
        return;
      }

      final dashboard = results[0] as RiderDashboardData;
      final offer = results[1] as RiderOfferData?;
      final activeOrder =
          (results[2] as RiderOrderData?) ?? dashboard.activeOrder;

      setState(() {
        _dashboard = dashboard;
        _offer = offer;
        _activeOrder = activeOrder;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _errorMessage = mapApiErrorMessage(
          error,
          fallbackMessage: 'Não foi possível atualizar a home do rider.',
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

  Future<void> _setAvailability(bool online) async {
    await _runAction(() async {
      await ref.read(riderRepositoryProvider).setAvailability(online: online);
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            online ? 'Modo online ativado.' : 'Modo offline ativado.',
          ),
        ),
      );
      await _loadData();
    });
  }

  Future<void> _acceptOffer() async {
    final offer = _offer;
    if (offer == null) {
      return;
    }

    await _runAction(() async {
      await ref.read(riderRepositoryProvider).acceptOffer(offer.offerId);
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Solicitação aceita.')));
      await _loadData();
    });
  }

  Future<void> _rejectOffer() async {
    final offer = _offer;
    if (offer == null) {
      return;
    }

    await _runAction(() async {
      await ref
          .read(riderRepositoryProvider)
          .rejectOffer(offerId: offer.offerId);
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Solicitação recusada.')));
      await _loadData();
    });
  }

  Future<void> _appendOrderEvent({
    required String eventType,
    required String successMessage,
  }) async {
    final order = _activeOrder;
    if (order == null) {
      return;
    }

    await _runAction(() async {
      await ref
          .read(riderRepositoryProvider)
          .appendOrderEvent(orderId: order.id, eventType: eventType);
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(successMessage)));
      await _loadData();
    });
  }

  Future<void> _completeOrder() async {
    final order = _activeOrder;
    if (order == null) {
      return;
    }

    final code = _confirmationCodeController.text.trim();
    if (code.length != 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Informe o código de 4 dígitos.')),
      );
      return;
    }

    await _runAction(() async {
      await ref
          .read(riderRepositoryProvider)
          .completeOrder(orderId: order.id, confirmationCode: code);
      _confirmationCodeController.clear();
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Entrega finalizada com sucesso.')),
      );
      await _loadData();
    });
  }

  Future<void> _runAction(Future<void> Function() callback) async {
    setState(() {
      _isActionInProgress = true;
    });

    try {
      await callback();
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            mapApiErrorMessage(
              error,
              fallbackMessage: 'Não foi possível concluir a ação.',
            ),
          ),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isActionInProgress = false;
        });
      }
    }
  }

  _StageMeta _stageMeta(_RiderHomeStage stage) {
    switch (stage) {
      case _RiderHomeStage.offline:
        return const _StageMeta(
          badgeLabel: 'OFFLINE',
          phaseLabel: 'DISPONIBILIDADE',
          title: 'Você está offline',
          description: 'Ative o modo online para entrar na fila de entregas.',
          badgeColor: Color(0xFFCBD5E1),
        );
      case _RiderHomeStage.onlineIdle:
        return const _StageMeta(
          badgeLabel: 'ONLINE',
          phaseLabel: 'DISPONIBILIDADE',
          title: 'Aguardando solicitação',
          description: 'Você está disponível para receber pedidos.',
          badgeColor: Color(0xFF86EFAC),
        );
      case _RiderHomeStage.requestIncoming:
        return const _StageMeta(
          badgeLabel: 'SOLICITAÇÃO',
          phaseLabel: 'ETAPAS 1 E 2 DE 8',
          title: 'Nova solicitação de entrega',
          description: 'Analise os dados para aceitar ou recusar o pedido.',
          badgeColor: Color(0xFF67E8F9),
        );
      case _RiderHomeStage.toMerchant:
        return const _StageMeta(
          badgeLabel: 'EM ROTA',
          phaseLabel: 'ETAPA 3 DE 8',
          title: 'A caminho do comércio',
          description: 'Siga para coleta do pedido.',
          badgeColor: Color(0xFF67E8F9),
        );
      case _RiderHomeStage.atMerchant:
        return const _StageMeta(
          badgeLabel: 'NO COMÉRCIO',
          phaseLabel: 'ETAPA 4 DE 8',
          title: 'Chegada registrada',
          description: 'Aguardando preparo do pedido no comércio.',
          badgeColor: Color(0xFFFCD34D),
        );
      case _RiderHomeStage.waitingOrder:
        return const _StageMeta(
          badgeLabel: 'AGUARDANDO',
          phaseLabel: 'ETAPA 5 DE 8',
          title: 'Aguardando o pedido',
          description: 'Pedido em preparo no comércio.',
          badgeColor: Color(0xFFF59E0B),
        );
      case _RiderHomeStage.toCustomer:
        return const _StageMeta(
          badgeLabel: 'EM ENTREGA',
          phaseLabel: 'ETAPA 6 DE 8',
          title: 'A caminho do cliente',
          description: 'Pedido retirado. Siga para o destino final.',
          badgeColor: Color(0xFF60A5FA),
        );
      case _RiderHomeStage.atCustomer:
        return const _StageMeta(
          badgeLabel: 'NO DESTINO',
          phaseLabel: 'ETAPA 7 DE 8',
          title: 'Chegada ao cliente',
          description: 'Solicite o código para finalizar a entrega.',
          badgeColor: Color(0xFFA78BFA),
        );
      case _RiderHomeStage.finishingDelivery:
        return const _StageMeta(
          badgeLabel: 'FINALIZANDO',
          phaseLabel: 'ETAPA 8 DE 8',
          title: 'Finalizar entrega',
          description: 'Informe o código de confirmação do cliente.',
          badgeColor: Color(0xFF67E8F9),
        );
    }
  }

  String _resolvePickupLabel(RiderOrderData? order) {
    if (order == null) {
      return 'Pedido sem detalhes de coleta.';
    }
    final distance = order.distanceM != null
        ? _formatDistance(order.distanceM!)
        : 'Distância não informada';
    final value = _formatCurrency(order.totalBrl);
    return 'Pedido em coleta • $distance • $value';
  }

  String _resolveRouteSubtitle(RiderOrderData order) {
    final distance = order.distanceM != null
        ? _formatDistance(order.distanceM!)
        : '-';
    final duration = order.durationS != null
        ? '${(order.durationS! / 60).ceil()} min'
        : '-';
    return 'Distância $distance • $duration';
  }

  String _statusTitle(String status) {
    switch (status) {
      case 'to_merchant':
        return 'A caminho do comércio';
      case 'at_merchant':
        return 'No comércio';
      case 'waiting_order':
        return 'Aguardando pedido';
      case 'to_customer':
        return 'A caminho do cliente';
      case 'at_customer':
        return 'No cliente';
      case 'finishing_delivery':
        return 'Finalizando entrega';
      default:
        return 'Entrega em andamento';
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

  String _formatDistance(int distanceM) {
    return '${(distanceM / 1000).toStringAsFixed(1)} km';
  }
}

class _StageMeta {
  const _StageMeta({
    required this.badgeLabel,
    required this.phaseLabel,
    required this.title,
    required this.description,
    required this.badgeColor,
  });

  final String badgeLabel;
  final String phaseLabel;
  final String title;
  final String description;
  final Color badgeColor;
}
