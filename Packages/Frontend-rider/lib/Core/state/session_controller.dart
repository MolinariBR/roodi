import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'session_state.dart';

final sessionControllerProvider =
    NotifierProvider<SessionController, SessionState>(SessionController.new);

class SessionController extends Notifier<SessionState> {
  @override
  SessionState build() => const SessionState.unauthenticated();

  void loginAsRider() {
    state = const SessionState.authenticated(UserContext.rider);
  }

  void loginAsCommerce() {
    state = const SessionState.authenticated(UserContext.commerce);
  }

  void logout() {
    state = const SessionState.unauthenticated();
  }
}
