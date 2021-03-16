import onChange from 'on-change';
import _ from 'lodash';

const changeLanguage = (language, i18n) => {
  /* eslint-disable  no-param-reassign */
  i18n.t = i18n[language];
  const btns = document.querySelectorAll('[name="change-language"]');
  btns.forEach((btn) => btn.classList.toggle('active'));

  const elementsForTranslate = document.querySelectorAll(
    '[data-translation-key]',
  );
  elementsForTranslate.forEach((element) => {
    const { translationKey } = element.dataset;
    element.textContent = i18n.t(translationKey);
    /* eslint-enable  no-param-reassign */
  });

  const rssInput = document.getElementById('rss-input');
  rssInput.setAttribute('placeholder', i18n.t('header.form.placeholder'));

  const elementsForTranslatePlural = document.querySelectorAll(
    '[data-translation-key-plural]',
  );
  elementsForTranslatePlural.forEach((element) => {
    const translationKey = element.dataset.translationKeyPlural;
    const count = parseInt(element.dataset.numberForTranslate, 10);
    /* eslint-disable  no-param-reassign */
    element.textContent = i18n.t(translationKey, { count });
    /* eslint-enable  no-param-reassign */
  });
};

const showBtnSpinner = (btn, i18n) => {
  const spinner = document.createElement('span');
  spinner.classList.add('spinner-border', 'spinner-border-sm', 'ml-1');
  /* eslint-disable  no-param-reassign */
  btn.textContent = i18n.t('header.form.btn.loading');
  /* eslint-enable  no-param-reassign */
  btn.appendChild(spinner);
};

const hideBtnSpinner = (btn, i18n) => {
  /* eslint-disable  no-param-reassign */
  btn.textContent = i18n.t('header.form.btn.content');
  /* eslint-enable  no-param-reassign */
};

const getNumberOfUnreadPosts = (watchedState, rssSourceId) => {
  const posts = watchedState.posts.filter(
    (post) => post.sourceId === rssSourceId,
  );
  const unreadPosts = _.difference(posts, watchedState.readPostIDs);
  return unreadPosts.length;
};

const showModalDialog = (post) => {
  const modal = document.getElementById('preview-modal');

  const modalTitle = modal.querySelector('.modal-title');
  modalTitle.textContent = post.title;

  const modalBodyContent = modal.querySelector('.modal-body > p');
  modalBodyContent.textContent = post.description;

  const openBtn = modal.querySelector('.modal-footer > a');
  openBtn.setAttribute('href', post.link);
};

