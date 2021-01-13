import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18n from 'i18next';

import initView from './view';
import resources from './locales/index';

const removeTrailingSlash = (url) => {
  if (url.endsWith('/')) {
    return url.slice(0, -1);
  }
  return url;
}

const getRssSourceData = (parsedRss) => {
  const title = parsedRss.querySelector('title').textContent;
  const description = parsedRss.querySelector('description').textContent;
  const link = parsedRss.querySelector('link').textContent;
  const id = _.uniqueId();
  return { title, description, link, id };
};

const getRssPostsData = (parsedRss, sourceId) => {
  const items = parsedRss.querySelectorAll('item');
  const posts = [];
  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    const pubDate = item.querySelector('pubDate').textContent;
    const date = new Date(pubDate);
    const id = _.uniqueId();
    posts.push({
      title,
      description,
      link,
      pubDate: date,
      sourceId,
      id,
      unread: true,
    });
  });
  return posts;
};

const parseStringToHtml = (rawStr, mimeType) => {
  const parser = new DOMParser();
  return parser.parseFromString(rawStr, mimeType);
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
      .matches(/.(rss|xml)($|\/$)/, i18n.t('errors.formValidation.itsNotRss'))
      .test(
        'Existing link',
        i18n.t('errors.formValidation.rssAlreadyExists'),
        (enteredLink) =>  !watchedState.rssLinks.includes(
            removeTrailingSlash(enteredLink)
          )
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
    watchedState.form.valid = !!!error;
    watchedState.form.error = error;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.processState = 'sending';

    const data = new FormData(e.target);
    const rssLink = removeTrailingSlash(data.get('rss-link'));
    const proxy = 'https://api.allorigins.win/get?url=';

    axios
      .get(`${proxy}${rssLink}`)
      .then((response) => {
        watchedState.form.fields.input = '';
        watchedState.form.processState = 'filling';

        const parsedRss = parseStringToHtml(response.data.contents, 'text/xml');
        const newSource = getRssSourceData(
          parsedRss,
          watchedState.activeSourceId
        );
        if (!watchedState.activeSourceId) {
          watchedState.activeSourceId = newSource.id;
        }
        const postsOfNewSource = getRssPostsData(parsedRss, newSource.id);
        return { newSource, postsOfNewSource };
      })
      .then(({ newSource, postsOfNewSource }) => {
        watchedState.posts = [...watchedState.posts, ...postsOfNewSource];
        watchedState.rssSources = [...watchedState.rssSources, newSource];
        watchedState.rssLinks = [...watchedState.rssLinks, rssLink];
        return { newSource, updatedPosts };
      })
      .catch((err) => console.log());
  });
};
