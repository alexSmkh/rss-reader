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
        btn: 'Add',
        hint:
          'Example: https://ru.hexlet.io/lessons.rss or https://testdriven.io/feed.xml',
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
      },
    },
  },
};
