import * as yup from 'yup';

export const setValidationLocale = () => {
  yup.setLocale({
    string: {
      url: 'errors.formValidation.url',
    },
    mixed: {
      required: 'errors.formValidation.required',
      notOneOf: 'errors.formValidation.rssAlreadyExists',
    },
  });
};

export const validate = (urlList, url) => {
  const schema = yup.object().shape({
    url: yup.string().url().required().notOneOf(urlList),
  });

  try {
    schema.validateSync({ url });
    return null;
  } catch (e) {
    return e.errors[0];
  }
};
