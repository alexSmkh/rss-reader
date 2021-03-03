import i18n from 'i18next';
import * as yup from 'yup';

import resources from './locales/index.js';

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

const initI18Next = () => (
  i18n.init({
    lng: 'en',
    resources,
  })
);

export default () => {
  setValidationLocale();
  return Promise.all([initI18Next()]).then(() => {
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
      updates: [],
      language: 'en',
      checkingUpdates: false,
    };
    return state;
  });
};
