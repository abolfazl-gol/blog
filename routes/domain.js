const express = require('express');
const mongoose = require('mongoose');
const { Blog, Post, Comment } = require('../models/index');

var router = express.Router()

router.get('/:name', async (req, res) => {
    try {
        var blog = await Blog.findOne({ name: req.params.name })
            .populate('posts')
            .populate('owner', 'name')
        
        if (!blog){
            res.status(404).json({error: 'page not found'})
            return
        }
        res.render('domain/blog', { blog })
    } catch (err) {
        res.status(500).send(err)
    }
})

router.get('/:name/post/:title', async (req, res) => {
    try {
        var blog = await Blog.findOne({ name: req.params.name })
        if (!blog) {
            res.redirect('users/register')
            return
        }
        var post = await Post.findOne({ blog: blog._id, slug: req.params.title })
            .populate('owner')
            .populate({
                path: 'comments',
                options: {
                    sort: { date: -1 }
                }
            })

        if (!post) {
            res.redirect(`/${blog.name}`)
            return
        }
        res.render('domain/post', { post, blog })
    } catch (err) {
        res.status(500).send(err)
    }
})

router.post('/:name/post/:title/comment', async (req, res) => {
    try {
        var post = await Post.findOne({ slug: req.params.title }).populate('comments')
        if (!post) {
            res.redirect(`/${req.params.name}`)
            return
        }
        var comment = new Comment({
            _id: new mongoose.Types.ObjectId,
            name: req.body.name,
            body: req.body.comment,
            post: post._id
        })

        await comment.save()

        post.comments.push(comment._id)
        await post.save()

        res.redirect('back')

    } catch (err) {
        res.status(500).send(err)
    }
})

router.post('/:name/post/:title/like', async (req, res) => {
    
    try {
        var post = await Post.findOne({ slug: req.params.title })
        if (!post){
            res.redirect(`${req.params.name}`)
            return
        }
        
        post.likes = (post.likes || 0) + 1
        await post.save()
        res.status(200).json({likes: post.likes})
    } catch (err) {
        console.log(err)
        res.status(500).json({err})
    }
})


module.exports = router;