import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18n from 'i18next';

import initView from './view';
import resources from './locales/index';
import parseRss from './parser';
import { removeTrailingSlash } from 'utils';

const corsProxy = 'https://hexlet-allorigins.herokuapp.com/get?url='; 

const checkUpdates = (watchedState) => {
  let timeoutDelay = 5000;
  watchedState.rssSources.forEach(async (rssSource) => {
    axios
      .get(`${corsProxy}${encodeURIComponent(rssSource.link)}`)
      .then((response) => {
        const parsedRss = parseRssContent(response.data.contents, 'text/xml');
        const lastUpdate = new Date(
          parsedRss.querySelector('pubDate').textContent,
        );
        if (rssSource.lastUpdate.getTime() >= lastUpdate.getTime()) return null;
        const posts = getRssPostsData(parsedRss, rssSource.id);
        const newPosts = posts.filter(
          (post) => (rssSource.lastUpdate.getTime() < post.pubDate.getTime()),
        );
        watchedState.posts.unshift(...newPosts);
        rssSource.lastUpdate = newPosts[0].pubDate;
        return { rssSourceId: rssSource.id, newPosts };
      })
      .then((update) => {
        if (update) {
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

const validateRssLink = (watchedState) => {
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
        (enteredLink) => (
          !watchedState.rssLinks.includes(removeTrailingSlash(enteredLink))
        ),
      ),
  });

  try {
    schema.validateSync(watchedState.form.fields, { abortEarly: false });
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
    updates: [],
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
    const error = validateRssLink(watchedState);
    watchedState.form.valid = !error;
    watchedState.form.error = error;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.processState = 'sending';

    const data = new FormData(e.target);
    const rssLink = removeTrailingSlash(data.get('rss-link'));

    axios
      .get(`${corsProxy}${encodeURIComponent(rssLink)}`)
      .then((response) => {
        const parsedRss = parseRss(response.data.contents, 'text/xml');
        watchedState.form.fields.input = '';
        if (!parsedRss) {
          throw new Error(i18n.t('errors.isNotSupported'));
        }
        watchedState.form.processState = 'filling';
        const newSource = parsedRss.source;
        if (!watchedState.activeSourceId) {
          watchedState.activeSourceId = newSource.id;
        }
        const postsOfNewSource = parsedRss.postList;
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
