// ignore_for_file: file_names

import 'package:flutter/material.dart';

import 'themes/app_dark_theme.dart';
import 'themes/app_light_theme.dart';

class AppTheme {
  const AppTheme._();

  static const ThemeMode defaultThemeMode = ThemeMode.system;

  static ThemeData get lightTheme => AppLightTheme.theme;

  static ThemeData get darkTheme => AppDarkTheme.theme;
}
