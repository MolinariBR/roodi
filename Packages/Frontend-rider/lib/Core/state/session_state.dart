import '../navigation/app_routes.dart';

enum SessionStatus { unauthenticated, authenticated }

enum UserContext { rider, commerce }

class SessionState {
  const SessionState({
    required this.status,
    required this.onboardingCompleted,
    this.context,
  });

  const SessionState.unauthenticated({required this.onboardingCompleted})
    : status = SessionStatus.unauthenticated,
      context = null;

  const SessionState.authenticated(
    this.context, {
    required this.onboardingCompleted,
  }) : status = SessionStatus.authenticated;

  final SessionStatus status;
  final UserContext? context;
  final bool onboardingCompleted;

  bool get isAuthenticated =>
      status == SessionStatus.authenticated && context != null;

  SessionState copyWith({
    SessionStatus? status,
    UserContext? context,
    bool clearContext = false,
    bool? onboardingCompleted,
  }) {
    return SessionState(
      status: status ?? this.status,
      context: clearContext ? null : context ?? this.context,
      onboardingCompleted: onboardingCompleted ?? this.onboardingCompleted,
    );
  }

  String get homeRoute {
    if (context == UserContext.commerce) {
      return AppRoutes.commerceHome;
    }

    return AppRoutes.riderHome;
  }
}
