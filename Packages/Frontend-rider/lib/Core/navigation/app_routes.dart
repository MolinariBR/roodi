class AppRoutes {
  const AppRoutes._();

  static const splash = '/splash';
  static const onboarding1 = '/onboarding/1';
  static const onboarding2 = '/onboarding/2';
  static const onboarding3 = '/onboarding/3';
  static const login = '/login';
  static const register = '/register';
  static const forgotPassword = '/forgot-password';
  static const otp = '/otp';
  static const resetPassword = '/reset-password';
  static const error = '/error';
  static const maintenance = '/maintenance';
  static const update = '/update';

  static const riderHome = '/rider/home';
  static const riderOrders = '/rider/orders';
  static const riderProfile = '/rider/profile';
  static const commerceHome = '/commerce/home';
  static const notifications = '/notifications';
  static const support = '/support';

  static const authRoutes = <String>{
    login,
    register,
    forgotPassword,
    otp,
    resetPassword,
  };

  static const systemRoutes = <String>{splash, error, maintenance, update};

  static const protectedRoutes = <String>{
    riderHome,
    riderOrders,
    riderProfile,
    commerceHome,
    notifications,
    support,
  };

  static bool isAuthRoute(String path) => authRoutes.contains(path);

  static bool isOnboardingRoute(String path) => path.startsWith('/onboarding/');

  static bool isSystemRoute(String path) => systemRoutes.contains(path);

  static bool isProtectedRoute(String path) {
    if (protectedRoutes.contains(path)) {
      return true;
    }

    return path.startsWith('/rider/') || path.startsWith('/commerce/');
  }
}
