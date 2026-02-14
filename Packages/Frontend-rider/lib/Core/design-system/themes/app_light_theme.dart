import 'package:flutter/material.dart';

import '../tokens/color_tokens.dart';
import '../tokens/elevation_tokens.dart';
import '../tokens/radius_tokens.dart';
import '../tokens/typography_tokens.dart';
import 'theme_extensions.dart';

class AppLightTheme {
  const AppLightTheme._();

  static ThemeData get theme {
    final colorScheme = const ColorScheme.light(
      primary: ColorTokens.primary,
      secondary: ColorTokens.secondary,
      surface: ColorTokens.lightSurface,
      error: ColorTokens.danger,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: ColorTokens.lightText,
      onError: Colors.white,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: ColorTokens.lightBackground,
      extensions: const <ThemeExtension<dynamic>>[
        SurfaceColors(
          surface: ColorTokens.lightSurface,
          surfaceAlt: ColorTokens.lightSurfaceAlt,
          border: ColorTokens.lightBorder,
          muted: ColorTokens.lightMuted,
        ),
      ],
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
          fontSize: TypographyTokens.headline,
          fontWeight: FontWeight.w700,
        ),
        titleLarge: TextStyle(
          fontSize: TypographyTokens.title,
          fontWeight: FontWeight.w700,
        ),
        bodyLarge: TextStyle(
          fontSize: TypographyTokens.bodyLarge,
          fontWeight: FontWeight.w500,
        ),
        bodyMedium: TextStyle(
          fontSize: TypographyTokens.body,
          fontWeight: FontWeight.w500,
        ),
        labelLarge: TextStyle(
          fontSize: TypographyTokens.label,
          fontWeight: FontWeight.w600,
        ),
      ),
      cardTheme: CardThemeData(
        elevation: ElevationTokens.sm,
        color: ColorTokens.lightSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(RadiusTokens.lg),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: ColorTokens.lightSurface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(RadiusTokens.md),
          borderSide: const BorderSide(color: ColorTokens.lightBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(RadiusTokens.md),
          borderSide: const BorderSide(color: ColorTokens.lightBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(RadiusTokens.md),
          borderSide: const BorderSide(color: ColorTokens.primary),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(RadiusTokens.md),
          ),
        ),
      ),
    );
  }
}
