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
        hint:
          'Например: https://ru.hexlet.io/lessons.rss или https://testdriven.io/feed.xml',
        btn: {
          content: 'Добавить',
          loading: 'Загрузка...',
        },
        succeedFeedback: 'Rss был загружен!',
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
        rssAlreadyExists: 'Введенный RSS-источник уже есть отслеживается',
      },
    },
  },
};
