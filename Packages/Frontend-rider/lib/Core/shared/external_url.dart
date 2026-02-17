import 'package:url_launcher/url_launcher.dart';

Future<bool> openExternalUrl(String url, {bool preferInApp = true}) async {
  final normalized = url.trim();
  if (normalized.isEmpty) {
    return false;
  }

  final uri = Uri.tryParse(normalized);
  if (uri == null) {
    return false;
  }

  try {
    if (preferInApp) {
      final inAppOk = await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
      if (inAppOk) {
        return true;
      }
    }
    return await launchUrl(uri, mode: LaunchMode.externalApplication);
  } catch (_) {
    return false;
  }
}
