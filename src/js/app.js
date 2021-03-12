import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';

import initI18Next from './i18nextInit.js';
import initView from './view.js';
import parseRss from './parser.js';
import { normalizeURL, wrapUrlInCorsProxy } from './utils.js';

const checkUpdates = (watchedState) => {
  const timeoutDelay = 5000;
  const updatePromises = watchedState.rssSources.map((rssSource) => {
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
        return newPosts;
      })
      .catch();
  });

  Promise.allSettled(updatePromises)
    .then((updates) => {
      updates
        .forEach((update) => {
          if (update.status === 'rejected') return;
          /* eslint-disable  no-param-reassign */
          watchedState.posts.unshift(...update.value);
          /* eslint-enable  no-param-reassign */
        });
    })
    .finally(() => {
      if (watchedState.rssSources.length > 0) {
        setTimeout(() => checkUpdates(watchedState), timeoutDelay);
      }
    });
};

const setValidationLocale = () => {
  yup.setLocale({
    string: {
      url: 'errors.formValidation.url',
      notOneOf: 'errors.formValidation.rssAlreadyExists',
    },
    mixed: {
      required: 'errors.formValidation.required',
    },
  });
};

const validateRssLink = (rssSources, formFields) => {
  const existingRssLinks = rssSources.map(
    (rssSource) => rssSource.link,
  );
  const schema = yup.object().shape({
    input: yup
      .string()
      .url()
      .required()
      .notOneOf(existingRssLinks),
  });

  try {
    schema.validateSync(formFields);
    return null;
  } catch (e) {
    return e.errors[0];
  }
};

export default () => {
  initI18Next();
  setValidationLocale();

  const state = {
    form: {
      valid: false,
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
    language: 'en',
  };

  const submit = document.getElementById('add-content-btn');
  const input = document.getElementById('rss-input');
  const form = document.getElementById('rss-form');
  const elements = { submit, input, form };
  const watchedState = initView(state, elements);
  const changeLangBtns = document.querySelectorAll('[name="change-language"]');

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
    const error = validateRssLink(watchedState.rssSources, watchedState.form.fields);
    watchedState.form.valid = !error;
    watchedState.form.error = error;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.processState = 'sending';

    const data = new FormData(e.target);
    const rssLink = normalizeURL(data.get('rss-link'));
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
        if (watchedState.rssSources.length === 1) {
          setTimeout(() => checkUpdates(watchedState), 5000);
        }
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
};
