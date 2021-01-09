import onChange from 'on-change';
import _, { assignWith, divide } from 'lodash';
import { number } from 'yup/lib/locale';

const getNumberOfUnreadPosts = (rssSourceId, allPosts) => {
  console.log('allPosts', allPosts);

  const currentPosts = allPosts.filter((post) => {
    console.log('post.id: ', post.id, '  rssId: ', rssSourceId);
    return post.sourceId === rssSourceId;
  });
  console.log('currentPosts', currentPosts);
  const counts = _.countBy(currentPosts, ({ unread }) => unread);
  console.log('counts', counts);
  return counts.true;
};

const buildRemoveIcon = (watchedState, rssSourceId) => {
  const removeIcon = document.createElement('img');
  removeIcon.classList.add('remove-icon', 'ml-2');
  removeIcon.setAttribute('src', 'assets/images/x-circle.svg');
  removeIcon.setAttribute('data-remove-icon-for', rssSourceId);
  removeIcon.style.width = '20px';

  removeIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    const updatedRssSources = watchedState.rssSources.filter(
      ({ id }) => id !== rssSourceId
    );
    const updatedPosts = watchedState.posts.filter(
      ({ sourceId }) => sourceId !== rssSourceId
    );

    watchedState.posts = updatedPosts;

    if (updatedRssSources.length === 0) {
      watchedState.activeSourceId = null;
      watchedState.rssSources = updatedRssSources;
      return;
    }

    if (rssSourceId === watchedState.activeSourceId) {
      watchedState.activeSourceId = updatedRssSources[0].id;
    }

    watchedState.rssSources = updatedRssSources;
  });

  removeIcon.addEventListener('mouseover', (e) => {
    e.preventDefault();
    removeIcon.setAttribute('src', 'assets/images/x-circle-fill.svg');
  });

  removeIcon.addEventListener('mouseout', (e) => {
    e.preventDefault();
    removeIcon.setAttribute('src', 'assets/images/x-circle.svg');
  });

  return removeIcon;
};

const buildPostCard = (watchedState, post) => {
  const card = document.createElement('div');
  card.classList.add('card', 'shadow', 'mb-3');
  card.setAttribute('data-post-id', post.id);

  const cardHeader = document.createElement('div');
  cardHeader.classList.add(
    'card-header',
    'd-flex',
    'justify-content-between',
    'align-items-center'
  );

  const postTitle = document.createElement('h5');
  postTitle.classList.add('font-weight-normal', 'mb-0');
  postTitle.textContent = post.title;
  cardHeader.appendChild(postTitle);
  card.appendChild(cardHeader);

  const cartBody = document.createElement('div');
  cartBody.classList.add('card-body');

  const postDescription = document.createElement('p');
  postDescription.classList.add('card-text');
  postDescription.textContent = post.description;

  const linkWrapper = document.createElement('div');
  linkWrapper.classList.add('wrapper');

  const redirectLink = document.createElement('a');
  redirectLink.setAttribute('href', post.link);
  redirectLink.textContent = 'Preview';
  redirectLink.classList.add('btn', 'btn-secondary', 'mr-1');

  linkWrapper.appendChild(redirectLink);
  cartBody.appendChild(postDescription);
  cartBody.appendChild(linkWrapper);
  card.appendChild(cartBody);

  if (!post.unread) {
    return card;
  }

  postTitle.classList.replace('font-weight-normal', 'font-weight-bold');
  const newLabel = document.createElement('span');
  newLabel.classList.add(
    'badge',
    'badge-danger',
    'badge-pill',
    'p-1',
    'd-flex',
    'align-items-center'
  );
  newLabel.textContent = 'NEW!';
  newLabel.style.maxHeight = '22px';
  cardHeader.appendChild(newLabel);

  const markAsReadLink = document.createElement('a');
  markAsReadLink.setAttribute('href', '#');
  markAsReadLink.textContent = 'Mark as read';
  markAsReadLink.classList.add('text-muted', 'ml-2');
  markAsReadLink.addEventListener('click', (e) => {
    e.preventDefault();
    markAsReadLink.remove();

    const newLabel = cardHeader.querySelector('span');
    newLabel.remove();
    const updatedPosts = watchedState.posts.map((item) => {
      if (item.id !== post.id) return item;
      item.unread = false;
      return item;
    });
    watchedState.posts = updatedPosts;

    const badge = document.querySelector(
      `[data-source-id="${post.sourceId}"] .badge`
    );
    const notificationNumber = parseInt(badge.textContent);
    console.log('number', notificationNumber);

    if (notificationNumber === 1) {
      badge.remove();
      return;
    }

    postTitle.classList.replace('font-weight-bold', 'font-weight-normal');
    badge.textContent = notificationNumber - 1;
  });

  linkWrapper.appendChild(markAsReadLink);

  card.addEventListener('mouseenter', (e) => {
    e.preventDefault();
    card.classList.replace('shadow', 'shadow-sm');
    card.style.transition = 'box-shadow .5s';
    card.style.cursor = 'pointer';
    }
  );

  card.addEventListener('mouseleave', (e) => {
    e.preventDefault();
    card.classList.replace('shadow-sm', 'shadow');
    card.style.transition = 'box-shadow .5s';
    card.style.cursor = null;
  });

  return card;
};

