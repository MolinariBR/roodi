import '../navigation/app_routes.dart';

enum SessionStatus { unauthenticated, authenticated }

enum UserContext { rider, commerce }

class SessionState {
  const SessionState({required this.status, this.context});

  const SessionState.unauthenticated()
    : status = SessionStatus.unauthenticated,
      context = null;

  const SessionState.authenticated(this.context)
    : status = SessionStatus.authenticated;

  final SessionStatus status;
  final UserContext? context;

  String get homeRoute {
    if (context == UserContext.commerce) {
      return AppRoutes.commerceHome;
    }

    return AppRoutes.riderHome;
  }
}
