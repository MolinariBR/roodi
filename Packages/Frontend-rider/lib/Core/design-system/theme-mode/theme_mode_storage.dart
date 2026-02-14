import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'theme_mode_resolver.dart';

class ThemeModeStorage {
  ThemeModeStorage({ThemeModeResolver? resolver})
    : _resolver = resolver ?? const ThemeModeResolver();

  static const _themeModeKey = 'roodi.theme_mode';

  final ThemeModeResolver _resolver;

  Future<ThemeMode> read() async {
    final prefs = await SharedPreferences.getInstance();
    final mode = prefs.getString(_themeModeKey);
    return _resolver.fromStorage(mode);
  }

  Future<void> write(ThemeMode mode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeModeKey, _resolver.toStorage(mode));
  }
}
