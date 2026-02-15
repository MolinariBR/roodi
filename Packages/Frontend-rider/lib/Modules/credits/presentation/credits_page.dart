import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/api-client/api_error_parser.dart';
import '../../../Core/navigation/app_routes.dart';
import '../../commerce-home/domain/commerce_models.dart';
import '../../commerce-home/infra/commerce_repository.dart';

class CreditsPage extends ConsumerStatefulWidget {
  const CreditsPage({super.key});

  @override
  ConsumerState<CreditsPage> createState() => _CreditsPageState();
}

class _CreditsPageState extends ConsumerState<CreditsPage> {
  bool _isLoading = true;
  bool _isPurchasing = false;
  bool _isChecking = false;
  String? _errorMessage;

  String _paymentMethod = 'pix';
  double _selectedAmountBrl = 109.90;

  CommerceCreditsBalanceData? _balance;
  List<CommerceCreditsLedgerItemData> _ledger =
      const <CommerceCreditsLedgerItemData>[];
  CommercePurchaseIntentData? _lastIntent;
  CommercePaymentCheckData? _lastCheck;

  @override
  void initState() {
    super.initState();
    Future<void>.microtask(_loadData);
  }

  @override
  Widget build(BuildContext context) {
    final balance = _balance;
    final weeklyUsage = _weeklyUsage();
    final autonomyWeeks = _autonomyWeeks();

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
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              'Comerciante',
              style: TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
              ),
            ),
            Text(
              'Compra de Créditos',
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
              _buildBalanceCard(
                balance: balance,
                weeklyUsage: weeklyUsage,
                autonomyWeeks: autonomyWeeks,
              ),
              const SizedBox(height: 14),
              _buildPackagesSection(),
              const SizedBox(height: 14),
              _buildPaymentHistorySection(),
              if (_errorMessage != null) ...<Widget>[
                const SizedBox(height: 14),
                _buildErrorCard(),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBalanceCard({
    required CommerceCreditsBalanceData? balance,
    required double weeklyUsage,
    required double autonomyWeeks,
  }) {
    final saldo = balance == null
        ? '--'
        : _formatCompactMoney(balance.balanceBrl);
    final usage = weeklyUsage > 0 ? _formatCompactMoney(weeklyUsage) : '--';
    final autonomy = autonomyWeeks > 0
        ? '${autonomyWeeks.toStringAsFixed(1)}sem'
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
                  color: const Color(0xFF86EFAC).withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  'Carteira ativa',
                  style: TextStyle(
                    color: Color(0xFF86EFAC),
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
              const Spacer(),
              TextButton(
                onPressed: () => context.go(AppRoutes.commerceHistory),
                child: const Text(
                  'Histórico',
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
                  icon: Icons.account_balance_wallet_outlined,
                  iconColor: const Color(0xFF86EFAC),
                  label: 'Saldo',
                  value: saldo,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _metricCard(
                  icon: Icons.trending_up_rounded,
                  iconColor: const Color(0xFF60A5FA),
                  label: 'Uso médio',
                  value: usage == '--' ? usage : '$usage/sem',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _metricCard(
                  icon: Icons.schedule_rounded,
                  iconColor: const Color(0xFF67E8F9),
                  label: 'Autonomia',
                  value: autonomy,
                ),
              ),
            ],
          ),
          if (_isLoading) ...<Widget>[
            const SizedBox(height: 10),
            const Center(child: CircularProgressIndicator()),
          ],
        ],
      ),
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
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        children: <Widget>[
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Icon(icon, color: iconColor, size: 14),
              const SizedBox(width: 4),
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
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPackagesSection() {
    final packages =
        <({String name, String subtitle, double amount, bool featured})>[
          (
            name: 'Pacote Básico',
            subtitle: '50 créditos para uso rápido',
            amount: 49.90,
            featured: false,
          ),
          (
            name: 'Pacote Profissional',
            subtitle: '120 créditos + 10 bônus',
            amount: 109.90,
            featured: true,
          ),
          (
            name: 'Pacote Empresarial',
            subtitle: '300 créditos + 40 bônus',
            amount: 249.90,
            featured: false,
          ),
        ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Row(
          children: <Widget>[
            const Text(
              'Pacotes de Créditos',
              style: TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Spacer(),
            TextButton(
              onPressed: () {},
              child: const Text(
                'Comparar',
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
        ...packages.map((pack) {
          final selected = _selectedAmountBrl == pack.amount;
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: selected
                  ? const Color(0x3319B3E6)
                  : Colors.white.withValues(alpha: 0.03),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: selected
                    ? const Color(0xFF19B3E6)
                    : Colors.white.withValues(alpha: 0.1),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            pack.name,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          Text(
                            pack.subtitle,
                            style: const TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _formatCurrency(pack.amount),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                if (pack.featured) ...<Widget>[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0x3319B3E6),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Text(
                      'Mais escolhido',
                      style: TextStyle(
                        color: Color(0xFF67E8F9),
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isPurchasing
                        ? null
                        : () => _purchaseCredits(pack.amount),
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size.fromHeight(40),
                      elevation: 0,
                      backgroundColor: selected
                          ? Colors.white
                          : Colors.white.withValues(alpha: 0.08),
                      foregroundColor: selected ? Colors.black : Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    icon: _isPurchasing && selected
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.arrow_forward_rounded, size: 16),
                    label: Text(
                      selected ? 'Selecionado' : 'Selecionar pacote',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildPaymentHistorySection() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Text(
            'Pagamento e Histórico',
            style: TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: <Widget>[
              Expanded(child: _paymentMethodButton('pix', 'Pix')),
              const SizedBox(width: 8),
              Expanded(child: _paymentMethodButton('card', 'Cartão')),
            ],
          ),
          const SizedBox(height: 10),
          if (_ledger.isEmpty && !_isLoading)
            _smallMessage('Sem movimentações no extrato até o momento.')
          else
            ..._ledger.take(5).map(_ledgerItemCard),
          if (_lastIntent != null) ...<Widget>[
            const SizedBox(height: 10),
            _intentCard(_lastIntent!),
          ],
          if (_lastCheck != null) ...<Widget>[
            const SizedBox(height: 8),
            _paymentCheckCard(_lastCheck!),
          ],
          const SizedBox(height: 12),
          Row(
            children: <Widget>[
              Expanded(
                child: OutlinedButton(
                  onPressed: _isChecking ? null : _openPaymentCheckSheet,
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(44),
                    side: BorderSide(
                      color: Colors.white.withValues(alpha: 0.14),
                    ),
                    foregroundColor: const Color(0xFFCBD5E1),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: _isChecking
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text(
                          'Conferir pagamento',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _isPurchasing
                      ? null
                      : () => _purchaseCredits(_selectedAmountBrl),
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size.fromHeight(44),
                    elevation: 0,
                    backgroundColor: const Color(0xFF19B3E6),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  icon: _isPurchasing
                      ? const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.payments_rounded, size: 16),
                  label: const Text(
                    'Comprar agora',
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

  Widget _paymentMethodButton(String method, String label) {
    final active = _paymentMethod == method;
    return OutlinedButton(
      onPressed: () {
        if (_paymentMethod == method) {
          return;
        }
        setState(() {
          _paymentMethod = method;
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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
      child: Text(
        label,
        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
      ),
    );
  }

  Widget _ledgerItemCard(CommerceCreditsLedgerItemData item) {
    final color = _ledgerTypeColor(item);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  _ledgerTypeLabel(item),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Text(
                  _formatDateTime(item.createdAt),
                  style: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          Text(
            _formatSignedCurrency(item.amountBrl),
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _intentCard(CommercePurchaseIntentData intent) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0x3319B3E6),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0x6619B3E6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Text(
            'Checkout criado',
            style: TextStyle(
              color: Color(0xFF67E8F9),
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'NSU: ${intent.orderNsu}',
            style: const TextStyle(
              color: Color(0xFFCBD5E1),
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            intent.checkoutUrl,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () async {
              await Clipboard.setData(ClipboardData(text: intent.checkoutUrl));
              if (!mounted) {
                return;
              }
              _showSnackBar('Link de checkout copiado.');
            },
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(36),
            ),
            icon: const Icon(Icons.copy_rounded, size: 16),
            label: const Text(
              'Copiar link de checkout',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }

  Widget _paymentCheckCard(CommercePaymentCheckData check) {
    final statusLabel = check.paid
        ? 'Pagamento aprovado'
        : 'Pagamento pendente';
    final statusColor = check.paid
        ? const Color(0xFF86EFAC)
        : const Color(0xFFFCD34D);
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: statusColor.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: statusColor.withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            statusLabel,
            style: TextStyle(
              color: statusColor,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Valor: ${_formatCurrency(check.paidAmount / 100)} • ${check.captureMethod}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _smallMessage(String message) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(10),
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
            'Falha ao carregar créditos',
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
      final result = await Future.wait<Object>(<Future<Object>>[
        repository.getCreditsBalance(),
        repository.getCreditsLedger(limit: 20),
      ]);

      if (!mounted) {
        return;
      }

      setState(() {
        _balance = result[0] as CommerceCreditsBalanceData;
        _ledger = (result[1] as CommerceCreditsLedgerData).items;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _errorMessage = mapApiErrorMessage(
          error,
          fallbackMessage: 'Não foi possível carregar o módulo de créditos.',
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

  Future<void> _purchaseCredits(double amountBrl) async {
    setState(() {
      _selectedAmountBrl = amountBrl;
      _isPurchasing = true;
    });

    try {
      final intent = await ref
          .read(commerceRepositoryProvider)
          .createCreditPurchaseIntent(amountBrl: amountBrl);

      if (!mounted) {
        return;
      }

      setState(() {
        _lastIntent = intent;
      });
      _showSnackBar(
        'Checkout criado. Copie o link para finalizar o pagamento.',
      );
    } catch (error) {
      if (!mounted) {
        return;
      }
      _showSnackBar(
        mapApiErrorMessage(
          error,
          fallbackMessage: 'Não foi possível criar o checkout de compra.',
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isPurchasing = false;
        });
      }
    }
  }

  Future<void> _openPaymentCheckSheet() async {
    final intent = _lastIntent;
    if (intent == null) {
      _showSnackBar('Crie um checkout antes de conferir pagamento.');
      return;
    }

    final handleController = TextEditingController();
    final orderNsuController = TextEditingController(text: intent.orderNsu);
    final transactionNsuController = TextEditingController();
    final slugController = TextEditingController();

    final shouldCheck = await showModalBottomSheet<bool>(
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
                'Conferir pagamento',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 10),
              _sheetField(handleController, 'Handle'),
              const SizedBox(height: 8),
              _sheetField(orderNsuController, 'Order NSU'),
              const SizedBox(height: 8),
              _sheetField(transactionNsuController, 'Transaction NSU'),
              const SizedBox(height: 8),
              _sheetField(slugController, 'Slug'),
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
                        if (handleController.text.trim().isEmpty ||
                            orderNsuController.text.trim().isEmpty ||
                            transactionNsuController.text.trim().isEmpty ||
                            slugController.text.trim().isEmpty) {
                          return;
                        }
                        Navigator.of(context).pop(true);
                      },
                      child: const Text('Conferir'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );

    final handle = handleController.text.trim();
    final orderNsu = orderNsuController.text.trim();
    final transactionNsu = transactionNsuController.text.trim();
    final slug = slugController.text.trim();

    handleController.dispose();
    orderNsuController.dispose();
    transactionNsuController.dispose();
    slugController.dispose();

    if (shouldCheck != true ||
        handle.isEmpty ||
        orderNsu.isEmpty ||
        transactionNsu.isEmpty ||
        slug.isEmpty) {
      return;
    }

    setState(() {
      _isChecking = true;
    });

    try {
      final result = await ref
          .read(commerceRepositoryProvider)
          .checkPayment(
            paymentId: intent.paymentId,
            handle: handle,
            orderNsu: orderNsu,
            transactionNsu: transactionNsu,
            slug: slug,
          );
      if (!mounted) {
        return;
      }
      setState(() {
        _lastCheck = result;
      });
      _showSnackBar(
        result.paid ? 'Pagamento confirmado.' : 'Pagamento ainda pendente.',
      );
      if (result.paid) {
        await _loadData();
      }
    } catch (error) {
      if (!mounted) {
        return;
      }
      _showSnackBar(
        mapApiErrorMessage(
          error,
          fallbackMessage: 'Não foi possível conferir o pagamento.',
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isChecking = false;
        });
      }
    }
  }

  Widget _sheetField(TextEditingController controller, String hint) {
    return TextField(
      controller: controller,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
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
      ),
    );
  }

  double _weeklyUsage() {
    final sevenDaysAgo = DateTime.now().subtract(const Duration(days: 7));
    return _ledger
        .where(
          (item) => item.createdAt.isAfter(sevenDaysAgo) && item.amountBrl < 0,
        )
        .fold<double>(0, (sum, item) => sum + item.amountBrl.abs());
  }

  double _autonomyWeeks() {
    final weeklyUsage = _weeklyUsage();
    final available = _balance?.availableBrl ?? 0;
    if (weeklyUsage <= 0 || available <= 0) {
      return 0;
    }
    return available / weeklyUsage;
  }

  Color _ledgerTypeColor(CommerceCreditsLedgerItemData item) {
    if (item.amountBrl >= 0) {
      return const Color(0xFF86EFAC);
    }
    return const Color(0xFFFCA5A5);
  }

  String _ledgerTypeLabel(CommerceCreditsLedgerItemData item) {
    switch (item.type) {
      case 'credit_purchase':
        return 'Compra de créditos';
      case 'order_debit':
        return 'Consumo de entrega';
      case 'admin_adjustment':
        return 'Ajuste administrativo';
      default:
        return item.type;
    }
  }

  String _formatDateTime(DateTime dateTime) {
    final dd = dateTime.day.toString().padLeft(2, '0');
    final mm = dateTime.month.toString().padLeft(2, '0');
    final hh = dateTime.hour.toString().padLeft(2, '0');
    final min = dateTime.minute.toString().padLeft(2, '0');
    return '$dd/$mm $hh:$min';
  }

  String _formatSignedCurrency(double value) {
    final prefix = value >= 0 ? '+' : '-';
    return '$prefix ${_formatCurrency(value.abs())}';
  }

  String _formatCompactMoney(double value) {
    if (value >= 1000) {
      return 'R\$ ${(value / 1000).toStringAsFixed(1).replaceAll('.', ',')}k';
    }
    return _formatCurrency(value);
  }

  String _formatCurrency(double value) {
    final normalized = value.toStringAsFixed(2).replaceAll('.', ',');
    return 'R\$ $normalized';
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }
}
