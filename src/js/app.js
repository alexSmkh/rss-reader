import * as yup from 'yup';
import axios from 'axios';
import initView from './view';


const validateRssLink = (formFields) => {
  const schema = yup.object().shape({
    input: yup
      .string()
      .url()
      .matches(/.(rss|xml)$/, 'This source doesn\'t contain valid rss')
      .required()
  });

  try {
    schema.validateSync(formFields, { abortEarly: false });
    return null;
  } catch (e) {
    return e.errors[0];
  }
}

export default async () => {
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
    posts: [],
    contentSectionState: 'startPage', // rssList 
  };

  const submit = document.getElementById('add-content-btn');
  const input = document.getElementById('rss-link-input');
  const form = document.getElementById('rss-link-form');
  const elements = { submit, input, form }; 
  const watchedState = initView(state, elements);

  input.addEventListener('input', (e) => {
    e.preventDefault();
    const rssLink = e.target.value;
    watchedState.form.input = rssLink;
    const error = validateRssLink(watchedState.form, state);
    watchedState.form.error = error;

    if (watchedState.form.error) {
      watchedState.form.valid = false;
      return;
    }

    watchedState.form.valid = true;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const rssLink = data.get('rss-link');
    watchedState.form.processState = 'sending';

    axios
      .get(rssLink)
      .then((response) => {
        console.log(response);
      })
  })
};
