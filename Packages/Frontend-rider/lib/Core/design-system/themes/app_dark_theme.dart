import 'package:flutter/material.dart';

import '../tokens/color_tokens.dart';
import '../tokens/elevation_tokens.dart';
import '../tokens/radius_tokens.dart';
import '../tokens/typography_tokens.dart';
import 'theme_extensions.dart';

class AppDarkTheme {
  const AppDarkTheme._();

  static ThemeData get theme {
    final colorScheme = const ColorScheme.dark(
      primary: ColorTokens.primary,
      secondary: ColorTokens.secondary,
      surface: ColorTokens.darkSurface,
      error: ColorTokens.danger,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: ColorTokens.darkText,
      onError: Colors.white,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: ColorTokens.darkBackground,
      extensions: const <ThemeExtension<dynamic>>[
        SurfaceColors(
          surface: ColorTokens.darkSurface,
          surfaceAlt: ColorTokens.darkSurfaceAlt,
          border: ColorTokens.darkBorder,
          muted: ColorTokens.darkMuted,
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
        elevation: ElevationTokens.none,
        color: ColorTokens.darkSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(RadiusTokens.lg),
          side: const BorderSide(color: ColorTokens.darkBorder),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: ColorTokens.darkSurfaceAlt,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(RadiusTokens.md),
          borderSide: const BorderSide(color: ColorTokens.darkBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(RadiusTokens.md),
          borderSide: const BorderSide(color: ColorTokens.darkBorder),
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
