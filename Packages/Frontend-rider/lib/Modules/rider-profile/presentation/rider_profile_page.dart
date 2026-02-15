import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/api-client/api_error_parser.dart';
import '../../../Core/navigation/app_routes.dart';
import '../../../Core/state/session_controller.dart';
import '../../rider-home-flow/domain/rider_models.dart';
import '../../rider-home-flow/infra/rider_repository.dart';
import '../domain/rider_profile_models.dart';
import '../infra/rider_profile_repository.dart';

class RiderProfilePage extends ConsumerStatefulWidget {
  const RiderProfilePage({super.key});

  @override
  ConsumerState<RiderProfilePage> createState() => _RiderProfilePageState();
}

class _RiderProfilePageState extends ConsumerState<RiderProfilePage> {
  bool _isLoading = true;
  bool _isUpdating = false;
  String? _errorMessage;

  RiderProfileData? _profile;
  RiderDashboardData? _dashboard;

  @override
  void initState() {
    super.initState();
    Future<void>.microtask(_loadData);
  }

  @override
  Widget build(BuildContext context) {
    final profile = _profile;
    final dashboard = _dashboard;

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
              context.go(AppRoutes.riderOrders);
              return;
            }
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
              'Perfil',
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
              if (_isLoading)
                const Padding(
                  padding: EdgeInsets.only(top: 44),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (_errorMessage != null)
                _buildErrorCard()
              else if (profile != null && dashboard != null) ...<Widget>[
                _buildProfileCard(profile, dashboard),
                const SizedBox(height: 14),
                _buildAccountSection(profile),
                const SizedBox(height: 14),
                _buildVehicleSection(profile),
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

  Widget _buildProfileCard(
    RiderProfileData profile,
    RiderDashboardData dashboard,
  ) {
    final rankLabel = profile.rankLevel?.toUpperCase() ?? 'NÍVEL PADRÃO';
    final onlineLabel = dashboard.isOnline ? 'RIDER ATIVO' : 'RIDER OFFLINE';
    final onlineColor = dashboard.isOnline
        ? const Color(0xFF86EFAC)
        : const Color(0xFFCBD5E1);
    final rating = profile.rating?.toStringAsFixed(2) ?? '0.00';
    final riderId =
        profile.riderCode ?? profile.id.substring(0, 8).toUpperCase();

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
              _tag(rankLabel, const Color(0xFF67E8F9), const Color(0x3319B3E6)),
              _tag(
                onlineLabel,
                onlineColor,
                onlineColor.withValues(alpha: 0.15),
              ),
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
                child: Text(
                  profile.name.isNotEmpty
                      ? profile.name.trim().substring(0, 1).toUpperCase()
                      : 'R',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                  ),
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
                      'ID #$riderId',
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
                    'Reputação',
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
                  label: 'Tempo online',
                  value: _formatHours(dashboard.todayOnlineMinutes),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _metricCard(
                  label: 'Ganhos mês',
                  value: _formatCurrency(dashboard.monthEarningsBrl),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _metricCard(
                  label: 'Entregas',
                  value: '${dashboard.completedDeliveriesTotal}',
                ),
              ),
            ],
          ),
        ],
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

  Widget _buildAccountSection(RiderProfileData profile) {
    return _section(
      title: 'Conta e Preferências',
      children: <Widget>[
        _listCard(
          icon: Icons.person_outline_rounded,
          iconColor: const Color(0xFF67E8F9),
          title: 'Dados Pessoais',
          subtitle: 'Telefone, e-mail e endereço',
          sideLabel: 'Abrir',
          onTap: _isUpdating ? null : () => _openPersonalSheet(profile),
        ),
        _listCard(
          icon: Icons.account_balance_wallet_outlined,
          iconColor: const Color(0xFF34D399),
          title: 'Conta Bancária',
          subtitle: profile.bankAccount?.bank ?? 'Banco não informado',
          sideLabel: 'Abrir',
          onTap: _isUpdating ? null : () => _openBankSheet(profile),
        ),
        _listCard(
          icon: Icons.notifications_outlined,
          iconColor: const Color(0xFFA78BFA),
          title: 'Notificações',
          subtitle: 'Push e avisos de pedido',
          sideLabel: 'Abrir',
          onTap: () => context.go(AppRoutes.notifications),
        ),
        _listCard(
          icon: Icons.verified_user_outlined,
          iconColor: const Color(0xFFF59E0B),
          title: 'Documentos',
          subtitle: 'CNH e seguro verificados',
          sideLabel: 'OK',
          sideTone: const Color(0xFF86EFAC),
          onTap: () => _openDocumentsSheet(profile),
        ),
      ],
    );
  }

