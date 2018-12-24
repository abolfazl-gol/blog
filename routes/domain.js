const express = require('express');
const { User, Blog, Post } = require('../models/index');

var router = express.Router()

router.get('/:name', async(req, res) =>{
    try {
        var blog = await Blog.findOne({name:req.params.name})
        .populate('posts')
        .populate('owner', 'name')
        
        res.render('domain/blog', { blog })
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
})

router.get('/:name/post/:title', async(req, res) =>{
    try {
        var blog = await Blog.findOne({name: req.params.name})
        if (!blog){
            res.redirect('users/register')
            return
        }
        var post = await Post.findOne({blog: blog._id , slug: req.params.title}).populate('owner')
        if (!post){
            res.redirect(`/${blog.name}`)
            return
        }
        res.render('domain/post', { post, blog })
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
})

module.exports = router;