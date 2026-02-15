import 'package:shared_preferences/shared_preferences.dart';

import 'session_state.dart';

class SessionStorageSnapshot {
  const SessionStorageSnapshot({
    required this.onboardingCompleted,
    required this.userContext,
  });

  final bool onboardingCompleted;
  final UserContext? userContext;
}

class SessionStorage {
  SessionStorage();

  static const _onboardingCompletedKey = 'roodi.onboarding_completed';
  static const _userContextKey = 'roodi.user_context';

  Future<SessionStorageSnapshot> read() async {
    final prefs = await SharedPreferences.getInstance();
    final onboardingCompleted = prefs.getBool(_onboardingCompletedKey) ?? false;
    final rawContext = prefs.getString(_userContextKey);

    return SessionStorageSnapshot(
      onboardingCompleted: onboardingCompleted,
      userContext: _contextFromStorage(rawContext),
    );
  }

  Future<void> writeOnboardingCompleted(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_onboardingCompletedKey, value);
  }

  Future<void> writeUserContext(UserContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userContextKey, _contextToStorage(context));
  }

  Future<void> clearUserContext() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_userContextKey);
  }

  String _contextToStorage(UserContext context) {
    switch (context) {
      case UserContext.rider:
        return 'rider';
      case UserContext.commerce:
        return 'commerce';
    }
  }

  UserContext? _contextFromStorage(String? value) {
    switch (value) {
      case 'rider':
        return UserContext.rider;
      case 'commerce':
        return UserContext.commerce;
      default:
        return null;
    }
  }
}
