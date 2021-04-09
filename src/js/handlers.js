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

export const handleFormInput = (watchedState) => (event) => {
  event.preventDefault();
  const rssLink = event.target.value;
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

export const handleFormSubmit = (watchedState) => (event) => {
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
      if (err.isRSSParsingError) {
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

export const handleSwitchLanguage = (watchedState) => (event) => {
  const languageToSwitch = event.target.getAttribute('data-lang');
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

const updateContentOfModalDialog = (title, description, link) => {
  const modal = document.getElementById('preview-modal');

  const modalTitle = modal.querySelector('.modal-title');
  modalTitle.textContent = title;

  const modalBodyContent = modal.querySelector('.modal-body > p');
  modalBodyContent.textContent = description;

  const openBtn = modal.querySelector('.modal-footer > a');
  openBtn.setAttribute('href', link);
};

export const handleClosingToast = (event) => {
  const toast = event.target;
  toast.remove();
};

const handleClickOnMarkAsReadLink = (watchedState, event) => {
  const { postId } = event.target.dataset;
  watchedState.readPostIDs.add(postId);
};

const handleClickOnPreviewButton = (watchedState, event) => {
  const { postId } = event.target.dataset;
  const post = _.find(watchedState.posts, { id: postId });
  const { title, description, link } = post;
  updateContentOfModalDialog(title, description, link);
  watchedState.readPostIDs.add(postId);
};

const handleClickOnDeleteIcon = (watchedState, event) => {
  event.stopPropagation();
  const rssSourceIdForDelete = event.target.dataset.delIconForRssId;
  deleteRssSource(watchedState, rssSourceIdForDelete);
};

const handleClickOnRssCard = (watchedState, card) => {
  const rssSourceId = card.dataset.sourceId;
  if (rssSourceId === watchedState.activeSourceId) return;
  /* eslint-disable  no-param-reassign */
  watchedState.activeSourceId = rssSourceId;
  /* eslint-enable  no-param-reassign */
};

export const handleClickOnRssContent = (watchedState) => (event) => {
  const elementName = event.target.getAttribute('name');
  if (elementName === 'delete-icon') {
    handleClickOnDeleteIcon(watchedState, event);
  } else if (elementName === 'preview-btn') {
    handleClickOnPreviewButton(watchedState, event);
  } else if (elementName === 'mark-as-read-link') {
    handleClickOnMarkAsReadLink(watchedState, event);
  } else {
    const card = event.target.closest('[name="rss-source-card"]');
    if (card) handleClickOnRssCard(watchedState, card);
  }
};
