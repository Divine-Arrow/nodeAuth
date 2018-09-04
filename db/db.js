const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var uriString = process.env.MONGODB_URI || 'mongodb://localhost/userData';

mongoose.connect(uriString);

module.exports = {mongoose}