  Widget _buildVehicleSection(RiderProfileData profile) {
    return _section(
      title: 'Veículos',
      actionLabel: 'Atualizar',
      onAction: _isUpdating ? null : () => _openVehicleSheet(profile),
      children: <Widget>[
        _listCard(
          icon: Icons.two_wheeler_rounded,
          iconColor: const Color(0xFF60A5FA),
          title: profile.vehicle?.summary() ?? 'Veículo não informado',
          subtitle: profile.vehicle?.plate ?? 'Placa não informada',
          sideLabel: 'Regularizado',
          sideTone: const Color(0xFF86EFAC),
          onTap: _isUpdating ? null : () => _openVehicleSheet(profile),
        ),
      ],
    );
  }

  Widget _buildSupportSection() {
    return _section(
      title: 'Segurança e Suporte',
      children: <Widget>[
        _listCard(
          icon: Icons.help_outline_rounded,
          iconColor: const Color(0xFF67E8F9),
          title: 'Central de Ajuda',
          subtitle: 'FAQ e chamados',
          sideLabel: 'Abrir',
          onTap: () => context.go(AppRoutes.support),
        ),
        _listCard(
          icon: Icons.gpp_good_outlined,
          iconColor: const Color(0xFFF87171),
          title: 'Privacidade e Segurança',
          subtitle: 'Senha e autenticação',
          sideLabel: 'Abrir',
          onTap: _openSecuritySheet,
        ),
      ],
    );
  }

