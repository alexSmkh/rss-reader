import {
  handleMouseEnterEventOnRssCard,
  handleMouseLeaveEventOnRssCard,
  handleMouseoverOnDeleteIcon,
  handleMouseoutOnDeleteIcon,
} from './handlers.js';

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

const buildNotificationBadgeCounter = (numberOfUnreadPosts) => {
  const notificationBadge = document.createElement('span');
  notificationBadge.classList.add(
    'badge',
    'badge-danger',
    'badge-pill',
    'mr-1',
    'd-flex',
    'align-items-center',
  );
  notificationBadge.textContent = numberOfUnreadPosts;
  notificationBadge.style.maxHeight = '22px';
  return notificationBadge;
};

export const buildRssSourceCard = (
  isRssActive,
  rssSourceId,
  title,
  description,
  nubmerOfUnreadPosts,
) => {
  const card = document.createElement('div');
  card.classList.add('card', 'shadow-sm', 'mb-3');
  if (isRssActive) card.classList.add('border-3');
  card.setAttribute('data-source-id', rssSourceId);
  card.setAttribute('name', 'rss-source-card');

  const cardHeader = document.createElement('div');
  cardHeader.classList.add(
    'card-header',
    'p-2',
    'd-flex',
    'justify-content-between',
    'align-items-center',
  );

  const rssTitle = document.createElement('p');
  rssTitle.classList.add('mb-0', 'font-weight-bold');
  rssTitle.textContent = title;

  const deleteIcon = buildDeleteIcon(rssSourceId);
  deleteIcon.style.display = 'none';

  const notificationWrapper = document.createElement('div');
  notificationWrapper.style.minWidth = '100px';
  notificationWrapper.classList.add(
    'notificatonWrapper',
    'd-flex',
    'justify-content-center',
    'align-items-center',
    'pl-2',
  );

  if (nubmerOfUnreadPosts) {
    const notificationBadge = buildNotificationBadgeCounter(
      nubmerOfUnreadPosts,
    );
    notificationWrapper.appendChild(notificationBadge);
  }
  notificationWrapper.appendChild(deleteIcon);

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body', 'p-3');

  const rssSourceDescription = document.createElement('p');
  rssSourceDescription.classList.add('mb-0');
  rssSourceDescription.textContent = description;

  cardBody.appendChild(rssSourceDescription);
  cardHeader.appendChild(rssTitle);
  cardHeader.appendChild(notificationWrapper);
  card.appendChild(cardHeader);
  card.appendChild(cardBody);

  card.addEventListener('mouseenter', handleMouseEnterEventOnRssCard);
  card.addEventListener('mouseleave', handleMouseLeaveEventOnRssCard);

  return card;
};
