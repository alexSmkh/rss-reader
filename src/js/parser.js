import _ from 'lodash';

const getRssPostsData = (parsedRss, sourceId) => {
  const items = parsedRss.querySelectorAll('item');
  const posts = [];
  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    const pubDate = new Date(item.querySelector('pubDate').textContent);
    const id = _.uniqueId();
    posts.push({
      title,
      description,
      link,
      pubDate,
      sourceId,
      id,
      unread: true,
    });
  });
  return posts;
};

const getRssSourceData = (parsedRss, sourceLink) => {
  const title = parsedRss.querySelector('title').textContent;
  const description = parsedRss.querySelector('description').textContent;
  const id = _.uniqueId();
  return {
    title,
    description,
    id,
  };
};

export default (rssContent, mimeType) => {
  const parser = new DOMParser();
  const content = parser.parseFromString(rssContent, mimeType);
  if (content.querySelector('parsererror')) {
    return null;
  }
  const source = getRssSourceData(content);
  const postList = getRssPostsData(content, source.id);
  return { source, postList };
};
