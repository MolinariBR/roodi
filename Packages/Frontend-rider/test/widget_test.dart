import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:frontend_rider/Core/app-shell/roodi_app.dart';

void main() {
  testWidgets('app inicia na splash', (WidgetTester tester) async {
    await tester.pumpWidget(const RoodiAppBootstrap());
    await tester.pump();

    expect(find.text('ROODI'), findsOneWidget);
    expect(find.byType(LinearProgressIndicator), findsOneWidget);
  });
}
