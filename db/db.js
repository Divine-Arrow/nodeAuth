const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/userData', { useNewUrlParser: true});

module.exports = {mongoose}