  Widget _buildLogoutButton() {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        onPressed: _isUpdating ? null : _logout,
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(48),
          side: BorderSide(color: Colors.white.withValues(alpha: 0.14)),
          foregroundColor: const Color(0xFFCBD5E1),
          backgroundColor: Colors.white.withValues(alpha: 0.04),
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

  Widget _section({
    required String title,
    String? actionLabel,
    VoidCallback? onAction,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Row(
          children: <Widget>[
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
            const Spacer(),
            if (actionLabel != null)
              TextButton(
                onPressed: onAction,
                child: Text(
                  actionLabel,
                  style: const TextStyle(
                    color: Color(0xFF67E8F9),
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
          ],
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
    Color sideTone = const Color(0xFFCBD5E1),
    required VoidCallback? onTap,
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
            color: sideTone.withValues(alpha: 0.14),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            sideLabel,
            style: TextStyle(
              color: sideTone,
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
      final profileRepository = ref.read(riderProfileRepositoryProvider);
      final riderRepository = ref.read(riderRepositoryProvider);

      final results = await Future.wait<Object>(<Future<Object>>[
        profileRepository.getProfile(),
        riderRepository.getDashboard(),
      ]);

      if (!mounted) {
        return;
      }

      setState(() {
        _profile = results[0] as RiderProfileData;
        _dashboard = results[1] as RiderDashboardData;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _errorMessage = mapApiErrorMessage(
          error,
          fallbackMessage: 'Não foi possível carregar o perfil do rider.',
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

  Future<void> _patchProfile(Map<String, dynamic> payload) async {
    setState(() {
      _isUpdating = true;
    });

    try {
      final updated = await ref
          .read(riderProfileRepositoryProvider)
          .updateProfile(payload);

      if (!mounted) {
        return;
      }

      setState(() {
        _profile = updated;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Perfil atualizado com sucesso.')),
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
              fallbackMessage: 'Falha ao atualizar perfil.',
            ),
          ),
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

  Future<void> _openPersonalSheet(RiderProfileData profile) async {
    final nameController = TextEditingController(text: profile.name);
    final phoneController = TextEditingController(
      text: profile.phoneNumber ?? '',
    );
    final whatsappController = TextEditingController(
      text: profile.whatsapp ?? '',
    );

    final homeStateController = TextEditingController(
      text: profile.addressHome?.state ?? '',
    );
    final homeCityController = TextEditingController(
      text: profile.addressHome?.city ?? '',
    );
    final homeNeighborhoodController = TextEditingController(
      text: profile.addressHome?.neighborhood ?? '',
    );
    final homeStreetController = TextEditingController(
      text: profile.addressHome?.street ?? '',
    );
    final homeNumberController = TextEditingController(
      text: profile.addressHome?.number ?? '',
    );
    final homeCepController = TextEditingController(
      text: profile.addressHome?.cep ?? '',
    );
    final homeComplementController = TextEditingController(
      text: profile.addressHome?.complement ?? '',
    );

    final baseStateController = TextEditingController(
      text: profile.addressBase?.state ?? '',
    );
    final baseCityController = TextEditingController(
      text: profile.addressBase?.city ?? '',
    );
    final baseNeighborhoodController = TextEditingController(
      text: profile.addressBase?.neighborhood ?? '',
    );
    final baseStreetController = TextEditingController(
      text: profile.addressBase?.street ?? '',
    );
    final baseNumberController = TextEditingController(
      text: profile.addressBase?.number ?? '',
    );
    final baseCepController = TextEditingController(
      text: profile.addressBase?.cep ?? '',
    );
    final baseComplementController = TextEditingController(
      text: profile.addressBase?.complement ?? '',
    );

    await _showEditSheet(
      title: 'Dados Pessoais',
      contentBuilder: (context, setModalState) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            _fieldLabel('Nome completo'),
            _textField(nameController),
            const SizedBox(height: 10),
            _fieldLabel('E-mail'),
            _textField(
              TextEditingController(text: profile.email),
              enabled: false,
            ),
            const SizedBox(height: 10),
            _fieldLabel('Telefone'),
            _textField(phoneController),
            const SizedBox(height: 10),
            _fieldLabel('Whatsapp'),
            _textField(whatsappController),
            const SizedBox(height: 12),
            _sheetSubHeader('Endereço de Residência'),
            _addressBlock(
              stateController: homeStateController,
              cityController: homeCityController,
              neighborhoodController: homeNeighborhoodController,
              streetController: homeStreetController,
              numberController: homeNumberController,
              cepController: homeCepController,
              complementController: homeComplementController,
            ),
            const SizedBox(height: 12),
            _sheetSubHeader('Endereço do Ponto'),
            _addressBlock(
              stateController: baseStateController,
              cityController: baseCityController,
              neighborhoodController: baseNeighborhoodController,
              streetController: baseStreetController,
              numberController: baseNumberController,
              cepController: baseCepController,
              complementController: baseComplementController,
            ),
          ],
        );
      },
      onSave: () async {
        final payload = <String, dynamic>{
          'name': nameController.text.trim(),
          if (phoneController.text.trim().isNotEmpty)
            'phone_number': phoneController.text.trim(),
          if (whatsappController.text.trim().isNotEmpty)
            'whatsapp': whatsappController.text.trim(),
          'address_home': _buildAddressPayload(
            state: homeStateController.text,
            city: homeCityController.text,
            neighborhood: homeNeighborhoodController.text,
            street: homeStreetController.text,
            number: homeNumberController.text,
            cep: homeCepController.text,
            complement: homeComplementController.text,
          ),
          'address_base': _buildAddressPayload(
            state: baseStateController.text,
            city: baseCityController.text,
            neighborhood: baseNeighborhoodController.text,
            street: baseStreetController.text,
            number: baseNumberController.text,
            cep: baseCepController.text,
            complement: baseComplementController.text,
          ),
        };

        await _patchProfile(payload);
      },
    );
  }

  Future<void> _openBankSheet(RiderProfileData profile) async {
    final bankController = TextEditingController(
      text: profile.bankAccount?.bank ?? '',
    );
    final agencyController = TextEditingController(
      text: profile.bankAccount?.agency ?? '',
    );
    final accountController = TextEditingController(
      text: profile.bankAccount?.account ?? '',
    );
    final pixController = TextEditingController(
      text: profile.bankAccount?.pixKey ?? '',
    );
    var accountType = profile.bankAccount?.accountType ?? 'corrente';

    await _showEditSheet(
      title: 'Conta Bancária',
      contentBuilder: (context, setModalState) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            _fieldLabel('Banco'),
            _textField(bankController),
            const SizedBox(height: 10),
            _fieldLabel('Agência'),
            _textField(agencyController),
            const SizedBox(height: 10),
            _fieldLabel('Conta'),
            _textField(accountController),
            const SizedBox(height: 10),
            _fieldLabel('Tipo de Conta'),
            DropdownButtonFormField<String>(
              initialValue: accountType,
              dropdownColor: const Color(0xFF111214),
              style: const TextStyle(color: Colors.white),
              decoration: _sheetFieldDecoration(),
              items: const <DropdownMenuItem<String>>[
                DropdownMenuItem<String>(
                  value: 'corrente',
                  child: Text('Corrente'),
                ),
                DropdownMenuItem<String>(
                  value: 'poupanca',
                  child: Text('Poupança'),
                ),
              ],
              onChanged: (value) {
                if (value == null) {
                  return;
                }
                setModalState(() {
                  accountType = value;
                });
              },
            ),
            const SizedBox(height: 10),
            _fieldLabel('Número do Pix'),
            _textField(pixController),
          ],
        );
      },
      onSave: () async {
        final payload = <String, dynamic>{
          'bank_account': <String, dynamic>{
            if (bankController.text.trim().isNotEmpty)
              'bank': bankController.text.trim(),
            if (agencyController.text.trim().isNotEmpty)
              'agency': agencyController.text.trim(),
            if (accountController.text.trim().isNotEmpty)
              'account': accountController.text.trim(),
            'account_type': accountType,
            if (pixController.text.trim().isNotEmpty)
              'pix_key': pixController.text.trim(),
          },
        };

        await _patchProfile(payload);
      },
    );
  }

  Future<void> _openVehicleSheet(RiderProfileData profile) async {
    var type = profile.vehicle?.type ?? 'moto';
    final brandController = TextEditingController(
      text: profile.vehicle?.brand ?? '',
    );
    final modelController = TextEditingController(
      text: profile.vehicle?.model ?? '',
    );
    final yearController = TextEditingController(
      text: profile.vehicle?.year?.toString() ?? '',
    );
    final plateController = TextEditingController(
      text: profile.vehicle?.plate ?? '',
    );

    await _showEditSheet(
      title: 'Veículos',
      contentBuilder: (context, setModalState) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            _fieldLabel('Tipo de Veículo'),
            DropdownButtonFormField<String>(
              initialValue: type,
              dropdownColor: const Color(0xFF111214),
              style: const TextStyle(color: Colors.white),
              decoration: _sheetFieldDecoration(),
              items: const <DropdownMenuItem<String>>[
                DropdownMenuItem<String>(
                  value: 'bicicleta',
                  child: Text('Bicicleta'),
                ),
                DropdownMenuItem<String>(value: 'moto', child: Text('Moto')),
                DropdownMenuItem<String>(value: 'carro', child: Text('Carro')),
              ],
              onChanged: (value) {
                if (value == null) {
                  return;
                }
                setModalState(() {
                  type = value;
                });
              },
            ),
            const SizedBox(height: 10),
            _fieldLabel('Marca'),
            _textField(brandController),
            const SizedBox(height: 10),
            _fieldLabel('Modelo'),
            _textField(modelController),
            const SizedBox(height: 10),
            _fieldLabel('Ano'),
            _textField(yearController, keyboardType: TextInputType.number),
            const SizedBox(height: 10),
            _fieldLabel('Placa'),
            _textField(plateController),
          ],
        );
      },
      onSave: () async {
        final yearValue = int.tryParse(yearController.text.trim());
        final vehiclePayload = <String, dynamic>{
          'type': type,
          if (brandController.text.trim().isNotEmpty)
            'brand': brandController.text.trim(),
          if (modelController.text.trim().isNotEmpty)
            'model': modelController.text.trim(),
          if (plateController.text.trim().isNotEmpty)
            'plate': plateController.text.trim(),
        };
        if (yearValue != null) {
          vehiclePayload['year'] = yearValue;
        }

        final payload = <String, dynamic>{'vehicle': vehiclePayload};

        await _patchProfile(payload);
      },
    );
  }

  Future<void> _openDocumentsSheet(RiderProfileData profile) async {
    await _showReadOnlySheet(
      title: 'Documentos',
      groups: const <_SheetGroupData>[
        _SheetGroupData(
          title: 'Identificação',
          items: <_SheetRowData>[
            _SheetRowData(key: 'RG', value: 'Validado'),
            _SheetRowData(key: 'CNH', value: 'Validada'),
            _SheetRowData(key: 'CPF', value: 'Regular'),
          ],
        ),
        _SheetGroupData(
          title: 'Comprovantes',
          items: <_SheetRowData>[
            _SheetRowData(key: 'Residência', value: 'Enviado'),
            _SheetRowData(key: 'Veículo', value: 'Enviado'),
          ],
        ),
      ],
    );
  }

  Future<void> _openSecuritySheet() async {
    await _showReadOnlySheet(
      title: 'Privacidade e Segurança',
      groups: const <_SheetGroupData>[
        _SheetGroupData(
          title: 'Acesso',
          items: <_SheetRowData>[
            _SheetRowData(key: 'Senha', value: 'Atualizada recentemente'),
            _SheetRowData(key: 'Autenticação 2FA', value: 'Ativa'),
            _SheetRowData(key: 'PIN de Segurança', value: 'Ativo'),
          ],
        ),
        _SheetGroupData(
          title: 'Permissões',
          items: <_SheetRowData>[
            _SheetRowData(key: 'Localização', value: 'Sempre durante entrega'),
            _SheetRowData(
              key: 'Compartilhamento',
              value: 'Somente operacional',
            ),
            _SheetRowData(key: 'Sessões Ativas', value: '2 dispositivos'),
          ],
        ),
      ],
    );
  }

  Future<void> _showReadOnlySheet({
    required String title,
    required List<_SheetGroupData> groups,
  }) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
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
              _sheetHandle(),
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 12),
              ...groups.map(_groupWidget),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Fechar'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _groupWidget(_SheetGroupData group) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            group.title,
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          ...group.items.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: <Widget>[
                  SizedBox(
                    width: 120,
                    child: Text(
                      item.key,
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Text(
                      item.value,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
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

  Future<void> _showEditSheet({
    required String title,
    required Widget Function(
      BuildContext context,
      void Function(void Function()) setModalState,
    )
    contentBuilder,
    required Future<void> Function() onSave,
  }) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0A0B0C),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        var submitting = false;
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(
                20,
                14,
                20,
                20 + MediaQuery.of(context).viewInsets.bottom,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    _sheetHandle(),
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 12),
                    contentBuilder(context, setModalState),
                    const SizedBox(height: 14),
                    Row(
                      children: <Widget>[
                        Expanded(
                          child: OutlinedButton(
                            onPressed: submitting
                                ? null
                                : () => Navigator.of(context).pop(),
                            child: const Text('Cancelar'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: submitting
                                ? null
                                : () async {
                                    setModalState(() {
                                      submitting = true;
                                    });
                                    await onSave();
                                    if (!context.mounted) {
                                      return;
                                    }
                                    setModalState(() {
                                      submitting = false;
                                    });
                                    Navigator.of(context).pop();
                                  },
                            child: Text(submitting ? 'Salvando...' : 'Salvar'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _sheetHandle() {
    return Center(
      child: Container(
        width: 42,
        height: 4,
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.2),
          borderRadius: BorderRadius.circular(999),
        ),
      ),
    );
  }

  Map<String, dynamic> _buildAddressPayload({
    required String state,
    required String city,
    required String neighborhood,
    required String street,
    required String number,
    required String cep,
    required String complement,
  }) {
    return <String, dynamic>{
      if (state.trim().isNotEmpty) 'state': state.trim(),
      if (city.trim().isNotEmpty) 'city': city.trim(),
      if (neighborhood.trim().isNotEmpty) 'neighborhood': neighborhood.trim(),
      if (street.trim().isNotEmpty) 'street': street.trim(),
      if (number.trim().isNotEmpty) 'number': number.trim(),
      if (cep.trim().isNotEmpty) 'cep': cep.trim(),
      if (complement.trim().isNotEmpty) 'complement': complement.trim(),
    };
  }

  Widget _fieldLabel(String text) {
    return Text(
      text,
      style: TextStyle(
        color: Colors.white.withValues(alpha: 0.72),
        fontSize: 11,
        fontWeight: FontWeight.w700,
      ),
    );
  }

  InputDecoration _sheetFieldDecoration() {
    return InputDecoration(
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      filled: true,
      fillColor: Colors.white.withValues(alpha: 0.06),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.14)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.3)),
      ),
    );
  }

  Widget _textField(
    TextEditingController controller, {
    bool enabled = true,
    TextInputType? keyboardType,
  }) {
    return TextField(
      controller: controller,
      enabled: enabled,
      keyboardType: keyboardType,
      style: TextStyle(
        color: enabled ? Colors.white : Colors.white.withValues(alpha: 0.6),
      ),
      decoration: _sheetFieldDecoration(),
    );
  }

  Widget _sheetSubHeader(String text) {
    return Text(
      text,
      style: const TextStyle(
        color: Color(0xFF67E8F9),
        fontSize: 12,
        fontWeight: FontWeight.w700,
      ),
    );
  }

  Widget _addressBlock({
    required TextEditingController stateController,
    required TextEditingController cityController,
    required TextEditingController neighborhoodController,
    required TextEditingController streetController,
    required TextEditingController numberController,
    required TextEditingController cepController,
    required TextEditingController complementController,
  }) {
    return Column(
      children: <Widget>[
        Row(
          children: <Widget>[
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  _fieldLabel('Estado'),
                  _textField(stateController),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  _fieldLabel('Cidade'),
                  _textField(cityController),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        _fieldLabel('Bairro'),
        _textField(neighborhoodController),
        const SizedBox(height: 8),
        _fieldLabel('Rua'),
        _textField(streetController),
        const SizedBox(height: 8),
        Row(
          children: <Widget>[
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  _fieldLabel('Número'),
                  _textField(numberController),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  _fieldLabel('CEP'),
                  _textField(cepController),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        _fieldLabel('Complemento'),
        _textField(complementController),
      ],
    );
  }

  Future<void> _logout() async {
    await ref.read(sessionControllerProvider.notifier).logout();
    if (!mounted) {
      return;
    }
    context.go(AppRoutes.login);
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

class _SheetGroupData {
  const _SheetGroupData({required this.title, required this.items});

  final String title;
  final List<_SheetRowData> items;
}

class _SheetRowData {
  const _SheetRowData({required this.key, required this.value});

  final String key;
  final String value;
}
