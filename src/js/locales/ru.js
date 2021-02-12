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
    notificationForPostList: {
      beforeBadge: 'Показать',
      afterBadge: {
        after_0: 'новую запись',
        after_1: 'новые записи',
        after_2: 'новых записей',
      },
    },
    post: {
      btn: 'Посмотреть',
      markAsRead: 'Отметить прочитанным',
      new: 'НОВОЕ!',
    },
    modal: {
      closeBtn: 'Закрыть',
      openBtn: 'Перейти',
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
      isNotSupported: 'Этот ресурс не поддерживается',
    },
  },
};
