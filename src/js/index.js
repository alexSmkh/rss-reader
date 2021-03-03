import 'bootstrap/js/dist/util.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style.css';
import app from './app.js';
import initApp from './init.js';

initApp()
  .then((state) => app(state));
