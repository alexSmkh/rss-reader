import axios from 'axios';
import _ from 'lodash';

import parseRss from './parser.js';
import { wrapUrlInCorsProxy, normalizeURL } from './utils.js';
import { validate } from './validation.js';

const checkUpdates = (watchedState) => {
  if (!watchedState.isUpdateProcessRunning) return;
  const timeoutDelay = 5000;
  const promises = watchedState.rssSources.map((rssSource) => {
    const proxyUrl = wrapUrlInCorsProxy(rssSource.link);
    return axios
      .get(proxyUrl)
      .then((response) => {
        const { posts: postsFromLastRequest } = parseRss(
          response.data.contents,
        );
        const newPostsFromLastRequest = _.differenceBy(
          postsFromLastRequest,
          watchedState.posts,
          'link',
        );
        const newPosts = newPostsFromLastRequest.map((post) => ({
          ...post,
          id: _.uniqueId(),
          sourceId: rssSource.id,
        }));
        return newPosts;
      })
      .catch(() => {});
  });

  Promise.all(promises)
    .then((updates) => {
      updates.forEach((update) => {
        if (update) {
          /* eslint-disable  no-param-reassign */
          watchedState.posts.unshift(...update);
          /* eslint-enable  no-param-reassign */
        }
      });
    })
    .finally(() => {
      setTimeout(() => {
        if (watchedState.rssSources.length > 0) {
          checkUpdates(watchedState);
        } else {
          /* eslint-disable  no-param-reassign */
          watchedState.isUpdateProcessRunning = false;
          /* eslint-enable  no-param-reassign */
        }
      }, timeoutDelay);
    });
};

export const handleFormInput = (watchedState) => (e) => {
  e.preventDefault();
  const rssLink = e.target.value;
  /* eslint-disable  no-param-reassign */
  watchedState.form.fields.input = rssLink;
  /* eslint-enable  no-param-reassign */
  const existingRssLinks = watchedState.rssSources.map(
    (rssSource) => rssSource.link,
  );
  const error = validate(existingRssLinks, rssLink);
  /* eslint-disable  no-param-reassign */
  watchedState.form.valid = !error;
  watchedState.form.error = error;
  /* eslint-enable  no-param-reassign */
};

export const handleFormSubmit = (watchedState, event) => {
  event.preventDefault();
  /* eslint-disable  no-param-reassign */
  watchedState.form.processState = 'sending';
  /* eslint-enable  no-param-reassign */

  const data = new FormData(event.target);
  const rssLink = normalizeURL(data.get('rss-link'));
  const proxyUrl = wrapUrlInCorsProxy(rssLink);
  axios
    .get(proxyUrl)
    .then((response) => {
      const parsedRss = parseRss(response.data.contents);
      /* eslint-disable  no-param-reassign */
      watchedState.form.fields.input = '';
      watchedState.form.processState = 'filling';
      /* eslint-enable  no-param-reassign */
      const newSource = {
        ...parsedRss.source,
        id: _.uniqueId(),
        link: rssLink,
      };
      if (!watchedState.activeSourceId) {
        /* eslint-disable  no-param-reassign */
        watchedState.activeSourceId = newSource.id;
        /* eslint-enable  no-param-reassign */
      }

      const postsOfNewSource = parsedRss.posts.map((post) => {
        const id = _.uniqueId();
        return {
          ...post,
          sourceId: newSource.id,
          id,
        };
      });

      watchedState.posts.push(...postsOfNewSource);
      watchedState.rssSources.push(newSource);
      setTimeout(() => {
        if (!watchedState.isUpdateProcessRunning) {
          /* eslint-disable  no-param-reassign */
          watchedState.isUpdateProcessRunning = true;
          /* eslint-enable  no-param-reassign */
          checkUpdates(watchedState);
        }
      }, 5000);
    })
    .catch((err) => {
      if (err.message === 'parse error') {
        /* eslint-disable  no-param-reassign */
        watchedState.form.error = 'errors.isNotSupported';
        watchedState.form.processState = 'failed';
        watchedState.form.valid = false;
      }
      if (err.isAxiosError) {
        watchedState.form.processState = 'failed';
        watchedState.error = err;
        /* eslint-enable  no-param-reassign */
      }
    });
};

export const handleSwitchLanguage = (watchedState) => (e) => {
  const languageToSwitch = e.target.getAttribute('data-lang');
  if (languageToSwitch === watchedState.language) return;
  /* eslint-disable  no-param-reassign */
  watchedState.language = languageToSwitch;
  /* eslint-enable  no-param-reassign */
};

