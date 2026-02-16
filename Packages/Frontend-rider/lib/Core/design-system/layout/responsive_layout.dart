import 'package:flutter/widgets.dart';

double pageHorizontalPaddingForWidth(double width) {
  if (width >= 1024) {
    return 24;
  }
  if (width >= 768) {
    return 20;
  }
  if (width >= 360) {
    return 16;
  }
  return 12;
}

double pageMaxContentWidthForWidth(double width) {
  if (width >= 1280) {
    return 960;
  }
  if (width >= 1024) {
    return 840;
  }
  if (width >= 768) {
    return 680;
  }
  if (width >= 600) {
    return 560;
  }
  return width;
}

EdgeInsets pageListPaddingForWidth(
  double width, {
  double top = 8,
  double bottom = 18,
}) {
  final horizontal = pageHorizontalPaddingForWidth(width);
  return EdgeInsets.fromLTRB(horizontal, top, horizontal, bottom);
}
