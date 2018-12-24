const express = require('express');
const validator = require('validator');
const mongoose = require('mongoose');
const { User, Blog } = require('../models/index');
const authenticate = require('../middlewares/auth');

var router = express.Router();
var duplicateErr = 11000;

router.use(authenticate);

// index
router.get('/', async (req, res) => {
    var blogs = []

    try {
        var user = await User.findById(req.session.user._id).populate('blogs').exec()
        if (user) {
            blogs = user.blogs
        }
        res.render('blogs/index', { blogs })

    } catch (err) {
        res.status(500).send(err)
    }
});

// new
router.get('/new', (req, res) => {
    res.render('blogs/new')
})

// create
router.post('/', async (req, res) => {
    var name = req.body.name
    var title = req.body.title
    var description = req.body.description

    var hasError = false;

    if (!validator.isAlpha(name)) {
        req.flash('info', 'Use in name only alphabetical')
        hasError = true
    }

    if (!validator.isLength(title, { max: 50, min: 6 })) {
        req.flash('info', 'The title should be between 6 and 50 characters')
        hasError = true
    }

    if (hasError) {
        res.redirect('blogs/new')
        return
    }

    var blog = new Blog({
        _id: new mongoose.Types.ObjectId,
        name: name,
        title: title,
        description: description,
        owner: req.session.user._id
    })

    try {
        await blog.save()
        var user = await User.findById(req.session.user._id)
        user.blogs.push(blog._id)
        await user.save()
        res.redirect('/blogs')

    } catch (err) {
        if (err.code === duplicateErr) {
            req.flash('info', 'ُThe name is existing')
            res.redirect('blogs/new')
            return
        }
        res.status(500).send(err)
    }
})

router.get('/:id', async (req, res) =>{
    id = req.params.id
    res.send(`show blog ${id}`)
})

router.get('/:id/edit', async (req, res) =>{
    try {
        var blog = await Blog.findById(req.params.id)
        res.render('blogs/edit', { blog })
    } catch (err) {
        res.status(500).send(err)
    }
})

// Update
router.post('/:id', async (req, res) =>{
    var name = req.body.name
    var title = req.body.title
    var description = req.body.description

    try {
        await Blog.findByIdAndUpdate({_id: req.params.id, owner: req.session.user._id},
            {name, title, description})
        res.redirect('/blogs')

    } catch (err) {
        if (err.code == duplicateErr) {
            req.flash("info", "name already exists")
            res.redirect(`/blogs/${req.params.id}/edit`)
            return;

        }
        res.status(500).send(err)
    }
})

router.get('/:id/delete', async (req, res) =>{
    var id = req.params.id
    try {
        var blog = await Blog.findByIdAndDelete({_id: id, owner: req.session.user._id})
        
        if (blog){
            var user = await User.findById(req.session.user._id)
            var blogId = user.blogs.indexOf(id)
            user.blogs.splice(blogId, 1)
        }
        res.redirect('/blogs')
    } catch (err) {
        res.status(500).send(err)
    }
})
module.exports = router;