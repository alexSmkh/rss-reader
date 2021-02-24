const getRssPostsData = (parsedRss) => {
  const items = parsedRss.querySelectorAll('item');
  const posts = [];
  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    posts.push({
      title,
      description,
      link,
    });
  });
  return posts;
};

const getRssSourceData = (parsedRss) => {
  const title = parsedRss.querySelector('title').textContent;
  const description = parsedRss.querySelector('description').textContent;
  return {
    title,
    description,
  };
};

export default (rssContent, mimeType) => {
  const parser = new DOMParser();
  const content = parser.parseFromString(rssContent, mimeType);
  if (content.querySelector('parsererror')) {
    throw new Error('parse error');
  }
  const source = getRssSourceData(content);
  const posts = getRssPostsData(content);
  return { source, posts };
};
