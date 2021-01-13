export default {
  translation: {
    languages: {
      en: 'English',
      ru: 'Русский',
    },
    header: {
      title: 'RSS-агрегатор',
      subtitle: 'Начните читать RSS сегодня!',
      form: {
        placeholder: 'RSS-ссылка',
        btn: 'Добавить',
        hint:
          'Например: https://ru.hexlet.io/lessons.rss или https://testdriven.io/feed.xml',
      },
    },
    post: {
      btn: 'Посмотреть',
      markAsRead: 'Отметить прочитанным',
      new: 'НОВОЕ!',
    },
    startPageContent: {
      title: 'Какие ресурсы вы бы хотели отслеживать?',
    },
    errors: {
      formValidation: {
        url: 'Ввод должен быть действительным url-адресом',
        itsNotRss: 'Этот источник не содержит допустимого rss',
        required: 'Поле не может быть пустым',
      },
    },
  },
};
