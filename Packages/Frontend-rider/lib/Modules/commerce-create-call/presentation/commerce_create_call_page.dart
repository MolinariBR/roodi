import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/api-client/api_error_parser.dart';
import '../../../Core/navigation/app_routes.dart';
import '../../commerce-home/domain/commerce_models.dart';
import '../../commerce-home/infra/commerce_repository.dart';

class CommerceCreateCallPage extends ConsumerStatefulWidget {
  const CommerceCreateCallPage({super.key});

  @override
  ConsumerState<CommerceCreateCallPage> createState() =>
      _CommerceCreateCallPageState();
}

class _CommerceCreateCallPageState
    extends ConsumerState<CommerceCreateCallPage> {
  final _recipientController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _notesController = TextEditingController();
  final _originBairroController = TextEditingController();
  final _destinationBairroController = TextEditingController();

  bool _isLoading = true;
  bool _isQuoteLoading = false;
  bool _isSubmitting = false;
  String? _errorMessage;

  String _urgency = 'padrao';
  CommerceProfileData? _profile;
  CommerceCreditsBalanceData? _balance;
  CommerceQuoteData? _quote;

  @override
  void initState() {
    super.initState();
    Future<void>.microtask(_bootstrap);
  }

  @override
  void dispose() {
    _recipientController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _notesController.dispose();
    _originBairroController.dispose();
    _destinationBairroController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
              'Novo Chamado',
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
          onRefresh: _bootstrap,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 18),
            children: <Widget>[
              _buildHeaderCard(),
              const SizedBox(height: 14),
              _buildDeliveryFormCard(),
              const SizedBox(height: 14),
              _buildPricingCard(),
              const SizedBox(height: 14),
              _buildActionsRow(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderCard() {
    final profileName = _profile?.name ?? 'Loja';
    final balanceText = _balance == null
        ? '--'
        : _formatCurrency(_balance!.balanceBrl);

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
                  'Despacho',
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
                child: _smallInfo(label: 'Loja', value: profileName),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _smallInfo(label: 'Saldo', value: balanceText),
              ),
            ],
          ),
          if (_errorMessage != null) ...<Widget>[
            const SizedBox(height: 10),
            Text(
              _errorMessage!,
              style: const TextStyle(
                color: Color(0xFFFCA5A5),
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _smallInfo({required String label, required String value}) {
    return Container(
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
            label,
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 10,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.0,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryFormCard() {
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
                'Dados da Entrega',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Spacer(),
              TextButton(
                onPressed: () => context.go(AppRoutes.commerceClients),
                child: const Text(
                  'Clientes',
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
          _fieldLabel('Destinatário'),
          _textField(_recipientController, hint: 'Nome do destinatário'),
          const SizedBox(height: 8),
          _fieldLabel('Telefone'),
          _textField(
            _phoneController,
            hint: '(00) 00000-0000',
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 8),
          _fieldLabel('Endereço de Entrega'),
          _textField(_addressController, hint: 'Rua e número'),
          const SizedBox(height: 8),
          _fieldLabel('Observação para o Rider'),
          _textField(_notesController, hint: 'Instruções', maxLines: 2),
        ],
      ),
    );
  }

  Widget _buildPricingCard() {
    final quote = _quote;
    final price = quote?.price;

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
                'Parâmetros do Chamado',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Spacer(),
              TextButton(
                onPressed: () => context.go(AppRoutes.commerceCredits),
                child: const Text(
                  'Créditos',
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
          _fieldLabel('Urgência'),
          const SizedBox(height: 6),
          Row(
            children: <Widget>[
              Expanded(
                child: _urgencyButton(label: 'Padrão', value: 'padrao'),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _urgencyButton(label: 'Urgente', value: 'urgente'),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _urgencyButton(label: 'Agendado', value: 'agendado'),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: <Widget>[
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    _fieldLabel('Bairro origem'),
                    _textField(_originBairroController, hint: 'Ex: Centro'),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    _fieldLabel('Bairro destino'),
                    _textField(
                      _destinationBairroController,
                      hint: 'Ex: Vila Lobão',
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isQuoteLoading || _isLoading ? null : _simulateQuote,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(44),
                elevation: 0,
                backgroundColor: Colors.white,
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: _isQuoteLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.calculate_rounded, size: 18),
              label: const Text(
                'Simular taxa',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.03),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: Column(
              children: <Widget>[
                _metricRow(
                  label: 'Distância',
                  value: quote == null
                      ? '--'
                      : _formatDistance(quote.distanceM),
                ),
                const SizedBox(height: 4),
                _metricRow(
                  label: 'ETA',
                  value: quote == null ? '--' : '${quote.etaMin} min',
                ),
                const SizedBox(height: 4),
                _metricRow(
                  label: 'Zona',
                  value: quote == null ? '--' : 'Zona ${quote.zone}',
                ),
                const SizedBox(height: 8),
                const Divider(color: Color(0x22FFFFFF), height: 1),
                const SizedBox(height: 8),
                _metricRow(
                  label: 'Base distância',
                  value: price == null
                      ? '--'
                      : _formatCurrency(price.baseZoneBrl),
                ),
                const SizedBox(height: 4),
                _metricRow(
                  label: 'Urgência',
                  value: price == null
                      ? '--'
                      : '+ ${_formatCurrency(price.urgencyBrl)}',
                ),
                const SizedBox(height: 4),
                _metricRow(
                  label: 'Acréscimos',
                  value: price == null
                      ? '--'
                      : '+ ${_formatCurrency(_extrasValue(price))}',
                ),
                const SizedBox(height: 8),
                _metricRow(
                  label: 'Taxa final',
                  value: price == null ? '--' : _formatCurrency(price.totalBrl),
                  strong: true,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _fieldLabel(String label) {
    return Text(
      label,
      style: const TextStyle(
        color: Color(0xFF94A3B8),
        fontSize: 11,
        fontWeight: FontWeight.w700,
      ),
    );
  }

  Widget _textField(
    TextEditingController controller, {
    required String hint,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.03),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 10,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
        ),
        focusedBorder: const OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(10)),
          borderSide: BorderSide(color: Color(0xFF19B3E6)),
        ),
      ),
    );
  }

  Widget _urgencyButton({required String label, required String value}) {
    final isActive = _urgency == value;
    return OutlinedButton(
      onPressed: _isSubmitting
          ? null
          : () {
              if (_urgency == value) {
                return;
              }
              setState(() {
                _urgency = value;
              });
            },
      style: OutlinedButton.styleFrom(
        side: BorderSide(
          color: isActive
              ? const Color(0xFF19B3E6)
              : Colors.white.withValues(alpha: 0.16),
        ),
        backgroundColor: isActive
            ? const Color(0x3319B3E6)
            : Colors.white.withValues(alpha: 0.03),
        foregroundColor: isActive ? const Color(0xFF67E8F9) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
      child: Text(
        label,
        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
      ),
    );
  }

  Widget _metricRow({
    required String label,
    required String value,
    bool strong = false,
  }) {
    return Row(
      children: <Widget>[
        Text(
          label,
          style: TextStyle(
            color: strong ? const Color(0xFFCBD5E1) : const Color(0xFF94A3B8),
            fontSize: strong ? 12 : 11,
            fontWeight: strong ? FontWeight.w700 : FontWeight.w600,
          ),
        ),
        const Spacer(),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: TextStyle(
              color: Colors.white,
              fontSize: strong ? 13 : 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActionsRow() {
    return Row(
      children: <Widget>[
        Expanded(
          flex: 3,
          child: OutlinedButton(
            onPressed: _isSubmitting
                ? null
                : () => context.go(AppRoutes.commerceHome),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(46),
              side: BorderSide(color: Colors.white.withValues(alpha: 0.14)),
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
            onPressed: _isSubmitting ? null : _createCall,
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
            icon: _isSubmitting
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Icon(Icons.arrow_forward_rounded, size: 18),
            label: const Text(
              'Confirmar e Chamar Rider',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _bootstrap() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final repository = ref.read(commerceRepositoryProvider);
      final results = await Future.wait<Object>(<Future<Object>>[
        repository.getProfile(),
        repository.getCreditsBalance(),
      ]);

      if (!mounted) {
        return;
      }

      final profile = results[0] as CommerceProfileData;
      final balance = results[1] as CommerceCreditsBalanceData;
      final query = GoRouterState.of(context).uri.queryParameters;

      _profile = profile;
      _balance = balance;
      _originBairroController.text =
          profile.addressBase?.neighborhood ??
          profile.addressHome?.neighborhood ??
          'Centro';
      _recipientController.text =
          query['client_name'] ?? _recipientController.text;
      _phoneController.text = query['client_phone'] ?? _phoneController.text;
      _addressController.text =
          query['client_address'] ?? _addressController.text;
      _destinationBairroController.text =
          query['client_bairro'] ?? _destinationBairroController.text;
    } catch (error) {
      if (!mounted) {
        return;
      }
      _errorMessage = mapApiErrorMessage(
        error,
        fallbackMessage: 'Não foi possível carregar os dados iniciais.',
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _simulateQuote() async {
    final origin = _originBairroController.text.trim();
    final destination = _destinationBairroController.text.trim();
    if (origin.isEmpty || destination.isEmpty) {
      _showSnackBar('Preencha bairro de origem e destino para simular.');
      return;
    }

    setState(() {
      _isQuoteLoading = true;
    });

    try {
      final quote = await ref
          .read(commerceRepositoryProvider)
          .createQuote(
            originBairro: origin,
            destinationBairro: destination,
            urgency: _urgency,
            requestedAt: DateTime.now(),
          );
      if (!mounted) {
        return;
      }
      setState(() {
        _quote = quote;
      });
      _showSnackBar('Cotação simulada com sucesso.');
    } catch (error) {
      if (!mounted) {
        return;
      }
      _showSnackBar(
        mapApiErrorMessage(
          error,
          fallbackMessage: 'Não foi possível simular a taxa.',
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isQuoteLoading = false;
        });
      }
    }
  }

  Future<void> _createCall() async {
    final quote = _quote;
    if (quote == null) {
      _showSnackBar('Simule a taxa antes de confirmar o chamado.');
      return;
    }

    final addressText = _addressController.text.trim();
    if (addressText.isEmpty) {
      _showSnackBar('Informe o endereço de entrega.');
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final profile = _profile;
      final order = await ref
          .read(commerceRepositoryProvider)
          .createOrder(
            quoteId: quote.quoteId,
            urgency: _urgency,
            destination: <String, dynamic>{
              'street': addressText,
              if (_destinationBairroController.text.trim().isNotEmpty)
                'neighborhood': _destinationBairroController.text.trim(),
              if (profile?.addressBase?.city != null)
                'city': profile!.addressBase!.city,
              if (profile?.addressBase?.state != null)
                'state': profile!.addressBase!.state,
            },
            recipientName: _recipientController.text.trim().isEmpty
                ? null
                : _recipientController.text.trim(),
            recipientPhone: _phoneController.text.trim().isEmpty
                ? null
                : _phoneController.text.trim(),
            notes: _notesController.text.trim().isEmpty
                ? null
                : _notesController.text.trim(),
          );

      if (!mounted) {
        return;
      }
      _showSnackBar('Chamado criado com sucesso.');
      context.go(AppRoutes.commerceTrackingByOrderId(order.id));
    } catch (error) {
      if (!mounted) {
        return;
      }
      _showSnackBar(
        mapApiErrorMessage(
          error,
          fallbackMessage: 'Não foi possível criar o chamado.',
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  double _extrasValue(CommerceQuotePriceData price) {
    return price.sundayBrl + price.holidayBrl + price.rainBrl + price.peakBrl;
  }

  String _formatDistance(int distanceM) {
    return '${(distanceM / 1000).toStringAsFixed(1)} km';
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
