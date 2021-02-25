import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18n from 'i18next';

import initView from './view.js';
import resources from './locales/index.js';
import parseRss from './parser.js';
import { removeTrailingSlash, wrapUrlInCorsProxy } from './utils.js';

const checkUpdates = (watchedState) => {
  const timeoutDelay = 5000;
  watchedState.rssSources.forEach((rssSource) => {
    const proxyUrl = wrapUrlInCorsProxy(rssSource.link);
    axios
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
        return { rssSourceId: rssSource.id, newPosts };
      })
      .then((update) => {
        if (update.newPosts.length > 0) {
          /* eslint-disable  no-param-reassign */
          watchedState.posts.unshift(...update.newPosts);
          watchedState.updates = update;
          /* eslint-enable  no-param-reassign */
        }
      })
      .catch();
  });
  setTimeout(() => checkUpdates(watchedState), timeoutDelay);
};

const setValidationLocale = () => {
  yup.setLocale({
    string: {
      url: 'errors.formValidation.url',
    },
    mixed: {
      required: 'errors.formValidation.required',
    },
  });
};

const validateRssLink = (watchedState) => {
  const existingRssLinks = watchedState.rssSources.map((rssSource) => rssSource.link);
  const schema = yup.object().shape({
    input: yup
      .string()
      .url()
      .required()
      .notOneOf(
        existingRssLinks,
        'errors.formValidation.rssAlreadyExists',
      ),
  });

  try {
    schema.validateSync(watchedState.form.fields);
    return null;
  } catch (e) {
    return e.errors[0];
  }
};

export default () => {
  i18n
    .init({
      lng: 'en',
      resources,
    })
    .then(() => {
      setValidationLocale();

      const state = {
        form: {
          valid: true,
          processState: 'filling',
          fields: {
            input: '',
          },
          error: null,
        },
        rssSources: [],
        activeSourceId: null,
        posts: [],
        readPostIDs: [],
        updates: [],
        language: 'en',
      };

      const submit = document.getElementById('add-content-btn');
      const input = document.getElementById('rss-input');
      const form = document.getElementById('rss-form');
      const elements = { submit, input, form };
      const watchedState = initView(state, elements);
      const changeLangBtns = document.querySelectorAll(
        '[name="change-language"]',
      );

      changeLangBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const lang = e.target.getAttribute('data-lang');
          if (lang === watchedState.language) return;
          watchedState.language = lang;
        });
      });

      input.addEventListener('input', (e) => {
        e.preventDefault();
        const rssLink = e.target.value;
        watchedState.form.fields.input = rssLink;
        const error = validateRssLink(watchedState);
        watchedState.form.valid = !error;
        watchedState.form.error = error;
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.form.processState = 'sending';

        const data = new FormData(e.target);
        const rssLink = removeTrailingSlash(data.get('rss-link'));
        const proxyUrl = wrapUrlInCorsProxy(rssLink);
        axios
          .get(proxyUrl)
          .then((response) => {
            const parsedRss = parseRss(response.data.contents, 'text/xml');
            watchedState.form.fields.input = '';
            watchedState.form.processState = 'filling';
            const newSource = {
              ...parsedRss.source,
              id: _.uniqueId(),
              link: rssLink,
            };
            if (!watchedState.activeSourceId) {
              watchedState.activeSourceId = newSource.id;
            }
            const postsOfNewSource = parsedRss.posts.map((post) => {
              const id = _.uniqueId();
              return {
                ...post,
                sourceId: newSource.id,
                id,
              };
            });

            return { newSource, postsOfNewSource };
          })
          .then(({ newSource, postsOfNewSource }) => {
            watchedState.posts.push(...postsOfNewSource);
            watchedState.rssSources.push(newSource);
          })
          .catch((err) => {
            if (err.message === 'parse error') {
              watchedState.form.error = 'errors.isNotSupported';
              watchedState.form.processState = 'failed';
              watchedState.form.valid = false;
              return;
            }
            watchedState.form.processState = 'failed';
            watchedState.error = err;
          });
      });

      checkUpdates(watchedState);
    });
};
