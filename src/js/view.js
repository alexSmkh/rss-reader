import onChange from 'on-change';
import _ from 'lodash';

const renderErrors = (error, elements) => {
  const { input } = elements;

  const prevFeedback = input.nextSibling;
  if (prevFeedback) {
    prevFeedback.remove();
  } 
  
  if (!error) {
    input.classList.remove('is-invalid');
    return;
  }

  const feedback = document.createElement('div');
  feedback.classList.add('invalid-feedback');
  feedback.textContent = _.capitalize(error);

  input.classList.add('is-invalid');
  input.after(feedback);
};

const renderContentSection = (state) => {
  if (state.contentSectionState === 'startPage') {

  } else if (state.contentSectionState === 'rssList') {

  }
}

const processStateHandler = (processState, elements) => {
  const { submit } = elements;
  switch (processState) {
    case 'filling':
      submit.disabled = false;
      break;
    case 'sending':
      submit.disabled = true;
      break;
    case 'failed':
      submit.disabled = false;
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};

export default (state, elements) => {
  const { submit } = elements;
  return onChange(state, (path, value) => {
    switch (path) {
      case 'form.processState':
        processStateHandler(value, elements);
        break;
      case 'form.valid':
        submit.disabled = !value;
        break;
      case 'form.error':
        renderErrors(value, elements);
        break;
      case 'rssSources':
        break;
      case 'posts':
        break;
      case 'contentSectionState':
        renderContentSection(state);
        break;
      default:
        break;
    }
  });
}