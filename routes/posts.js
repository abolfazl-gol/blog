const slug = require('slug');
const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const authenticate = require('../middlewares/auth');
const { User, Blog, Post } = require('../models/index');

var router = express.Router({ mergeParams: true });

router.use(authenticate)

// middleware
async function findBlog(req, res, next) {
    try {
        var blog = await Blog.findById(req.params.blogId)
        req.blog = blog // To access this variable in other functions; Used (req.blog)
        if (blog.owner != req.session.user._id){
            res.redirect('/blogs')
            return
        }
        next()
    } catch (err) {
        res.status(500).send(err)
    }
}

// index
router.get('/', findBlog, async (req, res) =>{
    try {
        var posts = await Post.find({blog: req.blog._id}).exec()
        res.render('posts/index', { blog: req.blog, posts })
    } catch (err) {
        res.status(500).send(err)
    }
})

// form new
router.get('/new', findBlog, (req, res) =>{
    res.render('posts/new', { blog: req.blog})
})

// created
router.post('/', findBlog, async (req, res) =>{
    var title = req.body.title
    var body = req.body.body

    var hasError = false
    
    if (!validator.isLength(title, { min: 6, max: 100 })) {
        req.flash('info', 'title must be between 6 and 100 chars')
        hasError = true
    }
    if (hasError) {
        res.redirect('posts/new')
        return
    }

    var post = new Post({
        _id: new mongoose.Types.ObjectId,
        title: title,
        slug: slug(title),
        body: body,
        likes: 0,
        dislike: 0,
        blog: req.blog._id,
        owner: req.session.user._id
    })

    try {
        await post.save()
        var blog = await Blog.findById(req.blog._id)
        blog.posts.push(post._id)
        res.redirect(`/blogs/${blog._id}/posts`)
        await blog.save()
    } catch (err) {
        res.status(500).send(err)
    }
})

// form edit
router.get('/:id/edit',findBlog, async (req, res) =>{
    try {
        var post = await Post.findOne({blog: req.blog._id, _id: req.params.id })
        res.render('posts/edit', {post, blog: req.blog})
    } catch (error) {
       res.status(500).send(err) 
    }
})

// Update
router.post('/:id', findBlog, async(req, res) =>{
    var title = req.body.title
    var body = req.body.body

    if (!validator.isLength(title, { min: 6, max: 100 })) {
        req.flash('info', 'title must be between 6 and 100 chars')
        res.redirect(`/blogs/${req.blog._id}/posts/${req.params.id}/edit`)
        return
    }

    try {
        await Post.findOneAndUpdate({ _id: req.params.id, blog: req.blog._id },
            { title, body , slug: slug(title) })
        res.redirect(`/blogs/${req.blog._id}/posts`)
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
})

// Delete
router.get('/:id/delete', findBlog, async (req, res) =>{
    try {
        var post = await Post.findOneAndDelete({_id: req.params.id, blog: req.blog._id})
        if (post){
            var blog = await Blog.findById(req.blog._id)
            var postIndex = blog.posts.indexOf(req.params.id)
            blog.posts.splice(postIndex, 1)
            await blog.save()
        }
        res.redirect(`/blogs/${req.blog._id}/posts`)
    } catch (err) {
        res.status(500).send(err)
    }
})

module.exports = router;