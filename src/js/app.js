import i18next from 'i18next';
import _ from 'lodash';
import resources from './locales/index.js';

import initView from './view.js';
import { buildPostListContainer, buildRssListContainer } from './components.js';
import { handleFormInput, handleFormSubmit } from './handlers.js';
import { setValidationLocale } from './validation.js';

const initI18NextInstance = (lng) => {
  const i18nextInstance = i18next.createInstance();
  return i18nextInstance.init({
    lng,
    resources,
  });
};

const initDOMElements = () => {
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
  const elements = initDOMElements();
  const watchedState = initView(state, elements, i18n);
  const { input, form, changeLangBtns } = elements;

  changeLangBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const lang = e.target.getAttribute('data-lang');
      if (lang === watchedState.language) return;
      watchedState.language = lang;
    });
  });

  input.addEventListener('input', handleFormInput(watchedState));
  form.addEventListener('submit', handleFormSubmit(watchedState, elements));
};

export default () => {
  setValidationLocale();

  const defaultLanguage = 'en';
  const languages = ['en', 'ru'];

  const promises = languages.map(initI18NextInstance);
  return Promise.all(promises).then((i18nInstaces) => {
    const i18n = _.zipObject(languages, i18nInstaces);
    const initialTranslateInstance = i18n[defaultLanguage];
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
      language: defaultLanguage,
    };
    runApp(state, i18n);
  });
};
