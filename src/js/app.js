import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import initView from './view';

const getRssSourceData= (parsedRss) => {
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
    activeSourceId: null,
    posts: [],
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
    watchedState.form.processState = 'sending';
    
    const data = new FormData(e.target);
    const rssLink = data.get('rss-link');
    const proxy = 'https://api.allorigins.win/get?url=';
    
    axios
      .get(`${proxy}${rssLink}`)
      .then((response) => {
        watchedState.form.fields.input = '';
        watchedState.form.processState = 'filling';
        
        const parsedRss = parseStringToHtml(response.data.contents, 'text/xml');
        const newSource = getRssSourceData(parsedRss, watchedState.activeSourceId);
        if (!watchedState.activeSourceId) {
          watchedState.activeSourceId = newSource.id;
        }
        const postsOfNewSource = getRssPostsData(parsedRss, newSource.id);
        return { newSource, postsOfNewSource};
      })
      .then(({ newSource, postsOfNewSource }) => {
        watchedState.posts = [...watchedState.posts, ...postsOfNewSource];
        watchedState.rssSources = [...watchedState.rssSources, newSource];
        watchedState.contentSectionState = 'rss-list';
        return { newSource, updatedPosts };
      })
      .catch((err) => console.log());
  })
};
