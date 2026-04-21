import 'package:flutter_test/flutter_test.dart';

import 'package:notiving/main.dart';

void main() {
  testWidgets('App renders welcome text', (WidgetTester tester) async {
    await tester.pumpWidget(const NotivingApp());
    expect(find.text('Welcome to Notiving'), findsOneWidget);
  });
}
