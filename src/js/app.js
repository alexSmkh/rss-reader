import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js';

import initView from './view.js';
import parseRss from './parser.js';
import { normalizeURL, wrapUrlInCorsProxy } from './utils.js';
import { buildPostListContainer, buildRssListContainer } from './components.js';

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

const setValidationLocale = () => {
  yup.setLocale({
    string: {
      url: 'errors.formValidation.url',
    },
    mixed: {
      required: 'errors.formValidation.required',
      notOneOf: 'errors.formValidation.rssAlreadyExists',
    },
  });
};

const validate = (urlList, url) => {
  const schema = yup.object().shape({
    url: yup.string().url().required().notOneOf(urlList),
  });

  try {
    schema.validateSync({ url });
    return null;
  } catch (e) {
    return e.errors[0];
  }
};

const initI18NextInstance = (lng) => {
  const i18nextInstance = i18next.createInstance();
  return i18nextInstance.init({
    lng,
    resources,
  });
};

const initElements = () => {
  const submit = document.getElementById('add-content-btn');
  const input = document.getElementById('rss-input');
  const form = document.getElementById('rss-form');
  const changeLangBtns = document.querySelectorAll('[name="change-language"]');
  const postList = buildPostListContainer();
  const rssList = buildRssListContainer();
  return {
    submit,
    input,
    form,
    changeLangBtns,
    postList,
    rssList,
  };
};

const runApp = (state, i18n) => {
  const elements = initElements();
  // console.log(elements);
  const watchedState = initView(state, elements, i18n);
  const { input, form, changeLangBtns } = elements;

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
    const existingRssLinks = watchedState.rssSources.map(
      (rssSource) => rssSource.link,
    );
    const error = validate(existingRssLinks, rssLink);
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
        }
        if (err.message === 'Network Error') {
          watchedState.form.processState = 'failed';
          watchedState.error = err;
        }
      });
  });
};

export default () => {
  setValidationLocale();
  const languages = ['en', 'ru'];
  const promises = languages.map(initI18NextInstance);
  return Promise.all(promises).then((i18nInstaces) => {
    const i18n = _.zipObject(languages, i18nInstaces);
    const initialTranslateInstance = i18n.en;
    i18n.t = initialTranslateInstance;

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
      readPostIDs: new Set(),
      language: 'en',
    };
    runApp(state, i18n);
  });
};
