import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'theme_mode_storage.dart';

final themeModeStorageProvider = Provider<ThemeModeStorage>((ref) {
  return ThemeModeStorage();
});

final themeModeControllerProvider =
    AsyncNotifierProvider<ThemeModeController, ThemeMode>(
      ThemeModeController.new,
    );

class ThemeModeController extends AsyncNotifier<ThemeMode> {
  @override
  Future<ThemeMode> build() async {
    final storage = ref.read(themeModeStorageProvider);
    return storage.read();
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    final storage = ref.read(themeModeStorageProvider);
    await storage.write(mode);
    state = AsyncData(mode);
  }
}
