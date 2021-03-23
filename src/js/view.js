import onChange from 'on-change';
import _ from 'lodash';

import {
  buildRssSourceCard,
  buildPostCard,
  buildBadgeForShowingNumberOfUnreadPosts,
  buildToastForShowingErrors,
  buildNotificationContainerForPostList,
} from './components.js';

const changeLanguage = (language, i18n) => {
  /* eslint-disable  no-param-reassign */
  i18n.changeLanguage(language)
    .then((t) => {
      const btns = document.querySelectorAll('[name="change-language"]');
      btns.forEach((btn) => btn.classList.toggle('active'));

      const elementsForTranslate = document.querySelectorAll(
        '[data-translation-key]',
      );
      elementsForTranslate.forEach((element) => {
        const { translationKey } = element.dataset;
        element.textContent = t(translationKey);
        /* eslint-enable  no-param-reassign */
      });

      const rssInput = document.getElementById('rss-input');
      rssInput.setAttribute('placeholder', t('header.form.placeholder'));

      const elementsForTranslatePlural = document.querySelectorAll(
        '[data-translation-key-plural]',
      );
      elementsForTranslatePlural.forEach((element) => {
        const translationKey = element.dataset.translationKeyPlural;
        const count = parseInt(element.dataset.numberForTranslate, 10);
        /* eslint-disable  no-param-reassign */
        element.textContent = t(translationKey, { count });
        /* eslint-enable  no-param-reassign */
      });
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

const buildPostList = (watchedState, i18n) => {
  const postList = watchedState.posts
    .filter((post) => watchedState.activeSourceId === post.sourceId)
    .map((post) => buildPostCard(
      watchedState,
      post.title,
      post.description,
      post.id,
      i18n,
    ));
  return postList;
};

const buildRssList = (watchedState) => {
  const rssList = watchedState.rssSources.map((rssSource) => {
    const isRssActive = watchedState.activeSourceId === rssSource.id;
    const nubmerOfUnreadPosts = getNumberOfUnreadPosts(
      watchedState,
      rssSource.id,
    );
    // console.log('source', rssSource);
    const rssCard = buildRssSourceCard(
      isRssActive,
      rssSource.id,
      rssSource.title,
      rssSource.description,
      nubmerOfUnreadPosts,
    );
    // console.log('rssCard',rssCard)
    return rssCard;
  });
  return rssList;
};

const renderStartPage = (i18n) => {
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
  p.textContent = i18n.t('startPageContent.title');

  container.appendChild(img);
  container.appendChild(p);
  rssContent.innerHTML = '';
  rssContent.appendChild(container);
};

const renderRssContent = (watchedState, i18n, elements) => {
  if (!watchedState.activeSourceId) {
    renderStartPage(i18n);
    return;
  }

  const { postListContainer, postListOverflowContainer } = elements.postList;
  const { rssListContainer, rssListOverflowContainer } = elements.rssList;

  const rssContent = document.querySelector('[name="rss-content"]');
  const rssList = buildRssList(watchedState);
  const postList = buildPostList(watchedState, i18n);
  postListOverflowContainer.innerHTML = '';
  rssListOverflowContainer.innerHTML = '';
  postList.forEach((post) => postListOverflowContainer.appendChild(post));
  rssList.forEach((rss) => rssListOverflowContainer.appendChild(rss));

  rssContent.innerHTML = '';
  rssContent.appendChild(rssListContainer);
  rssContent.appendChild(postListContainer);
};

const updateNotificationContainerForPostList = (
  notificationContainer,
  numberOfLastUpdates,
  i18n,
) => {
  const badge = notificationContainer.querySelector('[name="badge"]');
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
  const rssSourceCard = rssSourceList.querySelector(
    `[data-source-id="${rssSourceId}"]`,
  );
  let badgeForShowingNumberOfUnreadPosts = rssSourceCard.querySelector('[name="badge"]');
  if (!badgeForShowingNumberOfUnreadPosts) {
    const numberOfUnreadPosts = getNumberOfUnreadPosts(
      watchedState,
      rssSourceId,
    );
    badgeForShowingNumberOfUnreadPosts = buildBadgeForShowingNumberOfUnreadPosts(
      i18n,
      numberOfUnreadPosts,
    );
    const badgeWrapper = rssSourceCard.querySelector('[name="badge-wrapper"]');
    badgeWrapper.prepend(badgeForShowingNumberOfUnreadPosts);
    return;
  }
  const unreadPostsNumber = parseInt(badgeForShowingNumberOfUnreadPosts.textContent, 10);
  badgeForShowingNumberOfUnreadPosts.textContent = unreadPostsNumber + numberOfNewPosts;
};

const renderNotificationContainerForPostList = (
  watchedState,
  rssSourceId,
  numberOfNewPosts,
  i18n,
  elements,
) => {
  const {
    postList: { postListOverflowContainer },
  } = elements;
  if (rssSourceId === watchedState.activeSourceId) {
    let notificationContainer = document.querySelector(
      '[name="notifications-for-post-list"]',
    );
    if (!notificationContainer) {
      notificationContainer = buildNotificationContainerForPostList(
        numberOfNewPosts,
        i18n,
      );
      notificationContainer.addEventListener('click', () => (
        renderRssContent(watchedState, i18n, elements)
      ));
    } else {
      updateNotificationContainerForPostList(
        notificationContainer,
        numberOfNewPosts,
        i18n,
      );
    }
    postListOverflowContainer.prepend(notificationContainer);
  }
};

const renderUpdates = (
  watchedState,
  currentPosts,
  previousPosts,
  i18n,
  elements,
) => {
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
    elements,
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
  const { name, message } = error;
  const toast = buildToastForShowingErrors(name, message);
  const displayTime = 5000;
  const body = document.querySelector('body');
  body.prepend(toast);
  setTimeout(() => {
    toast.remove();
  }, displayTime);
};

const updateRssCardAfterReading = (card) => {
  const badge = card.querySelector('[name="badge"]');
  const numberOfUnreadPosts = parseInt(badge.textContent, 10);
  if (numberOfUnreadPosts === 1) {
    badge.remove();
    return;
  }
  badge.textContent = numberOfUnreadPosts - 1;
};

const updatePostCardAfterReading = (card) => {
  const newLabel = card.querySelector('[name="badge"]');
  const markAsReadLink = card.querySelector('[name="mark-as-read-link"]');
  const cardTitle = card.querySelector('[name="post-title"]');

  newLabel.remove();
  markAsReadLink.remove();
  cardTitle.classList.replace('font-weight-bold', 'font-weight-normal');
};

const updateRssAndPostCardsAfterReading = (watchedState, postIds) => {
  const arrFromSet = Array.from(postIds);
  const postId = arrFromSet[arrFromSet.length - 1];

  const postCard = document.querySelector(`[data-post-card-id="${postId}"]`);
  updatePostCardAfterReading(postCard);

  const post = _.find(watchedState.posts, { id: postId });
  const { sourceId } = post;
  const rssSourceCard = document.querySelector(`[data-source-id="${sourceId}"]`);
  updateRssCardAfterReading(rssSourceCard);
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
        renderRssContent(watchedState, i18n, elements);
        break;
      case 'activeSourceId':
        if (prevValue) {
          renderRssContent(watchedState, i18n, elements);
        }
        break;
      case 'language':
        changeLanguage(currentValue, i18n);
        break;
      case 'error':
        renderErrorAlert(currentValue);
        break;
      case 'posts':
        renderUpdates(watchedState, currentValue, prevValue, i18n, elements);
        break;
      case 'readPostIDs':
        if (currentValue.size > prevValue.size) {
          updateRssAndPostCardsAfterReading(watchedState, currentValue);
        }
        break;
      default:
        break;
    }
  });
  return watchedState;
};
