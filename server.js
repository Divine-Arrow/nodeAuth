const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const sessions = require('express-session');
const bcrypt = require('bcryptjs');

const {
    mongoose
} = require('./db/db');
const {
    User
} = require('./models/user');

const app = express();


app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// intialize client session as middleware
app.use(sessions({
    secret: 'encryptionPassword@123',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: Date.now() + (1*60*1000)
    }
}));

app.get('/', (req, res) => {
    res.render('home', {
        title: 'Home'
    });
})

app.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login',
        error: {
            code: 200
        }
    });
});

app.post('/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    User.findOne({
        email: body.email.toLowerCase()
    }).then((user) => {
        if (!user) {
            return res.render('login', {
                error: {
                    code: 404,
                    message: `this "${body.email}" email is not registered with us.`
                },
                title: 'login'
            });
        } else if (!bcrypt.compareSync(body.password, user.password)) {
            return res.render('login', {
                error: {
                    code: 404,
                    message: 'invalid email or password'
                },
                title: 'login'
            });
        }
        req.session.user = user._id;
        res.redirect('/dashboard');
    }).catch((e) => {
        return res.status(400).render('login', {
            error: {
                code: 400
            },
            title: 'Login'
        });
    });
});

app.get('/register', (req, res) => {
    res.render('register', {
        error: {
            code: 200
        },
        title: 'Register'
    });
});

app.get('/dashboard', (req, res) => {
    if (!req.session && !req.session.user) {
        return res.redirect(401, '/login');
    }
    res.render('dashboard', {
        title: 'Dashboard'
    });
});


app.post('/register', (req, res) => {

    var body = _.pick(req.body, ['firstName', 'lastName', 'email', 'password']);
    body.email = body.email.toLowerCase();
    body.password = bcrypt.hashSync(body.password, 14);
    var newUser = new User(body);
    newUser.save().then((result) => {
        if (!result) {
            return res.status(400).render('register', {
                error: {
                    code: 200
                },
                title: 'register'
            });
        }
        res.render('login', {
            title: 'login',
            error: {
                code: 200
            },
            successMessage: 'Registered Sucessfully.'
        });
    }).catch((e) => {
        if (e.code === 11000) {
            res.status(400).render('register', {
                error: {
                    code: 11000,
                    message: 'email already exist.'
                },
                title: 'register'
            });
        } else if (e) {
            res.render('register', {
                error: {
                    code: 200
                },
                title: 'register'
            });
        }
    });
});

app.listen(3000, () => {
    console.log('server is started..!')
});