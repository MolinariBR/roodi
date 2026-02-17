import '../navigation/app_routes.dart';

String buildInfinitePayRedirectUrlForOrderTracking(String orderId) {
  final uri = Uri(
    scheme: 'roodi',
    host: 'checkout',
    path: AppRoutes.commerceTrackingByOrderId(orderId),
    queryParameters: const <String, String>{'payment_return': '1'},
  );

  return uri.toString();
}
