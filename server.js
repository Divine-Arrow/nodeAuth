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

const secret = process.env.EXPRESS_SESSION_SECRET || '123456789';
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// intialize client session as middleware
app.use(sessions({
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: Date.now() + (1 * 60 * 1000)
    },
    httpOnly: true,
    ephemeral: true
}));

app.use((req, res, next) => {
    if (req.session && req.session.user) {
        res.locals.isAuthenticated = true;
    } else {
        res.locals.isAuthenticated = false;
    }
    next();
})

// ejs.delimiter = '?';

app.get('/', (req, res) => {
    res.render('home', {
        title: 'Home'
    });
})

app.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', {
        title: 'Login'
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.locals.isAuthenticated = false;
    res.render('login', {
        title: 'Login'
    });
});

app.post('/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    User.findOne({
        email: body.email.toLowerCase()
    }).then((user) => {
        if (!user) {
            return res.render('login', {
                message: `This "${body.email}" email is not registered with us.`,
                messageType: 'danger',
                title: 'login'
            });
        } else if (!bcrypt.compareSync(body.password, user.password)) {
            return res.render('login', {
                message: 'Invalid email or password',
                messageType: 'danger',
                title: 'login'
            });
        }
        req.session.user = user._id;
        res.redirect('/dashboard');
    }).catch((e) => {
        return res.status(400).render('login', {
            title: 'Login'
        });
    });
});

app.get('/register', (req, res) => {
    if (res.locals.isAuthenticated) {
        return res.redirect('/dashboard');
    }
    res.render('register', {
        title: 'Register'
    });
});

app.get('/dashboard', (req, res) => {
    if (!req.session && !req.session.user) {
        return res.redirect(401, '/login');
    }
    User.findById(req.session.user).then((user) => {
        if (!user) {
            return res.redirect('/login');
        }
        console.log('*******find', user);
        res.locals.userProfile = {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email
        }
        // res.locals.userName = `${user.firstName} ${user.lastName}`;
        res.render('dashboard', {
            title: 'Dashboard'
        });
    }).catch((e) => {
        return res.redirect('/login')
    });

});


app.post('/register', (req, res) => {

    var body = _.pick(req.body, ['firstName', 'lastName', 'email', 'password']);
    body.email = body.email.toLowerCase();
    body.password = bcrypt.hashSync(body.password, 8);
    var newUser = new User(body);
    newUser.save().then((result) => {
        if (!result) {
            return res.status(400).render('register', {
                title: 'register'
            });
        }
        res.render('login', {
            title: 'login',
            message: 'Registered Sucessfully.',
            messageType: 'success'
        });
    }).catch((e) => {
        if (e.code === 11000) {
            res.status(400).render('register', {
                message: 'Email already exist.',
                messageType: 'danger',
                title: 'register'
            });
        } else if (e) {
            res.render('register', {
                title: 'register',
                message: 'Something Went wrong..',
                messageType: 'danger'
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is started at ${port}`)
});

//  fix danger and siccess message