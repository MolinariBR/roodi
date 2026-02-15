import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../Core/api-client/api_error_parser.dart';
import '../../../Core/navigation/app_routes.dart';
import '../../../Core/state/session_controller.dart';
import '../../../Core/state/session_state.dart';
import '../infra/notifications_repository.dart';

class NotificationsPage extends ConsumerStatefulWidget {
  const NotificationsPage({super.key});

  @override
  ConsumerState<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends ConsumerState<NotificationsPage> {
  bool _isLoading = true;
  bool _isMarkingAll = false;
  String? _errorMessage;
  NotificationReadFilter _filter = NotificationReadFilter.all;
  NotificationsPageData? _pageData;

  @override
  void initState() {
    super.initState();
    Future<void>.microtask(_loadNotifications);
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(sessionControllerProvider).valueOrNull;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
        titleSpacing: 0,
        leading: IconButton(
          onPressed: () => _goBack(session),
          icon: const Icon(Icons.arrow_back_rounded),
        ),
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              'Central',
              style: TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
              ),
            ),
            Text(
              'Notificacoes',
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
            onPressed: _isMarkingAll || _isLoading ? null : _markAllAsRead,
            icon: _isMarkingAll
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.done_all_rounded),
          ),
        ],
      ),
      body: SafeArea(
        top: false,
        child: RefreshIndicator(
          onRefresh: _loadNotifications,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
            children: <Widget>[
              _buildSummaryCard(),
              const SizedBox(height: 12),
              _buildFilterBar(),
              const SizedBox(height: 12),
              if (_isLoading)
                const Padding(
                  padding: EdgeInsets.only(top: 36),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (_errorMessage != null)
                _buildErrorState()
              else
                ..._buildNotificationItems(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryCard() {
    final items = _pageData?.items ?? const <AppNotification>[];
    final total = _pageData?.pagination.total ?? items.length;
    final unread = items.where((item) => !item.read).length;
    final read = items.where((item) => item.read).length;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
      ),
      child: Row(
        children: <Widget>[
          Expanded(child: _summaryMetric('Total', '$total')),
          const SizedBox(width: 8),
          Expanded(child: _summaryMetric('Novas', '$unread')),
          const SizedBox(width: 8),
          Expanded(child: _summaryMetric('Lidas', '$read')),
        ],
      ),
    );
  }

  Widget _summaryMetric(String label, String value) {
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
            style: const TextStyle(
              color: Colors.white,
              fontSize: 17,
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
              letterSpacing: 1.0,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterBar() {
    return Row(
      children: <Widget>[
        Expanded(
          child: _filterChip(label: 'Todas', value: NotificationReadFilter.all),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _filterChip(
            label: 'Novas',
            value: NotificationReadFilter.unread,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _filterChip(
            label: 'Lidas',
            value: NotificationReadFilter.read,
          ),
        ),
      ],
    );
  }

  Widget _filterChip({
    required String label,
    required NotificationReadFilter value,
  }) {
    final isSelected = _filter == value;

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
              _loadNotifications();
            },
      style: OutlinedButton.styleFrom(
        minimumSize: const Size.fromHeight(40),
        side: BorderSide(
          color: isSelected
              ? const Color(0xFF19B3E6)
              : Colors.white.withValues(alpha: 0.16),
        ),
        backgroundColor: isSelected
            ? const Color(0x3319B3E6)
            : Colors.white.withValues(alpha: 0.04),
        foregroundColor: isSelected ? const Color(0xFF67E8F9) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      child: Text(
        label,
        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
      ),
    );
  }

  Widget _buildErrorState() {
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
            'Falha ao carregar notificacoes',
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
            onPressed: _loadNotifications,
            icon: const Icon(Icons.refresh_rounded, size: 18),
            label: const Text('Tentar novamente'),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildNotificationItems() {
    final items = _pageData?.items ?? const <AppNotification>[];
    if (items.isEmpty) {
      return <Widget>[
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.04),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
          ),
          child: const Text(
            'Nenhuma notificacao encontrada para este filtro.',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ];
    }

    return items.map(_buildNotificationCard).toList(growable: false);
  }

  Widget _buildNotificationCard(AppNotification item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: item.read
            ? Colors.white.withValues(alpha: 0.03)
            : const Color(0x2219B3E6),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: item.read
              ? Colors.white.withValues(alpha: 0.1)
              : const Color(0x4419B3E6),
        ),
      ),
      child: ListTile(
        onTap: () => _markAsRead(item),
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: item.read ? Colors.white12 : const Color(0x3319B3E6),
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Icon(
            item.read
                ? Icons.notifications_none_rounded
                : Icons.notifications_rounded,
            color: item.read
                ? const Color(0xFF94A3B8)
                : const Color(0xFF67E8F9),
          ),
        ),
        title: Text(
          item.title,
          style: TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: item.read ? FontWeight.w600 : FontWeight.w700,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 2),
          child: Text(
            item.body,
            style: const TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: <Widget>[
            Text(
              _timeAgo(item.createdAt),
              style: const TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 10,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
              decoration: BoxDecoration(
                color: item.read ? Colors.white10 : const Color(0x3319B3E6),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                item.read ? 'Lida' : 'Nova',
                style: TextStyle(
                  color: item.read
                      ? const Color(0xFFCBD5E1)
                      : const Color(0xFF67E8F9),
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

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final data = await ref
          .read(notificationsRepositoryProvider)
          .list(filter: _filter);

      if (!mounted) {
        return;
      }

      setState(() {
        _pageData = data;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _errorMessage = mapApiErrorMessage(
          error,
          fallbackMessage: 'Nao foi possivel carregar notificacoes.',
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

  Future<void> _markAsRead(AppNotification item) async {
    if (item.read) {
      return;
    }

    try {
      final updated = await ref
          .read(notificationsRepositoryProvider)
          .markAsRead(item.id);

      final currentData = _pageData;
      if (!mounted || currentData == null) {
        return;
      }

      final nextItems = currentData.items
          .map((existing) {
            if (existing.id == updated.id) {
              return updated;
            }
            return existing;
          })
          .toList(growable: false);

      setState(() {
        _pageData = NotificationsPageData(
          items: nextItems,
          pagination: currentData.pagination,
        );
      });
    } catch (_) {
      // Mantem UX silenciosa para evento individual.
    }
  }

  Future<void> _markAllAsRead() async {
    setState(() {
      _isMarkingAll = true;
    });

    try {
      await ref.read(notificationsRepositoryProvider).markAllAsRead();

      final currentData = _pageData;
      if (!mounted || currentData == null) {
        return;
      }

      final nextItems = currentData.items
          .map((item) {
            if (item.read) {
              return item;
            }
            return AppNotification(
              id: item.id,
              title: item.title,
              body: item.body,
              read: true,
              createdAt: item.createdAt,
              data: item.data,
            );
          })
          .toList(growable: false);

      setState(() {
        _pageData = NotificationsPageData(
          items: nextItems,
          pagination: currentData.pagination,
        );
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            mapApiErrorMessage(
              error,
              fallbackMessage: 'Falha ao marcar notificacoes como lidas.',
            ),
          ),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isMarkingAll = false;
        });
      }
    }
  }

  void _goBack(SessionState? session) {
    final target = session?.context == UserContext.commerce
        ? AppRoutes.commerceHome
        : AppRoutes.riderHome;
    context.go(target);
  }

  String _timeAgo(DateTime value) {
    final difference = DateTime.now().difference(value);
    if (difference.inMinutes < 1) {
      return 'Agora';
    }
    if (difference.inHours < 1) {
      return '${difference.inMinutes} min';
    }
    if (difference.inDays < 1) {
      return '${difference.inHours} h';
    }
    if (difference.inDays == 1) {
      return 'Ontem';
    }
    return '${difference.inDays} dias';
  }
}
