import 'package:flutter_test/flutter_test.dart';

import 'package:frontend_rider/Core/app-shell/roodi_app.dart';

void main() {
  testWidgets('app inicia na splash', (WidgetTester tester) async {
    await tester.pumpWidget(const RoodiAppBootstrap());
    await tester.pumpAndSettle();

    expect(find.text('Roodi'), findsOneWidget);
    expect(find.text('Continuar'), findsOneWidget);
  });
}
