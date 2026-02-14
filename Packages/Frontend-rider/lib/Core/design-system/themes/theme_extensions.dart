import 'package:flutter/material.dart';

@immutable
class SurfaceColors extends ThemeExtension<SurfaceColors> {
  const SurfaceColors({
    required this.surface,
    required this.surfaceAlt,
    required this.border,
    required this.muted,
  });

  final Color surface;
  final Color surfaceAlt;
  final Color border;
  final Color muted;

  @override
  ThemeExtension<SurfaceColors> copyWith({
    Color? surface,
    Color? surfaceAlt,
    Color? border,
    Color? muted,
  }) {
    return SurfaceColors(
      surface: surface ?? this.surface,
      surfaceAlt: surfaceAlt ?? this.surfaceAlt,
      border: border ?? this.border,
      muted: muted ?? this.muted,
    );
  }

  @override
  ThemeExtension<SurfaceColors> lerp(
    covariant ThemeExtension<SurfaceColors>? other,
    double t,
  ) {
    if (other is! SurfaceColors) {
      return this;
    }

    return SurfaceColors(
      surface: Color.lerp(surface, other.surface, t) ?? surface,
      surfaceAlt: Color.lerp(surfaceAlt, other.surfaceAlt, t) ?? surfaceAlt,
      border: Color.lerp(border, other.border, t) ?? border,
      muted: Color.lerp(muted, other.muted, t) ?? muted,
    );
  }
}
