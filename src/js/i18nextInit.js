import i18next from 'i18next';
import resources from './locales/index.js';

/* eslint-disable  import/no-mutable-exports */
export let i18nInstance;
/* eslint-enable  import/no-mutable-exports */

export default async () => {
  if (!i18nInstance) {
    i18nInstance = i18next.createInstance();
    await i18nInstance.init({
      lng: 'en',
      resources,
    });
  }
};
