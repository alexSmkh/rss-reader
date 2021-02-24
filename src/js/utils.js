export const removeTrailingSlash = (url) => {
  const trimmedUrl = url.trim();
  if (trimmedUrl.endsWith('/')) {
    return trimmedUrl.slice(0, -1);
  }
  return trimmedUrl;
};
