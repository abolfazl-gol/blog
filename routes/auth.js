const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt-nodejs');
const { User } = require('../models/index');

var router = express.Router();
var duplicateErr = 11000;

router.get('/register', (req, res) =>{
    res.render('auth/register')
})

router.post('/register', async (req, res) =>{
    var email = req.body.email
    var name = req.body.name
    var password = req.body.password
    var passConfim = req.body.password_confirmation

    var hasError= false

    if (!validator.isEmail(email)) {
        req.flash('info', 'is email not validation')
        hasError = true
    }

    if (!validator.isLength(password, {min: 6})) {
        req.flash('info', 'Password must contain more than 6 characters')
        hasError = true
    }

    if (passConfim != password) {
        req.flash('info', 'Please repeat the first password')
        hasError = true
    }

    if (hasError) {
        res.redirect('/users/register')
        return
    }

    var hash = bcrypt.hashSync(password)
    var user = new User({
        _id: new mongoose.Types.ObjectId,
        name: name,
        email: email,
        password: hash
    })
    
    try {
        await user.save()
        res.redirect('/users/login')
    } catch (err) {
        if(err && err.code === duplicateErr){
            req.flash('info', 'Emile is duplicate')
            res.redirect('/users/register')
            return
        }
        res.status(500).send(err)
    }
})

router.get('/login', (req, res) =>{
    res.render('auth/login')
})

router.post('/login', async (req, res) =>{
    var email = req.body.email
    var password = req.body.password

    if (!validator.isEmail(email)) {
        req.flash('info', 'is email not validition')
        res.redirect('/users/login')
        return
    }

    try {
        var user = await User.findOne({ email })

        if (!user){
            req.flash('info', 'email or password is not correct')
            res.redirect('/users/login')
            return;
        }

        if (!bcrypt.compareSync(password, user.password)){
            req.flash('info', 'email or password is not correct')
            res.redirect('/users/login')
            return
        }
        req.session.user = user
        res.redirect('/blogs')
        
    } catch (err) {
        req.flash('info', 'email or password is not correct')
        res.redirect('/users/login')
    }

})

router.get('/logout', (req, res) =>{
    delete req.session.user
    res.redirect('/users/login')
})

module.exports = router;