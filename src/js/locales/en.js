export default {
  translation: {
    languages: {
      en: 'English',
      ru: 'Русский',
    },
    header: {
      title: 'RSS Reader',
      subtitle: 'Start reading RSS today!',
      form: {
        placeholder: 'RSS-link',
        hint:
          'Example: https://ru.hexlet.io/lessons.rss or https://testdriven.io/feed.xml',
        btn: {
          content: 'Add',
          loading: 'Loading...',
        },
        succeedFeedback: 'Rss has been loaded!',
      },
    },
    post: {
      btn: 'Preview',
      markAsRead: 'Mark as read',
      new: 'NEW!',
    },
    startPageContent: {
      title: 'Which sources would you like to follow?',
    },
    errors: {
      formValidation: {
        url: 'Input must be a valid url',
        itsNotRss: "This source doesn't contain valid rss",
        required: 'Input is a required field',
        rssAlreadyExists: 'The entered RSS source is already exist',
      },
    },
  },
};
