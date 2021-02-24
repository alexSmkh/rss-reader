const corsProxy = 'https://hexlet-allorigins.herokuapp.com/get?url='; 

export const removeTrailingSlash = (url) => {
  const trimmedUrl = url.trim();
  if (trimmedUrl.endsWith('/')) {
    return trimmedUrl.slice(0, -1);
  }
  return trimmedUrl;
};

export const wrapUrlInCorsProxy = (url) => (
  `${corsProxy}${encodeURIComponent(url)}`
);