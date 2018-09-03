var mongoose = require('mongoose');

var User = mongoose.model('User', {
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
    },
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
    }
});

module.exports = {User}
