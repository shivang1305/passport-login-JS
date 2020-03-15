const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//User Model
const User = require('../models/UserSchema');

//Login Page
router.get('/login', (req,res)=> res.render("login"));

//Register Page
router.get('/register', (req, res)=> res.render("register"));

//Register Handle
router.post('/register', (req, res)=>{
    const { name,email,password,password2 } = req.body;
    let errors = [];

    //Check Required Feilds
    if(!name || !email || !password || !password2)
        errors.push({msg:'Please enter all the required feilds'});
    else{
        //Check passwords match
        if(password !== password2)
        errors.push({msg:'Passwords do not match'});

        //Check Password Length
        if(password.length<6)
          errors.push({msg:'Password is less than 6 characters'});
    }

    if(errors.length>0)
        {
        res.render('register',{
        errors,
        name,
        email,
        password,
        password2
        });
    }
    else
    {
        //Validation passed
        User.findOne({email : email})
            .then(user =>{
                if(user)
                {
                    //User already exists
                    errors.push({msg : 'This Email is already registered '});
                    res.render('register',{
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                }
                else
                {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    //Hash password
                    bcrypt.genSalt(10, (err, salt) => 
                        bcrypt.hash(newUser.password, salt, (err, hash) =>{
                            if(err) throw err;
                            //Set password to hashed
                            newUser.password = hash 
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now regsitered & can Log In');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log("Error in saving the data: "+err));
                    }));
                }
            })
    }
});

//Checking the Authentication of the user
const checkAuthenticated = function(req,res,next){
    if(req.isAuthenticated()){
        res.set('Cache-control', 'no-cache,private,no-store,must-relative,post-check=0,pre-check=0');
        return next();
    }
    else    
        res.redirect('/users/login');
}

//Dashboard Handler
router.get('/dashboard', checkAuthenticated, (req,res) => {

});

//Login Handle
router.post('/login', (req,res,next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true 
    })(req, res, next);
});

//Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out successfully');
    res.redirect('/users/login');
})

module.exports = router;