const buildPostList = (watchedState) => {
  const postListContainer = document.createElement('div');
  postListContainer.classList.add('col-8', 'pr-4', 'border-left');

  const overflowContainer = document.createElement('div');
  overflowContainer.classList.add('overflow-auto');
  overflowContainer.style.maxHeight = '850px';

  const posts = watchedState.posts.filter((post) => {
    return watchedState.activeSourceId === post.sourceId;
  });
  posts.forEach((post) =>
    overflowContainer.appendChild(buildPostCard(watchedState, post))
  );

  postListContainer.appendChild(overflowContainer);
  return postListContainer;
};

const buildRssSourceCard = (watchedState, rssSource) => {
  const card = document.createElement('div');
  card.classList.add('card', 'shadow', 'mb-2');
  card.setAttribute('data-source-id', rssSource.id);

  const cardHeader = document.createElement('div');
  cardHeader.classList.add(
    'card-header',
    'p-2',
    'd-flex',
    'justify-content-between',
    'align-items-center'
  );

  const rssTitle = document.createElement('p');
  rssTitle.classList.add('mb-0', 'font-weight-bold');
  rssTitle.textContent = rssSource.title;

  const notificationWrapper = document.createElement('div');
  notificationWrapper.style.minWidth = '100px';
  notificationWrapper.classList.add(
    'notificatonWrapper',
    'd-flex',
    'justify-content-center',
    'align-items-center',
    'pl-2'
  );

  const nubmerOfUnreadPosts = getNumberOfUnreadPosts(
    rssSource.id,
    watchedState.posts
  );

  if (nubmerOfUnreadPosts) {
    const notificationBadge = document.createElement('span');
    notificationBadge.classList.add(
      'badge',
      'badge-danger',
      'badge-pill',
      'mr-1'
    );
    notificationBadge.textContent = nubmerOfUnreadPosts;
    notificationBadge.style.maxHeight = '22px';
    notificationWrapper.appendChild(notificationBadge);
  }

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body', 'p-3');

  const rssSourceDescription = document.createElement('p');
  rssSourceDescription.classList.add('mb-0');
  rssSourceDescription.textContent = rssSource.description;

  cardBody.appendChild(rssSourceDescription);
  cardHeader.appendChild(rssTitle);
  cardHeader.appendChild(notificationWrapper);
  card.appendChild(cardHeader);
  card.appendChild(cardBody);

  card.addEventListener('mouseenter', (e) => {
    e.preventDefault();
    if (!card.classList.contains('active')) {
      card.classList.replace('shadow', 'shadow-sm');
      card.style.transition = 'box-shadow .5s';
    }

    card.style.cursor = 'pointer';
    const removeIcon = buildRemoveIcon(watchedState, rssSource.id);
    notificationWrapper.appendChild(removeIcon);
  });

  card.addEventListener('mouseleave', (e) => {
    e.preventDefault();
    if (!card.classList.contains('active')) {
      card.classList.replace('shadow-sm', 'shadow');
    }
    card.style.cursor = null;
    const removeIcon = document.querySelector('.remove-icon');
    removeIcon.remove();
  });

  card.addEventListener('click', (e) => {
    if (rssSource.id === watchedState.activeSourceId) return;
    watchedState.activeSourceId = rssSource.id;
  });

  if (watchedState.activeSourceId === rssSource.id) {
    card.classList.add('active');
    card.classList.replace('shadow', 'shadow-sm');
  }

  return card;
};

