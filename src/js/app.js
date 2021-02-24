import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18n from 'i18next';

import initView from './view';
import resources from './locales/index';
import parseRss from './parser';
import { removeTrailingSlash, wrapUrlInCorsProxy } from './utils';

const checkUpdates = (watchedState) => {
  let timeoutDelay = 5000;
  watchedState.rssSources.forEach((rssSource) => {
    const proxyUrl = wrapUrlInCorsProxy(rssSource.link);
    axios
      .get(proxyUrl)
      .then((response) => {
        const { posts: postsFromLastRequest } = parseRss(
          response.data.contents,
          'text/xml'
        );

        const oldPostLinks = watchedState.posts.reduce((acc, post) => {
          if (post.sourceId === rssSource.id) {
            return [...acc, post.link];
          }
          return acc;
        }, []);

        const newPosts = postsFromLastRequest
          .filter(
            (postFromLastRequest) =>
              !oldPostLinks.includes(postFromLastRequest.link)
          )
          .map((newPost) => ({
            ...newPost,
            id: _.uniqueId(),
            sourceId: rssSource.id,
            unread: true,
          }));
        return { rssSourceId: rssSource.id, newPosts };
      })
      .then((update) => {
        if (update.newPosts.length > 0) {
          /* eslint-disable  no-param-reassign */
          watchedState.posts.unshift(...update.newPosts);
          watchedState.updates = update;
        }
        timeoutDelay = 5000;
      })
      .catch(() => {
        timeoutDelay *= 2;
      });
  });
  setTimeout(() => checkUpdates(watchedState), timeoutDelay);
};

const buildValidateSchema = (watchedState) => {
  yup.setLocale({
    string: {
      url: i18n.t('errors.formValidation.url'),
    },
    mixed: {
      required: i18n.t('errors.formValidation.required'),
    },
  });

  const schema = yup.object().shape({
    input: yup
      .string()
      .url()
      .required()
      .test(
        'The existing link',
        i18n.t('errors.formValidation.rssAlreadyExists'),
        (enteredLink) =>
          !watchedState.rssLinks.includes(removeTrailingSlash(enteredLink))
      ),
  });

  return schema;
};

const validateRssLink = (watchedState, schema) => {
  try {
    schema.validateSync(watchedState.form.fields);
    return null;
  } catch (e) {
    return e.errors[0];
  }
};

export default async () => {
  i18n.init({
    lng: 'en',
    resources,
  });
  const state = {
    form: {
      valid: true,
      processState: 'filling',
      fields: {
        input: '',
      },
      error: null,
    },
    rssLinks: [],
    rssSources: [],
    activeSourceId: null,
    posts: [],
    unreadPostIDs: [],
    updates: [],
    language: 'en',
  };

  const submit = document.getElementById('add-content-btn');
  const input = document.getElementById('rss-input');
  const form = document.getElementById('rss-form');
  const elements = { submit, input, form };
  const watchedState = initView(state, elements);
  const changeLangBtns = document.querySelectorAll('[name="change-language"]');
  const validateSchema = buildValidateSchema(watchedState);

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
    const error = validateRssLink(watchedState, validateSchema);
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
        if (!parsedRss) {
          throw new Error(i18n.t('errors.isNotSupported'));
        }
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
            unread: true,
          };
        });

        return { newSource, postsOfNewSource };
      })
      .then(({ newSource, postsOfNewSource }) => {
        watchedState.posts.push(...postsOfNewSource);
        watchedState.rssSources.push(newSource);
        watchedState.rssLinks.push(rssLink);
      })
      .catch((err) => {
        if (err.message === i18n.t('errors.isNotSupported')) {
          watchedState.form.error = err.message;
          watchedState.form.processState = 'failed';
          watchedState.form.valid = false;
          return;
        }
        watchedState.form.processState = 'failed';
        watchedState.error = err;
      });
  });

  checkUpdates(watchedState);
};
