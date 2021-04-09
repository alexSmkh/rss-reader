const cloneTemplateNode = (templateId) => {
  const nodeTemplate = document.getElementById(templateId).content;
  const node = nodeTemplate.cloneNode(true);
  return node;
};

export const buildToastForShowingErrors = (title, description) => {
  const toast = cloneTemplateNode('toast-template');

  const toastTitle = toast.querySelector('[name="toast-title"]');
  toastTitle.textContent = title;

  const toastBody = toast.querySelector('.toast-body');
  toastBody.textContent = description;

  return toast;
};

export const buildRssListContainer = () => cloneTemplateNode('rss-list-container-template');

export const buildPostListContainer = () => cloneTemplateNode('post-list-container-template');

export const buildNotificationContainerForPostList = (
  numberOfNewPosts,
  i18n,
) => {
  const containerTemplate = cloneTemplateNode('notification-container-template');
  const container = containerTemplate.querySelector(
    '[name="notification-container"]',
  );
  const textBeforeBadge = container.querySelector('[name="text-before-badge"]');
  textBeforeBadge.textContent = i18n.t('notificationContainer.beforeBadge');

  const textAfterBadge = container.querySelector('[name="text-after-badge"]');
  textAfterBadge.setAttribute('data-number-for-translate', numberOfNewPosts);
  textAfterBadge.textContent = i18n.t(
    'notificationContainer.afterBadge.after',
    { count: numberOfNewPosts },
  );

  const badge = container.querySelector('[name="badge"]');
  badge.textContent = numberOfNewPosts;

  return container;
};

export const buildPostCard = (
  watchedState,
  title,
  description,
  postId,
  i18n,
) => {
  const fragment = cloneTemplateNode('post-card-template');
  const card = fragment.querySelector('.card');
  const cardTitle = card.querySelector('[name="card-title"]');
  const cardBadge = card.querySelector('[name="badge"]');
  const previewBtn = card.querySelector('[name="preview-btn"]');
  const cardDescription = card.querySelector('[name="card-description"]');
  const markAsReadLink = card.querySelector('[name="mark-as-read-link"]');

  card.setAttribute('data-post-card-id', postId);
  cardTitle.textContent = title;
  cardDescription.textContent = description;
  previewBtn.textContent = i18n.t('post.btn');
  previewBtn.setAttribute('data-post-id', postId);

  if (watchedState.readPostIDs.has(postId)) {
    cardTitle.classList.replace('font-weight-bold', 'font-weight-normal');
    cardBadge.remove();
    markAsReadLink.remove();
    return card;
  }

  cardBadge.textContent = i18n.t('post.new');
  markAsReadLink.textContent = i18n.t('post.markAsRead');
  markAsReadLink.setAttribute('data-post-id', postId);
  return card;
};

export const buildRssSourceCard = (
  isRssActive,
  rssSourceId,
  title,
  description,
  nubmerOfUnreadPosts,
) => {
  const cardTemplateContent = document.getElementById('rss-source-card')
    .content;
  const cardTemplateClone = cardTemplateContent.cloneNode(true);
  const card = cardTemplateClone.querySelector('[name="rss-source-card"]');
  const cardTitle = card.querySelector('[name="card-title"]');
  const cardDescription = card.querySelector('[name="card-description"]');
  const cardBadge = card.querySelector('[name="badge"]');
  const cardDeleteIcon = card.querySelector('[name="delete-icon"]');

  if (isRssActive) card.classList.add('active');
  card.setAttribute('data-source-id', rssSourceId);
  cardTitle.textContent = title;
  cardDescription.textContent = description;
  cardDeleteIcon.setAttribute('data-del-icon-for-rss-id', rssSourceId);

  if (nubmerOfUnreadPosts > 0) {
    cardBadge.textContent = nubmerOfUnreadPosts;
  }
  return card;
};

export const buildStartPage = (i18n) => {
  const startPage = cloneTemplateNode('start-page-template');
  const title = startPage.querySelector('[name="start-page-title"]');
  title.textContent = i18n.t('startPageContent.title');
  return startPage;
};
