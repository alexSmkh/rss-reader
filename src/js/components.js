import {
  handleMouseEnterEventOnRssCard,
  handleMouseLeaveEventOnRssCard,
  handleMouseoverOnDeleteIcon,
  handleMouseoutOnDeleteIcon,
  handleClosingToast,
} from './handlers.js';

export const buildToastForShowingErrors = (title, description) => {
  const toast = document.createElement('div');
  toast.classList.add('toast', 'show');
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.style.position = 'absolute';
  toast.style.top = '10px';
  toast.style.left = '10px';
  toast.style.zIndex = '1000';

  const toastHeader = document.createElement('div');
  toastHeader.classList.add('toast-header');

  const toastHeaderTitle = document.createElement('strong');
  toastHeaderTitle.classList.add('mr-auto');
  toastHeaderTitle.textContent = title;

  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.classList.add('close');
  button.setAttribute('aria-label', 'Close');

  const span = document.createElement('span');
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = '&times;';

  const toastBody = document.createElement('div');
  toastBody.classList.add('toast-body');
  toastBody.textContent = description;

  button.appendChild(span);
  toastHeader.appendChild(toastHeaderTitle);
  toastHeader.appendChild(button);
  toast.appendChild(toastHeader);
  toast.appendChild(toastBody);
  toast.addEventListener('click', handleClosingToast);
  return toast;
};

export const buildRssListContainer = () => {
  const rssListContainer = document.createElement('div');
  rssListContainer.classList.add('col-md-6', 'col-lg-5', 'col-xl-4');
  rssListContainer.setAttribute('name', 'rss-source-list');

  const rssListOverflowContainer = document.createElement('div');
  rssListOverflowContainer.classList.add('overflow-auto', 'p-1');
  rssListOverflowContainer.setAttribute('name', 'overflow-rss-source');
  rssListOverflowContainer.style.maxHeight = '850px';
  rssListContainer.appendChild(rssListOverflowContainer);
  return { rssListContainer, rssListOverflowContainer };
};

export const buildDeleteIcon = (rssSourceId) => {
  const deleteIcon = document.createElement('img');
  deleteIcon.classList.add('delete-icon', 'ml-2');
  deleteIcon.setAttribute('src', 'assets/images/x-circle.svg');
  deleteIcon.setAttribute('name', 'delete-icon');
  deleteIcon.setAttribute('data-del-icon-for-rss-Id', rssSourceId);
  deleteIcon.style.width = '20px';
  deleteIcon.addEventListener('mouseover', handleMouseoverOnDeleteIcon);
  deleteIcon.addEventListener('mouseout', handleMouseoutOnDeleteIcon);
  return deleteIcon;
};

const buildBadge = () => {
  const badge = document.createElement('span');
  badge.classList.add(
    'badge',
    'badge-danger',
    'badge-pill',
    'd-flex',
    'align-items-center',
  );
  badge.setAttribute('name', 'badge');
  badge.style.maxHeight = '22px';
  return badge;
};

export const buildBadgeForShowingNumberOfUnreadPosts = (
  numberOfUnreadPosts,
) => {
  const badge = buildBadge();
  badge.textContent = numberOfUnreadPosts;
  badge.style.maxHeight = '22px';
  return badge;
};