const deleteRssSource = (watchedState, rssSourceIdForDelete) => {
  /* eslint-disable  no-param-reassign */
  const postsIDsOfRssSourceTarget = watchedState.posts
    .filter((post) => post.sourceId === rssSourceIdForDelete)
    .map((post) => post.id);
  watchedState.readPostIDs = new Set(
    _.difference(watchedState.readPostIDs, postsIDsOfRssSourceTarget),
  );

  const updatedRssSources = watchedState.rssSources.filter(
    (rssSource) => rssSource.id !== rssSourceIdForDelete,
  );

  const updatedPosts = watchedState.posts.filter(
    (post) => post.sourceId !== rssSourceIdForDelete,
  );

  watchedState.posts = updatedPosts;
  if (updatedRssSources.length === 0) {
    watchedState.activeSourceId = null;
    watchedState.isUpdateProcessRunning = false;
    watchedState.rssSources = [];
    return;
  }

  if (rssSourceIdForDelete === watchedState.activeSourceId) {
    watchedState.activeSourceId = updatedRssSources[0].id;
  }

  watchedState.rssSources = updatedRssSources;
  /* eslint-enable  no-param-reassign */
};

const switchActiveRssSource = (watchedState, idOfCardClicked) => {
  if (idOfCardClicked === watchedState.activeSourceId) return;
  /* eslint-disable  no-param-reassign */
  watchedState.activeSourceId = idOfCardClicked;
  /* eslint-enable  no-param-reassign */
};

const updateContentOfModalDialog = (title, description, link) => {
  const modal = document.getElementById('preview-modal');

  const modalTitle = modal.querySelector('.modal-title');
  modalTitle.textContent = title;

  const modalBodyContent = modal.querySelector('.modal-body > p');
  modalBodyContent.textContent = description;

  const openBtn = modal.querySelector('.modal-footer > a');
  openBtn.setAttribute('href', link);
};

export const handleClickOnRssList = (watchedState) => (e) => {
  const targetElement = e.target;
  const elementName = targetElement.getAttribute('name');
  if (elementName === 'delete-icon') {
    e.stopPropagation();
    const rssSourceIdForDelete = targetElement.dataset.delIconForRssId;
    deleteRssSource(watchedState, rssSourceIdForDelete);
    return;
  }

  const rssCard = targetElement.closest('[name="rss-source-card"]');
  const rssSourceId = rssCard.dataset.sourceId;
  switchActiveRssSource(watchedState, rssSourceId);
};

export const handleClickOnPostList = (watchedState) => (e) => {
  const targetElement = e.target;
  const targetElementName = targetElement.getAttribute('name');
  if (targetElementName === 'previewBtn') {
    const { postId } = targetElement.dataset;
    const post = _.find(watchedState.posts, { id: postId });
    const { title, description, link } = post;
    updateContentOfModalDialog(title, description, link);

    watchedState.readPostIDs.add(postId);
  } else if (targetElementName === 'mark-as-read-link') {
    const { postId } = targetElement.dataset;
    watchedState.readPostIDs.add(postId);
  }
};

export const handleMouseoverOnDeleteIcon = (e) => {
  const deleteIcon = e.target;
  deleteIcon.setAttribute('src', 'assets/images/x-circle-fill.svg');
};

export const handleMouseoutOnDeleteIcon = (e) => {
  const deleteIcon = e.target;
  deleteIcon.setAttribute('src', 'assets/images/x-circle.svg');
};

export const handleMouseEnterEventOnCard = (e) => {
  const card = e.target;
  card.classList.replace('shadow-sm', 'shadow');
  card.style.transition = 'box-shadow .5s';
  card.style.cursor = 'pointer';
  card.style.display = 'block';
};

export const handleMouseLeaveEventOnCard = (e) => {
  const card = e.target;
  card.classList.replace('shadow', 'shadow-sm');
  card.style.cursor = 'grab';
  card.style.transition = 'box-shadow .5s';
};

export const handleMouseEnterEventOnRssCard = (e) => {
  handleMouseEnterEventOnCard(e);
  const card = e.target;
  const deleteIcon = card.querySelector('[name="delete-icon"]');
  deleteIcon.style.display = 'block';
};

export const handleMouseLeaveEventOnRssCard = (e) => {
  handleMouseLeaveEventOnCard(e);
  const card = e.target;
  const deleteIcon = card.querySelector('[name="delete-icon"]');
  deleteIcon.style.display = 'none';
};

export const handleClosingToast = (e) => {
  const toast = e.target;
  toast.remove();
};