const buildDeleteIcon = (watchedState, rssSourceOfTargetElement) => {
  const removeIcon = document.createElement('img');
  removeIcon.classList.add('delete-icon', 'ml-2');
  removeIcon.setAttribute('src', 'assets/images/x-circle.svg');
  removeIcon.style.width = '20px';

  removeIcon.addEventListener('click', (e) => {
    e.stopPropagation();

    /* eslint-disable  no-param-reassign */
    const postsIDsOfRssSourceTarget = watchedState.posts
      .filter((post) => post.sourceId === rssSourceOfTargetElement.id)
      .map((post) => post.id);
    // const readPostIDs = _.clone(watchedState.readPostIDs);
    watchedState.readPostIDs = new Set(
      _.difference(
        watchedState.readPostIDs,
        postsIDsOfRssSourceTarget,
      ),
    );

    const updatedRssSources = watchedState.rssSources.filter(
      (rssSource) => rssSource.id !== rssSourceOfTargetElement.id,
    );

    const updatedPosts = watchedState.posts.filter(
      (post) => post.sourceId !== rssSourceOfTargetElement.id,
    );
    watchedState.posts = updatedPosts;

    if (updatedRssSources.length === 0) {
      watchedState.activeSourceId = null;
      watchedState.checkingUpdates = false;
      watchedState.rssSources = updatedRssSources;
      return;
    }

    if (rssSourceOfTargetElement.id === watchedState.activeSourceId) {
      watchedState.activeSourceId = updatedRssSources[0].id;
    }

    watchedState.rssSources = updatedRssSources;
    /* eslint-enable  no-param-reassign */
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

const markPostAsRead = (post, markAsReadLink, cardHeader, postTitle) => {
  if (markPostAsRead) {
    markAsReadLink.remove();
  }

  const newLabel = cardHeader.querySelector('span');
  newLabel.remove();

  const badge = document.querySelector(
    `[data-source-id="${post.sourceId}"] .badge`,
  );

  const numberOfUnreadPosts = parseInt(badge.textContent, 10);
  if (numberOfUnreadPosts === 1) {
    badge.remove();
    return;
  }

  postTitle.classList.replace('font-weight-bold', 'font-weight-normal');
  badge.textContent = numberOfUnreadPosts - 1;
};

const buildNotificationBadge = (i18n) => {
  const badge = document.createElement('span');
  badge.classList.add(
    'badge',
    'badge-danger',
    'badge-pill',
    'p-1',
    'd-flex',
    'align-items-center',
  );
  badge.textContent = i18n.t('post.new');
  badge.setAttribute('data-translation-key', 'post.new');
  badge.style.maxHeight = '22px';
  return badge;
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

const buildPostCard = (watchedState, post, i18n) => {
  const card = document.createElement('div');
  card.classList.add('card', 'shadow', 'mb-3');
  card.setAttribute('data-post-id', post.id);

  const cardHeader = document.createElement('div');
  cardHeader.classList.add(
    'card-header',
    'd-flex',
    'justify-content-between',
    'align-items-center',
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
  postDescription.textContent = `${post.description.slice(0, 100)} ...`;

  const elementWrapper = document.createElement('div');
  elementWrapper.classList.add('wrapper');

  const previewBtn = document.createElement('button');
  previewBtn.textContent = i18n.t('post.btn');
  previewBtn.setAttribute('type', 'button');
  previewBtn.setAttribute('data-translation-key', 'post.btn');
  previewBtn.setAttribute('data-toggle', 'modal');
  previewBtn.setAttribute('data-target', '#preview-modal');
  previewBtn.classList.add('btn', 'btn-secondary', 'mr-1');

  elementWrapper.appendChild(previewBtn);
  cartBody.appendChild(postDescription);
  cartBody.appendChild(elementWrapper);
  card.appendChild(cartBody);

  card.addEventListener('mouseenter', (e) => {
    e.preventDefault();
    card.classList.replace('shadow', 'shadow-sm');
    card.style.transition = 'box-shadow .5s';
    card.style.cursor = 'pointer';
  });

  card.addEventListener('mouseleave', (e) => {
    e.preventDefault();
    card.classList.replace('shadow-sm', 'shadow');
    card.style.transition = 'box-shadow .5s';
    card.style.cursor = null;
  });

  let markAsReadLink;
  if (!watchedState.readPostIDs.has(post.id)) {
    postTitle.classList.replace('font-weight-normal', 'font-weight-bold');
    const badge = buildNotificationBadge(i18n);
    cardHeader.appendChild(badge);

    markAsReadLink = document.createElement('a');
    markAsReadLink.setAttribute('href', '#');
    markAsReadLink.textContent = i18n.t('post.markAsRead');
    markAsReadLink.setAttribute('data-translation-key', 'post.markAsRead');
    markAsReadLink.setAttribute('name', 'mark-as-read-link');
    markAsReadLink.classList.add('text-muted', 'ml-2');
    markAsReadLink.addEventListener('click', (e) => {
      e.preventDefault();
      watchedState.readPostIDs.add(post.id);
      markPostAsRead(post, markAsReadLink, cardHeader, postTitle);
    });
    elementWrapper.appendChild(markAsReadLink);
  }

  previewBtn.addEventListener('click', () => {
    showModalDialog(post);
    if (!watchedState.readPostIDs.has(post.id)) {
      watchedState.readPostIDs.add(post.id);
      markPostAsRead(post, markAsReadLink, cardHeader, postTitle);
    }
  });

  return card;
};

const buildRssSourceCard = (watchedState, rssSource) => {
  const card = document.createElement('div');
  const classesForActiveSource = watchedState.activeSourceId === rssSource.id
    ? ['border-3']
    : [];

  card.classList.add('card', 'shadow-sm', 'mb-3', ...classesForActiveSource);
  card.setAttribute('data-source-id', rssSource.id);

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
  rssTitle.textContent = rssSource.title;

  const notificationWrapper = document.createElement('div');
  notificationWrapper.style.minWidth = '100px';
  notificationWrapper.classList.add(
    'notificatonWrapper',
    'd-flex',
    'justify-content-center',
    'align-items-center',
    'pl-2',
  );

  const nubmerOfUnreadPosts = getNumberOfUnreadPosts(
    watchedState,
    rssSource.id,
  );

  if (nubmerOfUnreadPosts) {
    const notificationBadge = buildNotificationBadgeCounter(
      nubmerOfUnreadPosts,
    );
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
    card.classList.replace('shadow-sm', 'shadow');
    card.style.transition = 'box-shadow .5s';
    card.style.cursor = 'pointer';
    const deleteIcon = buildDeleteIcon(watchedState, rssSource);
    notificationWrapper.appendChild(deleteIcon);
  });

  card.addEventListener('mouseleave', (e) => {
    e.preventDefault();
    card.classList.replace('shadow', 'shadow-sm');
    card.style.cursor = 'grab';
    const deleteIcon = document.querySelector('.delete-icon');
    deleteIcon.remove();
  });

  card.addEventListener('click', () => {
    if (rssSource.id === watchedState.activeSourceId) return;
    /* eslint-disable  no-param-reassign */
    watchedState.activeSourceId = rssSource.id;
    /* eslint-enable  no-param-reassign */
  });

  return card;
};

const buildPostListSection = (postList) => {
  const postListContainer = document.createElement('div');
  postListContainer.classList.add(
    'col-md-6',
    'col-lg-7',
    'col-xl-8',
    'pr-4',
    'border-left',
  );

  const overflowContainer = document.createElement('div');
  overflowContainer.classList.add('overflow-auto');
  overflowContainer.style.maxHeight = '850px';
  overflowContainer.setAttribute('name', 'overflow-post-list');
  postList.forEach((post) => overflowContainer.appendChild(post));
  postListContainer.appendChild(overflowContainer);
  return postListContainer;
};

const buildRssListSection = (rssList) => {
  const rssListSection = document.createElement('div');
  rssListSection.classList.add('col-md-6', 'col-lg-5', 'col-xl-4');
  rssListSection.setAttribute('name', 'rss-source-list');

  const overflowContainer = document.createElement('div');
  overflowContainer.classList.add('overflow-auto');
  overflowContainer.style.maxHeight = '850px';
  rssList.forEach((rss) => overflowContainer.appendChild(rss));
  rssListSection.appendChild(overflowContainer);
  return rssListSection;
};

const buildPostList = (watchedState, i18n) => (
  watchedState.posts
    .filter((post) => watchedState.activeSourceId === post.sourceId)
    .map((post) => buildPostCard(watchedState, post, i18n))
);

const buildRssList = (watchedState) => (
  watchedState.rssSources.map((rssSource) => buildRssSourceCard(
    watchedState,
    rssSource,
  ))
);

const renderStartPage = () => {
  const rssContent = document.querySelector('[name="rss-content"]');
  const container = document.createElement('div');
  container.classList.add(
    'col-12',
    'd-flex',
    'flex-column',
    'justify-content-center',
    'align-items-center',
    'mt-5',
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

const renderRssContent = (watchedState, i18n) => {
  if (!watchedState.activeSourceId) {
    renderStartPage();
    return;
  }

  const rssContent = document.querySelector('[name="rss-content"]');

  const rssList = buildRssList(watchedState);
  const rssListSection = buildRssListSection(rssList);

  const postList = buildPostList(watchedState, i18n);
  const postListSection = buildPostListSection(postList);

  rssContent.innerHTML = '';
  rssContent.appendChild(rssListSection);
  rssContent.appendChild(postListSection);
};

const updateNotificationContainerForPostList = (
  notificationContainer,
  numberOfLastUpdates,
  i18n,
) => {
  const badge = notificationContainer.querySelector('.badge');
  const numberOfNewPosts = parseInt(badge.textContent, 10) + numberOfLastUpdates;
  badge.textContent = numberOfNewPosts;

  const afterBadgeContent = badge.nextSibling;
  afterBadgeContent.textContent = i18n.t(
    'notificationForPostList.afterBadge.after',
    { count: numberOfNewPosts },
  );
  afterBadgeContent.setAttribute('data-number-for-translate', numberOfNewPosts);
};

const renderNotificationBadgeForRssList = (
  watchedState,
  rssSourceId,
  numberOfNewPosts,
  i18n,
) => {
  const rssSourceList = document.querySelector('[name="rss-source-list"]');
  const rssDOMElement = rssSourceList.querySelector(
    `[data-source-id="${rssSourceId}"]`,
  );
  let notificationBadge = rssDOMElement.querySelector('span.badge');
  if (!notificationBadge) {
    const numberOfUnreadPosts = getNumberOfUnreadPosts(
      watchedState,
      rssSourceId,
    );
    notificationBadge = buildNotificationBadge(i18n, numberOfUnreadPosts);
    const badgeWrapper = rssDOMElement.querySelector('.notificatonWrapper');
    badgeWrapper.prepend(notificationBadge);
    return;
  }
  const unreadPostsNumber = parseInt(notificationBadge.textContent, 10);
  notificationBadge.textContent = unreadPostsNumber + numberOfNewPosts;
};

const buildNotificationContainerForPostList = (
  watchedState,
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
    'text-center',
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

  const badge = document.createElement('span');
  badge.classList.add('badge', 'badge-danger', 'mx-1');
  badge.textContent = `${numberOfNewPosts}`;

  container.appendChild(textBeforeBadge);
  container.appendChild(badge);
  container.appendChild(textAfterBadge);

  container.addEventListener('click', () => {
    renderRssContent(watchedState, i18n);
  });

  return container;
};

const renderNotificationContainerForPostList = (
  watchedState,
  rssSourceId,
  numberOfNewPosts,
  i18n,
) => {
  if (rssSourceId === watchedState.activeSourceId) {
    const postList = document.querySelector('[name="overflow-post-list"]');
    let notificationContainer = document.querySelector(
      '[name="notifications-for-post-list"]',
    );
    if (!notificationContainer) {
      notificationContainer = buildNotificationContainerForPostList(
        watchedState,
        numberOfNewPosts,
        i18n,
      );
    } else {
      updateNotificationContainerForPostList(
        notificationContainer,
        numberOfNewPosts,
        i18n,
      );
    }
    postList.prepend(notificationContainer);
  }
};

const renderUpdates = (watchedState, currentPosts, previousPosts, i18n) => {
  if (previousPosts.length > currentPosts.length) return;
  const newPosts = _.difference(currentPosts, previousPosts);
  if (newPosts.length === 0) return;
  const { sourceId } = newPosts[0];
  if (!_.find(previousPosts, ['sourceId', sourceId])) return;
  const numberOfNewPosts = newPosts.length;
  renderNotificationBadgeForRssList(
    watchedState,
    sourceId,
    numberOfNewPosts,
    i18n,
  );
  renderNotificationContainerForPostList(
    watchedState,
    sourceId,
    numberOfNewPosts,
    i18n,
  );
};

const renderSucceedFeedback = (elemets, i18n) => {
  const { input, form } = elemets;
  const feedback = document.createElement('div');
  feedback.classList.add('valid-feedback');
  feedback.setAttribute('data-translation-key', 'header.form.succeedFeedback');
  feedback.textContent = i18n.t('header.form.succeedFeedback');

  input.classList.add('is-valid');
  input.after(feedback);
  form.reset();
  input.focus();

  setTimeout(() => {
    input.classList.remove('is-valid');
    feedback.remove();
  }, 3000);
};

const renderValidationErrors = (errorKeyForTranslate, elements, i18n) => {
  const { input } = elements;

  const prevFeedback = input.nextSibling;
  if (prevFeedback) {
    prevFeedback.remove();
  }

  if (!errorKeyForTranslate) {
    input.classList.remove('is-invalid');
    return;
  }

  const feedback = document.createElement('div');
  feedback.classList.add('invalid-feedback');
  feedback.textContent = i18n.t(errorKeyForTranslate);

  input.classList.add('is-invalid');
  input.after(feedback);
};

const renderErrorAlert = (error) => {
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
  toastHeaderTitle.textContent = error.name;

  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.classList.add('close');
  button.setAttribute('aria-label', 'Close');

  const span = document.createElement('span');
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = '&times;';

  const toastBody = document.createElement('div');
  toastBody.classList.add('toast-body');
  toastBody.textContent = error.message;

  button.appendChild(span);
  toastHeader.appendChild(toastHeaderTitle);
  toastHeader.appendChild(button);
  toast.appendChild(toastHeader);
  toast.appendChild(toastBody);

  span.addEventListener('click', () => {
    toast.remove();
  });

  const body = document.querySelector('body');
  body.prepend(toast);
  setTimeout(() => {
    toast.remove();
  }, 5000);
};

const processStateHandler = (processState, elements, i18n) => {
  const { submit } = elements;
  switch (processState) {
    case 'filling':
      submit.disabled = false;
      renderSucceedFeedback(elements, i18n);
      hideBtnSpinner(submit, i18n);
      break;
    case 'sending':
      submit.disabled = true;
      showBtnSpinner(submit, i18n);
      break;
    case 'failed':
      hideBtnSpinner(submit, i18n);
      submit.disabled = false;
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};

export default (state, elements, i18n) => {
  const { submit } = elements;
  const watchedState = onChange(state, (path, currentValue, prevValue) => {
    switch (path) {
      case 'form.processState':
        processStateHandler(currentValue, elements, i18n);
        break;
      case 'form.valid':
        submit.disabled = !currentValue;
        break;
      case 'form.error':
        renderValidationErrors(currentValue, elements, i18n);
        break;
      case 'rssSources':
        renderRssContent(watchedState, i18n);
        break;
      case 'activeSourceId':
        renderRssContent(watchedState, i18n);
        break;
      case 'language':
        changeLanguage(currentValue, i18n);
        break;
      case 'error':
        renderErrorAlert(currentValue);
        break;
      case 'posts':
        renderUpdates(watchedState, currentValue, prevValue, i18n);
        break;
      default:
        break;
    }
  });
  return watchedState;
};
