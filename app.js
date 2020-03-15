const exp = require('express');
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

const app = exp();

//Passport config
require('./models/passport')(passport);

//DB Config
const db = require('./models/keys').MongoURI;

//Connect to MongoDB
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("MongoDB Connected sucessfully....!!!"))
    .catch(err => console.log("Error in connecting to database: "+err))


//body parser
app.use(bodyparser.urlencoded({extended: true}));

//Express Session
app.use(session({
    secret: 'abc',
    resave: false,
    saveUninitialized: true
}));

//Passport Middleware
app.use(passport.initialize()) //invoke serializer method
app.use(passport.session());  //invoke deserializer method

//Connect flash
app.use(flash());

//Global Vars
app.use((req, res, next) =>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//EJS
app.use(expressLayout);
app.set('view engine','ejs'); //middleware


//Routes to specific pages
app.use('/',require('./controller/index'));
app.use('/users',require('./controller/users'));


const PORT = process.env.PORT || 5500;

app.listen(PORT, console.log(`Server started at ${PORT}`));