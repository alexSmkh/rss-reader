export const normalizeURL = (url) => {
  const trimmedUrl = url.trim();
  if (trimmedUrl.endsWith('/')) {
    return trimmedUrl.slice(0, -1);
  }
  return trimmedUrl;
};

export const wrapUrlInCorsProxy = (rawURL) => {
  const corsProxyURL = new URL('https://allorigins.hexlet.app/get');
  corsProxyURL.searchParams.append('url', rawURL);
  corsProxyURL.searchParams.append('disableCache', 'true');
  return corsProxyURL;
};
