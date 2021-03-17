import axios from 'axios';
import _ from 'lodash';

import parseRss from './parser.js';
import { wrapUrlInCorsProxy, normalizeURL } from './utils.js';
import { validate } from './validation.js';

const checkUpdates = (watchedState) => {
  const timeoutDelay = 5000;
  watchedState.rssSources.forEach((rssSource) => {
    const proxyUrl = wrapUrlInCorsProxy(rssSource.link);
    return axios
      .get(proxyUrl)
      .then((response) => {
        const { posts: postsFromLastRequest } = parseRss(
          response.data.contents,
          'text/xml',
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
        watchedState.posts.unshift(...newPosts);
      })
      .catch()
      .finally(() => {
        if (watchedState.rssSources.length > 0) {
          setTimeout(() => checkUpdates(watchedState), timeoutDelay);
        }
      });
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

export const handleFormSubmit = (watchedState) => (e) => {
  e.preventDefault();
  /* eslint-disable  no-param-reassign */
  watchedState.form.processState = 'sending';
  /* eslint-enable  no-param-reassign */

  const data = new FormData(e.target);
  const rssLink = normalizeURL(data.get('rss-link'));
  const proxyUrl = wrapUrlInCorsProxy(rssLink);
  axios
    .get(proxyUrl)
    .then((response) => {
      const parsedRss = parseRss(response.data.contents, 'text/xml');
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
      if (watchedState.rssSources.length === 1) {
        setTimeout(() => checkUpdates(watchedState), 5000);
      }
    })
    .catch((err) => {
      if (err.message === 'parse error') {
        /* eslint-disable  no-param-reassign */
        watchedState.form.error = 'errors.isNotSupported';
        watchedState.form.processState = 'failed';
        watchedState.form.valid = false;
      }
      if (err.message === 'Network Error') {
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
