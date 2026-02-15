import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../Modules/auth/infra/auth_repository.dart';
import 'session_storage.dart';
import 'session_state.dart';

final sessionControllerProvider =
    AsyncNotifierProvider<SessionController, SessionState>(
      SessionController.new,
    );

final sessionStorageProvider = Provider<SessionStorage>((ref) {
  return SessionStorage();
});

class SessionController extends AsyncNotifier<SessionState> {
  @override
  Future<SessionState> build() async {
    final storage = ref.read(sessionStorageProvider);
    final authRepository = ref.read(authRepositoryProvider);

    final snapshot = await storage.read();
    final storedTokens = await authRepository.readStoredTokens();

    if (snapshot.userContext == null || storedTokens == null) {
      return SessionState.unauthenticated(
        onboardingCompleted: snapshot.onboardingCompleted,
      );
    }

    return SessionState.authenticated(
      snapshot.userContext,
      onboardingCompleted: snapshot.onboardingCompleted,
    );
  }

  Future<void> completeOnboarding() async {
    final currentState =
        state.valueOrNull ??
        const SessionState.unauthenticated(onboardingCompleted: false);
    final storage = ref.read(sessionStorageProvider);

    await storage.writeOnboardingCompleted(true);

    state = AsyncData(currentState.copyWith(onboardingCompleted: true));
  }

  Future<void> signIn({
    required String email,
    required String password,
    required UserContext context,
  }) async {
    final authRepository = ref.read(authRepositoryProvider);
    final storage = ref.read(sessionStorageProvider);
    final currentState =
        state.valueOrNull ??
        const SessionState.unauthenticated(onboardingCompleted: false);

    state = const AsyncLoading<SessionState>().copyWithPrevious(state);

    try {
      await authRepository.login(
        email: email,
        password: password,
        context: context,
      );
      await storage.writeOnboardingCompleted(true);
      await storage.writeUserContext(context);

      state = AsyncData(
        SessionState.authenticated(context, onboardingCompleted: true),
      );
    } catch (error, stackTrace) {
      state = AsyncError<SessionState>(
        error,
        stackTrace,
      ).copyWithPrevious(AsyncData(currentState));
      rethrow;
    }
  }

  Future<void> signUp({
    required String name,
    required String email,
    required String password,
    required UserContext context,
    String? phoneNumber,
  }) async {
    final authRepository = ref.read(authRepositoryProvider);
    final storage = ref.read(sessionStorageProvider);
    final currentState =
        state.valueOrNull ??
        const SessionState.unauthenticated(onboardingCompleted: false);

    state = const AsyncLoading<SessionState>().copyWithPrevious(state);

    try {
      await authRepository.register(
        name: name,
        email: email,
        password: password,
        context: context,
        phoneNumber: phoneNumber,
      );
      await storage.writeOnboardingCompleted(true);
      await storage.writeUserContext(context);

      state = AsyncData(
        SessionState.authenticated(context, onboardingCompleted: true),
      );
    } catch (error, stackTrace) {
      state = AsyncError<SessionState>(
        error,
        stackTrace,
      ).copyWithPrevious(AsyncData(currentState));
      rethrow;
    }
  }

  Future<void> logout() async {
    final authRepository = ref.read(authRepositoryProvider);
    final storage = ref.read(sessionStorageProvider);
    final currentState =
        state.valueOrNull ??
        const SessionState.unauthenticated(onboardingCompleted: false);

    await authRepository.logout();
    await storage.clearUserContext();

    state = AsyncData(
      SessionState.unauthenticated(
        onboardingCompleted: currentState.onboardingCompleted,
      ),
    );
  }
}
