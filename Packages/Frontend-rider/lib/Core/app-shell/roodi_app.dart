import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../design-system/App_Theme.dart';
import '../design-system/app_theme_provider.dart';
import '../navigation/app_router.dart';

class RoodiAppBootstrap extends StatelessWidget {
  const RoodiAppBootstrap({super.key});

  @override
  Widget build(BuildContext context) {
    return const ProviderScope(child: RoodiApp());
  }
}

class RoodiApp extends ConsumerWidget {
  const RoodiApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final themeMode = ref.watch(appThemeModeProvider);

    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Roodi',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      routerConfig: router,
    );
  }
}
