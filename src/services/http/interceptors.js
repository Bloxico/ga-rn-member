export const setAuthHeaderInterceptor = config => {
  if (!config.withAuth) {
    return config;
  }

  return {
    ...config,
    headers: {
      ...config.headers,
    },
  };
};
