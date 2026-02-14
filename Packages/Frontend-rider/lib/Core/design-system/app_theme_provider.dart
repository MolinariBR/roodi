import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'App_Theme.dart';
import 'theme-mode/theme_mode_controller.dart';

final appThemeModeProvider = Provider<ThemeMode>((ref) {
  final themeModeAsync = ref.watch(themeModeControllerProvider);
  return themeModeAsync.maybeWhen(
    data: (themeMode) => themeMode,
    orElse: () => AppTheme.defaultThemeMode,
  );
});
