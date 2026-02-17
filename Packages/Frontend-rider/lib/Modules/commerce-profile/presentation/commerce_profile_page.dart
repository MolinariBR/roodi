import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/api-client/api_error_parser.dart';
import '../../../Core/navigation/app_routes.dart';
import '../../../Core/state/session_controller.dart';
import '../../commerce-home/domain/commerce_models.dart';
import '../../commerce-home/infra/commerce_repository.dart';

class CommerceProfilePage extends ConsumerStatefulWidget {
  const CommerceProfilePage({super.key});

  @override
  ConsumerState<CommerceProfilePage> createState() =>
      _CommerceProfilePageState();
}

class _CommerceProfilePageState extends ConsumerState<CommerceProfilePage> {
  bool _isLoading = true;
  bool _isUpdating = false;
  String? _errorMessage;

  bool _storePaused = false;
  bool _soundNotifications = true;
  double _serviceRadiusKm = 4;
  String _pickupPriority = 'Padrão';

  CommerceProfileData? _profile;
  List<CommerceOrderData> _orders = const <CommerceOrderData>[];

  @override
  void initState() {
    super.initState();
    Future<void>.microtask(_loadData);
  }

  @override
  Widget build(BuildContext context) {
    final profile = _profile;
    final todayOrders = _orders
        .where((item) => _isToday(item.createdAt))
        .toList();
    final avgFee = todayOrders.isEmpty
        ? 0.0
        : todayOrders.fold<double>(0, (sum, item) => sum + item.totalBrl) /
              todayOrders.length;
    final avgDispatch = _averageEta(todayOrders);

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
          },
          itemBuilder: (context) => const <PopupMenuEntry<String>>[
            PopupMenuItem<String>(value: 'home', child: Text('Início')),
            PopupMenuItem<String>(value: 'orders', child: Text('Pedidos')),
            PopupMenuItem<String>(value: 'profile', child: Text('Perfil')),
          ],
        ),
        title: const Text(
          'Perfil',
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
                  padding: EdgeInsets.only(top: 44),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (_errorMessage != null)
                _buildErrorCard()
              else if (profile != null) ...<Widget>[
                _buildHeaderCard(
                  profile: profile,
                  todayCalls: todayOrders.length,
                  avgFee: avgFee,
                  avgDispatch: avgDispatch,
                ),
                const SizedBox(height: 14),
                _buildOperationSection(),
                const SizedBox(height: 14),
                _buildPreferencesSection(),
                const SizedBox(height: 14),
                _buildAccountSection(),
                const SizedBox(height: 14),
                _buildSupportSection(),
                const SizedBox(height: 14),
                _buildLogoutButton(),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderCard({
    required CommerceProfileData profile,
    required int todayCalls,
    required double avgFee,
    required int avgDispatch,
  }) {
    final statusLabel = _storePaused ? 'LOJA PAUSADA' : 'LOJA ABERTA';
    final statusColor = _storePaused
        ? const Color(0xFFFCA5A5)
        : const Color(0xFF86EFAC);
    final rankLabel = (profile.rankLevel ?? 'NÍVEL PRO').toUpperCase();
    final rating = profile.rating?.toStringAsFixed(1) ?? '0.0';
    final commerceId = (profile.commerceCode ?? profile.id)
        .replaceAll('-', '')
        .toUpperCase();
    final shortId = commerceId.length > 8
        ? commerceId.substring(0, 8)
        : commerceId;

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
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: <Widget>[
              _tag(
                statusLabel,
                statusColor,
                statusColor.withValues(alpha: 0.15),
              ),
              _tag(rankLabel, const Color(0xFF67E8F9), const Color(0x3319B3E6)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.14),
                  ),
                ),
                alignment: Alignment.center,
                child: const Icon(
                  Icons.storefront_rounded,
                  color: Color(0xFF67E8F9),
                  size: 26,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      profile.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'ID #$shortId',
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  Text(
                    rating,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const Text(
                    'Avaliação',
                    style: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: <Widget>[
              Expanded(
                child: _metricCard(
                  label: 'Chamados hoje',
                  value: '$todayCalls',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _metricCard(
                  label: 'Taxa média',
                  value: avgFee > 0 ? _formatCurrency(avgFee) : '--',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _metricCard(
                  label: 'Despacho',
                  value: avgDispatch > 0 ? '${avgDispatch}min' : '--',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOperationSection() {
    return _section(
      title: 'Operação',
      children: <Widget>[
        _listCard(
          icon: Icons.two_wheeler_rounded,
          iconColor: const Color(0xFF67E8F9),
          title: 'Chamar Rider',
          subtitle: 'Criar novo chamado de coleta',
          sideLabel: 'Abrir',
          onTap: () => context.go(AppRoutes.commerceCreateCall),
        ),
        _listCard(
          icon: Icons.pause_circle_outline_rounded,
          iconColor: const Color(0xFFFCD34D),
          title: 'Pausar Loja',
          subtitle: 'Suspender novos chamados temporariamente',
          sideLabel: _storePaused ? 'Pausada' : 'Ativa',
          sideColor: _storePaused
              ? const Color(0xFFFCA5A5)
              : const Color(0xFF86EFAC),
          onTap: _isUpdating ? null : _toggleStorePause,
        ),
      ],
    );
  }

  Widget _buildPreferencesSection() {
    return _section(
      title: 'Preferências de Despacho',
      children: <Widget>[
        _listCard(
          icon: Icons.pin_drop_outlined,
          iconColor: const Color(0xFF60A5FA),
          title: 'Raio de atendimento',
          subtitle: 'Até ${_serviceRadiusKm.toStringAsFixed(1)} km',
          sideLabel: 'Editar',
          onTap: _isUpdating ? null : _openRadiusSheet,
        ),
        _listCard(
          icon: Icons.speed_rounded,
          iconColor: const Color(0xFFA78BFA),
          title: 'Prioridade de coleta',
          subtitle: _pickupPriority,
          sideLabel: 'Alterar',
          onTap: _isUpdating ? null : _openPrioritySheet,
        ),
        _listCard(
          icon: Icons.campaign_outlined,
          iconColor: const Color(0xFF34D399),
          title: 'Notificação sonora',
          subtitle: _soundNotifications ? 'Ativada' : 'Desativada',
          sideLabel: _soundNotifications ? 'ON' : 'OFF',
          sideColor: _soundNotifications
              ? const Color(0xFF86EFAC)
              : const Color(0xFFCBD5E1),
          onTap: _isUpdating
              ? null
              : () {
                  setState(() {
                    _soundNotifications = !_soundNotifications;
                  });
                },
        ),
      ],
    );
  }

  Widget _buildAccountSection() {
    return _section(
      title: 'Conta e Gestão',
      children: <Widget>[
        _listCard(
          icon: Icons.groups_rounded,
          iconColor: const Color(0xFF67E8F9),
          title: 'Clientes da Empresa',
          subtitle: 'Contatos e endereços cadastrados',
          sideLabel: 'Abrir',
          onTap: () => context.go(AppRoutes.commerceClients),
        ),
        _listCard(
          icon: Icons.payments_outlined,
          iconColor: const Color(0xFF34D399),
          title: 'Pagamentos',
          subtitle: 'Pedidos pendentes e histórico de pagamento',
          sideLabel: 'Abrir',
          onTap: () => context.go(AppRoutes.commercePayments),
        ),
        _listCard(
          icon: Icons.inventory_2_outlined,
          iconColor: const Color(0xFFFCD34D),
          title: 'Produtos',
          subtitle: 'Catálogo, estoque e disponibilidade',
          sideLabel: 'Abrir',
          onTap: () => context.go(AppRoutes.commerceProducts),
        ),
        _listCard(
          icon: Icons.badge_outlined,
          iconColor: const Color(0xFFF97316),
          title: 'Dados da Empresa',
          subtitle: 'Documentação e cadastro',
          sideLabel: 'Editar',
          onTap: _isUpdating ? null : _openMerchantDataSheet,
        ),
      ],
    );
  }

  Widget _buildSupportSection() {
    return _section(
      title: 'Suporte e Segurança',
      children: <Widget>[
        _listCard(
          icon: Icons.help_outline_rounded,
          iconColor: const Color(0xFF67E8F9),
          title: 'Central de Ajuda',
          subtitle: 'Suporte e atendimento',
          sideLabel: 'Abrir',
          onTap: () => context.go(AppRoutes.support),
        ),
        _listCard(
          icon: Icons.gpp_good_outlined,
          iconColor: const Color(0xFFF87171),
          title: 'Privacidade e Segurança',
          subtitle: 'Acesso e proteção da conta',
          sideLabel: 'Abrir',
          onTap: _openPrivacySheet,
        ),
      ],
    );
  }

  Widget _buildLogoutButton() {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        onPressed: () async {
          await ref.read(sessionControllerProvider.notifier).logout();
        },
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(46),
          side: BorderSide(color: Colors.white.withValues(alpha: 0.12)),
          foregroundColor: const Color(0xFFCBD5E1),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: const Text(
          'Sair da Conta',
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
        ),
      ),
    );
  }

  Widget _section({required String title, required List<Widget> children}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 8),
        ...children,
      ],
    );
  }

  Widget _listCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required String sideLabel,
    Color sideColor = const Color(0xFFCBD5E1),
    VoidCallback? onTap,
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
            color: iconColor.withValues(alpha: 0.16),
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
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: sideColor.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            sideLabel,
            style: TextStyle(
              color: sideColor,
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }

  Widget _tag(String value, Color textColor, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        value,
        style: TextStyle(
          color: textColor,
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.8,
        ),
      ),
    );
  }

  Widget _metricCard({required String label, required String value}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
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
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            textAlign: TextAlign.center,
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
            'Falha ao carregar perfil',
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
        repository.getProfile(),
        repository.getOrders(limit: 30),
      ]);

      if (!mounted) {
        return;
      }

      setState(() {
        _profile = result[0] as CommerceProfileData;
        _orders = (result[1] as CommerceOrderListData).items;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _errorMessage = mapApiErrorMessage(
          error,
          fallbackMessage: 'Não foi possível carregar o perfil do comércio.',
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

  Future<void> _toggleStorePause() async {
    final shouldPause = !_storePaused;
    final confirm = await showModalBottomSheet<bool>(
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
              Text(
                shouldPause ? 'Pausar loja?' : 'Reativar loja?',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                shouldPause
                    ? 'Novos chamados ficarão bloqueados temporariamente.'
                    : 'A loja voltará a receber novos chamados.',
                style: const TextStyle(
                  color: Color(0xFFCBD5E1),
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
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
                      onPressed: () => Navigator.of(context).pop(true),
                      child: Text(shouldPause ? 'Pausar' : 'Reativar'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );

    if (confirm == true) {
      setState(() {
        _storePaused = shouldPause;
      });
    }
  }

  Future<void> _openRadiusSheet() async {
    final controller = TextEditingController(
      text: _serviceRadiusKm.toStringAsFixed(1),
    );

    final saved = await showModalBottomSheet<bool>(
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
                'Raio de atendimento',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: controller,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                style: const TextStyle(color: Colors.white),
                decoration: _sheetInputDecoration('Ex.: 4.0'),
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
                      onPressed: () => Navigator.of(context).pop(true),
                      child: const Text('Salvar'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );

    final value = double.tryParse(controller.text.trim().replaceAll(',', '.'));
    controller.dispose();

    if (saved == true && value != null && value > 0) {
      setState(() {
        _serviceRadiusKm = value;
      });
    }
  }

  Future<void> _openPrioritySheet() async {
    final selected = await showModalBottomSheet<String>(
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
                'Prioridade de coleta',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: <String>['Padrão', 'Urgente', 'Agendado']
                    .map(
                      (option) => OutlinedButton(
                        onPressed: () => Navigator.of(context).pop(option),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(
                            color: option == _pickupPriority
                                ? const Color(0xFF19B3E6)
                                : Colors.white.withValues(alpha: 0.2),
                          ),
                          backgroundColor: option == _pickupPriority
                              ? const Color(0x3319B3E6)
                              : Colors.white.withValues(alpha: 0.03),
                          foregroundColor: option == _pickupPriority
                              ? const Color(0xFF67E8F9)
                              : Colors.white,
                        ),
                        child: Text(option),
                      ),
                    )
                    .toList(growable: false),
              ),
            ],
          ),
        );
      },
    );

    if (selected != null && selected != _pickupPriority) {
      setState(() {
        _pickupPriority = selected;
      });
    }
  }

  Future<void> _openMerchantDataSheet() async {
    final profile = _profile;
    if (profile == null) {
      return;
    }

    final nameController = TextEditingController(text: profile.name);
    final phoneController = TextEditingController(
      text: profile.phoneNumber ?? '',
    );
    final whatsappController = TextEditingController(
      text: profile.whatsapp ?? '',
    );
    final baseAddressController = TextEditingController(
      text: profile.addressBase?.asSingleLine() == 'Endereco nao informado'
          ? ''
          : profile.addressBase?.asSingleLine() ?? '',
    );

    final shouldSave = await showModalBottomSheet<bool>(
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
                'Dados do comerciante',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 10),
              _sheetField(nameController, 'Nome'),
              const SizedBox(height: 8),
              _sheetField(phoneController, 'Telefone'),
              const SizedBox(height: 8),
              _sheetField(whatsappController, 'Whatsapp'),
              const SizedBox(height: 8),
              _sheetField(baseAddressController, 'Base de operação'),
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
                      onPressed: () => Navigator.of(context).pop(true),
                      child: const Text('Salvar'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );

    final name = nameController.text.trim();
    final phone = phoneController.text.trim();
    final whatsapp = whatsappController.text.trim();
    final baseAddress = baseAddressController.text.trim();

    nameController.dispose();
    phoneController.dispose();
    whatsappController.dispose();
    baseAddressController.dispose();

    if (shouldSave != true || name.length < 2) {
      return;
    }

    final currentAddress = profile.addressBase;
    final addressBasePayload = <String, dynamic>{};
    void putAddressValue(String key, String? value) {
      if (value == null) {
        return;
      }
      addressBasePayload[key] = value;
    }

    putAddressValue('cep', currentAddress?.cep);
    putAddressValue('state', currentAddress?.state);
    putAddressValue('city', currentAddress?.city);
    putAddressValue('neighborhood', currentAddress?.neighborhood);
    putAddressValue('number', currentAddress?.number);
    putAddressValue('complement', currentAddress?.complement);
    if (baseAddress.isNotEmpty) {
      addressBasePayload['street'] = baseAddress;
    }

    final payload = <String, dynamic>{
      'name': name,
      if (phone.isNotEmpty) 'phone_number': phone,
      if (whatsapp.isNotEmpty) 'whatsapp': whatsapp,
      if (addressBasePayload.isNotEmpty) 'address_base': addressBasePayload,
    };

    await _updateProfile(payload);
  }

  Future<void> _openPrivacySheet() async {
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: const Color(0xFF0A0B0C),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return const Padding(
          padding: EdgeInsets.fromLTRB(20, 16, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                'Privacidade e Segurança',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Use senha forte, revise sessões ativas e mantenha dados de contato atualizados para recuperação de conta.',
                style: TextStyle(
                  color: Color(0xFFCBD5E1),
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _updateProfile(Map<String, dynamic> payload) async {
    setState(() {
      _isUpdating = true;
    });

    try {
      final updated = await ref
          .read(commerceRepositoryProvider)
          .updateProfile(payload);
      if (!mounted) {
        return;
      }
      setState(() {
        _profile = updated;
      });
      _showSnackBar('Perfil atualizado com sucesso.');
    } catch (error) {
      if (!mounted) {
        return;
      }
      _showSnackBar(
        mapApiErrorMessage(
          error,
          fallbackMessage: 'Não foi possível atualizar o perfil.',
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isUpdating = false;
        });
      }
    }
  }

  Widget _sheetField(TextEditingController controller, String hint) {
    return TextField(
      controller: controller,
      style: const TextStyle(color: Colors.white),
      decoration: _sheetInputDecoration(hint),
    );
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