const renderStartPage = () => {
  const rssContent = document.querySelector('[name="rss-content"]');
  const container = document.createElement('div');
  container.classList.add(
    'col-12',
    'd-flex',
    'flex-column',
    'justify-content-center',
    'align-items-center',
    'mt-5'
  );

  const img = document.createElement('img');
  img.setAttribute('src', '/assets/images/feeds.png');

  const p = document.createElement('p');
  p.classList.add('h3', 'mb-2');
  p.textContent = 'Which sources would you like to follow?';

  container.appendChild(img);
  container.appendChild(p);
  rssContent.innerHTML = '';
  rssContent.appendChild(container);
};

const buildRssList = (watchedState) => {
  const rssList = document.createElement('div');
  rssList.classList.add('col-4');
  rssList.setAttribute('name', 'rss-source-list');

  const overflowContainer = document.createElement('div');
  overflowContainer.classList.add('overflow-auto');
  overflowContainer.style.maxHeight = '850px';

  watchedState.rssSources.forEach((rssSource) => {
    overflowContainer.appendChild(buildRssSourceCard(watchedState, rssSource));
  });

  rssList.appendChild(overflowContainer);
  return rssList;
};

const renderRssContent = (watchedState, elements) => {
  if (watchedState.rssSources.length === 0) {
    renderStartPage();
    return;
  }

  const rssContent = document.querySelector('[name="rss-content"]');
  const rssList = buildRssList(watchedState);
  const postList = buildPostList(watchedState);

  rssContent.innerHTML = '';
  rssContent.appendChild(rssList);
  rssContent.appendChild(postList);
};

const renderSucceedFeedback = (elemets) => {
  const { input, form } = elemets;
  const feedback = document.createElement('div');
  feedback.classList.add('valid-feedback');
  feedback.textContent = 'Rss has been loaded!';

  input.classList.add('is-valid');
  input.after(feedback);
  form.reset();
  input.focus();

  setTimeout(() => {
    input.classList.remove('is-valid');
    feedback.remove();
  }, 3000);
};

const renderErrors = (error, elements) => {
  const { input } = elements;

  const prevFeedback = input.nextSibling;
  if (prevFeedback) {
    prevFeedback.remove();
  }

  if (!error) {
    input.classList.remove('is-invalid');
    return;
  }

  const feedback = document.createElement('div');
  feedback.classList.add('invalid-feedback');
  feedback.textContent = _.capitalize(error);

  input.classList.add('is-invalid');
  input.after(feedback);
};

const processStateHandler = (processState, elements) => {
  const { submit } = elements;
  let count = 1;
  switch (processState) {
    case 'filling':
      submit.disabled = false;
      console.log(count);
      count += 1;
      renderSucceedFeedback(elements);
      break;
    case 'sending':
      submit.disabled = true;
      break;
    case 'failed':
      submit.disabled = false;
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};

export default (state, elements) => {
  const { submit } = elements;
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.processState':
        processStateHandler(value, elements);
        break;
      case 'form.valid':
        submit.disabled = !value;
        break;
      case 'form.error':
        renderErrors(value, elements);
        break;
      case 'rssSources':
        renderRssContent(watchedState, elements);
        break;
      case 'activeSourceId':
        renderRssContent(watchedState);
        break;
      default:
        break;
    }
  });
  return watchedState;
};
