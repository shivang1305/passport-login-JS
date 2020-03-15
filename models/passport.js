const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Local user model
const mongoose = require('mongoose');
const User = require('./UserSchema');

module.exports = function(passport){
    passport.use(
        new LocalStrategy({usernameField: 'email'}, (email, password, done) =>{
            //Match User
            User.findOne({email : email})
                .then(user =>{
                    if(!user){
                        return done(null, false, {message: 'Email ID is not registered'});
                    }
                    else{
                        //Match Password
                        bcrypt.compare(password, user.password, (err, isMatch) => {
                            if(isMatch)
                                return done(null, user);
                            else
                                return done(null, false, {message: 'Password is not correct'});
                        })
                    }
                })
                .catch(err => console.log(err));
        })
    )
}

//Serilize the user
passport.serializeUser((user, done) => {
    done(null, user.id);
})

//Deserialize the user
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
})