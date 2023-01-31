"use strict";
const express = require('express');
const app = express();
const path = require('path');
const { engine } = require('express-handlebars');
const PORT = 3000;
const classUser = require('./middleware/user');
const routes = require('./routes/index.route');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../views'));
app.use('/public', express.static(path.join(__dirname, '../public')));
routes(app);
app.listen(PORT, () => {
    console.warn("SERVER UP PORT " + PORT);
});