export const buildNotificationContainerForPostList = (
  numberOfNewPosts,
  i18n,
) => {
  const container = document.createElement('div');
  container.classList.add(
    'mt-0',
    'mb-2',
    'rounded',
    'py-1',
    'bg-secondary',
    'd-flex',
    'justify-content-center',
    'align-items-center',
    'text-light',
    'shadow',
  );
  container.setAttribute('name', 'notifications-for-post-list');
  container.style.position = 'sticky';
  container.style.top = '0px';
  container.style.zIndex = '1000';
  container.style.cursor = 'pointer';

  const textBeforeBadge = document.createElement('span');
  textBeforeBadge.setAttribute(
    'data-translation-key',
    'notificationForPostList.beforeBadge',
  );
  textBeforeBadge.textContent = i18n.t('notificationForPostList.beforeBadge');

  const textAfterBadge = document.createElement('span');
  textAfterBadge.setAttribute(
    'data-translation-key-plural',
    'notificationForPostList.afterBadge.after',
  );
  textAfterBadge.setAttribute('data-number-for-translate', numberOfNewPosts);

  textAfterBadge.textContent = i18n.t(
    'notificationForPostList.afterBadge.after',
    { count: numberOfNewPosts },
  );

  const badge = buildBadge();
  badge.classList.add('mx-1');
  badge.textContent = `${numberOfNewPosts}`;

  container.appendChild(textBeforeBadge);
  container.appendChild(badge);
  container.appendChild(textAfterBadge);

  return container;
};

export const buildPostCard = (
  watchedState,
  title,
  description,
  postId,
  i18n,
) => {
  const cardTemplateContent = document.getElementById('post-card-template').content;
  const cardTemplateClone = cardTemplateContent.cloneNode(true);
  const card = cardTemplateClone.querySelector('.card');
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
  const cardTemplateContent = document.getElementById('rss-source-card').content;
  const cardTemplateClone = cardTemplateContent.cloneNode(true);
  const card = cardTemplateClone.querySelector('[name="rss-source-card"]');
  const cardTitle = card.querySelector('[name="card-title"]');
  const cardDescription = card.querySelector('[name="card-description"]');
  const cardBadge = card.querySelector('[name="badge"]');
  const cardDeleteIcon = card.querySelector('[name="delete-icon"]');

  // const card = document.createElement('div');
  // card.classList.add('card', 'shadow-sm', 'mb-3');
  if (isRssActive) card.classList.add('border-3');
  card.setAttribute('data-source-id', rssSourceId);
  cardTitle.textContent = title;
  cardDescription.textContent = description;
  // card.setAttribute('name', 'rss-source-card');

  // const cardHeader = document.createElement('div');
  // cardHeader.classList.add(
  //   'card-header',
  //   'p-2',
  //   'd-flex',
  //   'justify-content-between',
  //   'align-items-center',
  // );

  // const rssTitle = document.createElement('p');
  // rssTitle.classList.add('mb-0', 'font-weight-bold');
  // rssTitle.textContent = title;

  // const deleteIcon = buildDeleteIcon(rssSourceId);
  // deleteIcon.style.display = 'none';

  // const badgeWrapper = document.createElement('div');
  // badgeWrapper.setAttribute('name', 'badge-wrapper');
  // badgeWrapper.style.minWidth = '100px';
  // badgeWrapper.classList.add(
  //   'd-flex',
  //   'justify-content-center',
  //   'align-items-center',
  //   'pl-2',
  // );

  // if (nubmerOfUnreadPosts) {
  //   const badgeForShowingNumberOfUnreadPosts = buildBadgeForShowingNumberOfUnreadPosts(
  //     nubmerOfUnreadPosts,
  //   );
  //   badgeWrapper.appendChild(badgeForShowingNumberOfUnreadPosts);
  // }
  // badgeWrapper.appendChild(deleteIcon);

  // const cardBody = document.createElement('div');
  // cardBody.classList.add('card-body', 'p-3');

  // const rssSourceDescription = document.createElement('p');
  // rssSourceDescription.classList.add('mb-0');
  // rssSourceDescription.textContent = description;

  // cardBody.appendChild(rssSourceDescription);
  // cardHeader.appendChild(rssTitle);
  // cardHeader.appendChild(badgeWrapper);
  // card.appendChild(cardHeader);
  // card.appendChild(cardBody);

  // card.addEventListener('mouseenter', handleMouseEnterEventOnRssCard);
  // card.addEventListener('mouseleave', handleMouseLeaveEventOnRssCard);

  // return card;
};
