const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://api.toptopfootball.com').replace(/\/+$/, '');

export const apiUrl = (path) => {
  if (!apiBaseUrl || typeof path !== 'string' || !path.startsWith('/api/')) {
    return path;
  }

  return `${apiBaseUrl}${path}`;
};

export const configureApiFetch = () => {
  if (!apiBaseUrl || typeof window === 'undefined' || window.__apiFetchConfigured) {
    return;
  }

  const nativeFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    if (typeof input === 'string') {
      return nativeFetch(apiUrl(input), init);
    }

    if (input instanceof Request) {
      const requestUrl = new URL(input.url);
      if (requestUrl.origin === window.location.origin && requestUrl.pathname.startsWith('/api/')) {
        return nativeFetch(new Request(apiUrl(`${requestUrl.pathname}${requestUrl.search}`), input), init);
      }
    }

    return nativeFetch(input, init);
  };

  window.__apiFetchConfigured = true;
};
