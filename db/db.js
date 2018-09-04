const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var db = process.env.MONGODB_URI || 'mongodb://localhost/userData';
mongoose.connect('mongodb://localhost/userData', { useNewUrlParser: true});

module.exports = {mongoose}