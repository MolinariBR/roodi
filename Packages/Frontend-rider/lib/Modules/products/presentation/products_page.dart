import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/navigation/app_routes.dart';
import '../application/products_controller.dart';
import '../domain/product_models.dart';

enum _ProductFilter { all, snacks, drinks, desserts, lowStock, inactive }

class ProductsPage extends ConsumerStatefulWidget {
  const ProductsPage({super.key});

  @override
  ConsumerState<ProductsPage> createState() => _ProductsPageState();
}

class _ProductsPageState extends ConsumerState<ProductsPage> {
  final TextEditingController _searchController = TextEditingController();
  _ProductFilter _filter = _ProductFilter.all;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final products = ref.watch(productsControllerProvider);
    final filtered = _filteredProducts(products);
    final activeCount = products.where((item) => item.isActive).length;
    final lowStockCount = products.where((item) => item.lowStock).length;
    final featuredCount = products.where((item) => item.sales >= 80).length;

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
              'Produtos',
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
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 18),
          children: <Widget>[
            _buildHeaderCard(
              activeCount: activeCount,
              lowStockCount: lowStockCount,
              featuredCount: featuredCount,
            ),
            const SizedBox(height: 14),
            _buildFilterCard(),
            const SizedBox(height: 14),
            _buildSectionHeader(),
            const SizedBox(height: 8),
            if (filtered.isEmpty)
              _emptyCard('Nenhum produto encontrado para o filtro atual.')
            else
              ...filtered.map(_productCard),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderCard({
    required int activeCount,
    required int lowStockCount,
    required int featuredCount,
  }) {
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
                  'Catálogo ativo',
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
                onPressed: _openNewProductSheet,
                child: const Text(
                  'Novo produto',
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
                  icon: Icons.inventory_2_outlined,
                  iconColor: const Color(0xFF86EFAC),
                  label: 'Ativos',
                  value: '$activeCount',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _metricCard(
                  icon: Icons.warning_amber_rounded,
                  iconColor: const Color(0xFFFCD34D),
                  label: 'Estoque',
                  value: '$lowStockCount',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _metricCard(
                  icon: Icons.sell_outlined,
                  iconColor: const Color(0xFF67E8F9),
                  label: 'Destaque',
                  value: '$featuredCount',
                ),
              ),
            ],
          ),
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
          const Text(
            'Busca e Filtros',
            style: TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _searchController,
            onChanged: (_) => setState(() {}),
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Nome, SKU ou categoria',
              hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
              prefixIcon: const Icon(
                Icons.search_rounded,
                color: Color(0xFF94A3B8),
              ),
              filled: true,
              fillColor: Colors.white.withValues(alpha: 0.03),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(
                  color: Colors.white.withValues(alpha: 0.1),
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(
                  color: Colors.white.withValues(alpha: 0.1),
                ),
              ),
              focusedBorder: const OutlineInputBorder(
                borderRadius: BorderRadius.all(Radius.circular(10)),
                borderSide: BorderSide(color: Color(0xFF19B3E6)),
              ),
            ),
          ),
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _ProductFilter.values
                  .map(
                    (value) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: _filterChip(
                        value: value,
                        label: _filterLabel(value),
                      ),
                    ),
                  )
                  .toList(growable: false),
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip({required _ProductFilter value, required String label}) {
    final active = _filter == value;
    return OutlinedButton(
      onPressed: () {
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

  Widget _buildSectionHeader() {
    return Row(
      children: <Widget>[
        const Text(
          'Itens do Catálogo',
          style: TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
        const Spacer(),
        TextButton(
          onPressed: _openNewProductSheet,
          child: const Text(
            'Adicionar',
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

  Widget _productCard(CommerceProductData product) {
    final statusColor = product.isActive
        ? const Color(0xFF86EFAC)
        : const Color(0xFFFCA5A5);
    final statusLabel = product.isActive
        ? (product.lowStock ? 'Baixo estoque' : 'Ativo')
        : 'Inativo';

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
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      product.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      '${product.category} • SKU ${product.sku}',
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
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
                  statusLabel,
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
          Row(
            children: <Widget>[
              Expanded(
                child: _miniInfo('Preço', _formatCurrency(product.priceBrl)),
              ),
              const SizedBox(width: 8),
              Expanded(child: _miniInfo('Estoque', '${product.stock} un')),
              const SizedBox(width: 8),
              Expanded(child: _miniInfo('Vendas', '${product.sales}')),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: <Widget>[
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _openEditProductSheet(product),
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
                    'Editar',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => ref
                      .read(productsControllerProvider.notifier)
                      .toggleStatus(product.id),
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size.fromHeight(40),
                    elevation: 0,
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: Text(
                    product.isActive ? 'Pausar' : 'Ativar',
                    style: const TextStyle(
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

  Widget _miniInfo(String label, String value) {
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
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
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

  List<CommerceProductData> _filteredProducts(
    List<CommerceProductData> products,
  ) {
    final query = _searchController.text.trim().toLowerCase();

    Iterable<CommerceProductData> items = products;
    if (query.isNotEmpty) {
      items = items.where((item) {
        return item.name.toLowerCase().contains(query) ||
            item.category.toLowerCase().contains(query) ||
            item.sku.toLowerCase().contains(query);
      });
    }

    switch (_filter) {
      case _ProductFilter.all:
        break;
      case _ProductFilter.snacks:
        items = items.where((item) => item.category == 'Lanches');
        break;
      case _ProductFilter.drinks:
        items = items.where((item) => item.category == 'Bebidas');
        break;
      case _ProductFilter.desserts:
        items = items.where((item) => item.category == 'Sobremesas');
        break;
      case _ProductFilter.lowStock:
        items = items.where((item) => item.lowStock || item.outOfStock);
        break;
      case _ProductFilter.inactive:
        items = items.where((item) => !item.isActive);
        break;
    }

    return items.toList(growable: false);
  }

  String _filterLabel(_ProductFilter filter) {
    switch (filter) {
      case _ProductFilter.all:
        return 'Todos';
      case _ProductFilter.snacks:
        return 'Lanches';
      case _ProductFilter.drinks:
        return 'Bebidas';
      case _ProductFilter.desserts:
        return 'Sobremesas';
      case _ProductFilter.lowStock:
        return 'Sem estoque';
      case _ProductFilter.inactive:
        return 'Inativos';
    }
  }

  Future<void> _openNewProductSheet() async {
    await _openProductSheet();
  }

  Future<void> _openEditProductSheet(CommerceProductData product) async {
    await _openProductSheet(product: product);
  }

  Future<void> _openProductSheet({CommerceProductData? product}) async {
    final nameController = TextEditingController(text: product?.name ?? '');
    final categoryController = TextEditingController(
      text: product?.category ?? '',
    );
    final skuController = TextEditingController(text: product?.sku ?? '');
    final priceController = TextEditingController(
      text: product == null ? '' : product.priceBrl.toStringAsFixed(2),
    );
    final stockController = TextEditingController(
      text: product == null ? '' : '${product.stock}',
    );

    final created = await showModalBottomSheet<bool>(
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
              Text(
                product == null ? 'Novo produto' : 'Editar produto',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 10),
              _sheetField(nameController, 'Nome'),
              const SizedBox(height: 8),
              _sheetField(categoryController, 'Categoria'),
              const SizedBox(height: 8),
              _sheetField(skuController, 'SKU'),
              const SizedBox(height: 8),
              _sheetField(
                priceController,
                'Preço',
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 8),
              _sheetField(
                stockController,
                'Estoque',
                keyboardType: TextInputType.number,
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
                        if (nameController.text.trim().isEmpty ||
                            categoryController.text.trim().isEmpty ||
                            skuController.text.trim().isEmpty) {
                          return;
                        }
                        Navigator.of(context).pop(true);
                      },
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

    if (created == true && product == null) {
      final price = double.tryParse(priceController.text.trim()) ?? 0;
      final stock = int.tryParse(stockController.text.trim()) ?? 0;
      ref
          .read(productsControllerProvider.notifier)
          .addProduct(
            CommerceProductData(
              id: 'prd_${DateTime.now().millisecondsSinceEpoch}',
              name: nameController.text.trim(),
              category: categoryController.text.trim(),
              sku: skuController.text.trim(),
              priceBrl: price,
              stock: stock,
              sales: 0,
              isActive: true,
            ),
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Produto adicionado com sucesso.')),
        );
      }
    }

    nameController.dispose();
    categoryController.dispose();
    skuController.dispose();
    priceController.dispose();
    stockController.dispose();
  }

  Widget _sheetField(
    TextEditingController controller,
    String hint, {
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
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

  String _formatCurrency(double value) {
    final normalized = value.toStringAsFixed(2).replaceAll('.', ',');
    return 'R\$ $normalized';
  }
}
