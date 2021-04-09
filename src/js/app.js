import i18next from 'i18next';
import resources from './locales/index.js';

import initView from './view.js';
import { setValidationLocale } from './validation.js';
import {
  handleFormInput,
  handleFormSubmit,
  handleSwitchLanguage,
  handleClickOnRssContent,
} from './handlers.js';

const getDOMElements = () => {
  const submit = document.getElementById('add-content-btn');
  const input = document.getElementById('rss-input');
  const form = document.getElementById('rss-form');
  const languageSwitchBtnsContainer = document.querySelector(
    '[data-toggle="langs"]',
  );
  const rssContent = document.querySelector('[name="rss-content"]');

  return {
    submit,
    input,
    form,
    languageSwitchBtnsContainer,
    rssContent,
  };
};

const runApp = (state, i18n) => {
  const elements = getDOMElements();
  const watchedState = initView(state, elements, i18n);
  const {
    input,
    form,
    languageSwitchBtnsContainer,
    rssContent,
  } = elements;

  languageSwitchBtnsContainer.addEventListener(
    'click',
    handleSwitchLanguage(watchedState),
  );
  rssContent.addEventListener('click', handleClickOnRssContent(watchedState));
  input.addEventListener('input', handleFormInput(watchedState));
  form.addEventListener('submit', handleFormSubmit(watchedState));
};

export default () => {
  setValidationLocale();

  const defaultLanguage = 'en';
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    resources,
  });

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
    isUpdateProcessRunning: false,
  };
  runApp(state, i18nInstance);
};
