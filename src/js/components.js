export const buildRssListContainer = () => {
  const rssListContainer = document.createElement('div');
  rssListContainer.classList.add('col-md-6', 'col-lg-5', 'col-xl-4');
  rssListContainer.setAttribute('name', 'rss-source-list');

  const rssListOverflowContainer = document.createElement('div');
  rssListOverflowContainer.classList.add('overflow-auto');
  rssListOverflowContainer.setAttribute('name', 'overflow-rss-source');
  rssListOverflowContainer.style.maxHeight = '850px';
  rssListContainer.appendChild(rssListOverflowContainer);
  return { rssListContainer, rssListOverflowContainer };
};

export const buildPostListContainer = () => {
  const postListContainer = document.createElement('div');
  postListContainer.classList.add(
    'col-md-6',
    'col-lg-7',
    'col-xl-8',
    'pr-4',
    'border-left',
  );

  const postListOverflowContainer = document.createElement('div');
  postListOverflowContainer.classList.add('overflow-auto');
  postListOverflowContainer.setAttribute('name', 'overflow-post-list');
  postListOverflowContainer.style.maxHeight = '850px';
  postListContainer.appendChild(postListOverflowContainer);
  return { postListContainer, postListOverflowContainer };
};
