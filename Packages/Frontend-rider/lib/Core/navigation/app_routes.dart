class AppRoutes {
  const AppRoutes._();

  static const splash = '/splash';
  static const login = '/login';
  static const register = '/register';
  static const forgotPassword = '/forgot-password';
  static const otp = '/otp';
  static const resetPassword = '/reset-password';

  static const riderHome = '/rider/home';
  static const commerceHome = '/commerce/home';
  static const notifications = '/notifications';
  static const support = '/support';

  static const authRoutes = <String>{
    splash,
    login,
    register,
    forgotPassword,
    otp,
    resetPassword,
  };

  static const protectedRoutes = <String>{
    riderHome,
    commerceHome,
    notifications,
    support,
  };

  static bool isAuthRoute(String path) => authRoutes.contains(path);

  static bool isProtectedRoute(String path) {
    if (protectedRoutes.contains(path)) {
      return true;
    }

    return path.startsWith('/rider/') || path.startsWith('/commerce/');
  }
}
