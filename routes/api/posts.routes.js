const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Post model
const Post = require('../../models/Post');

//Post model
const Profile = require('../../models/Profile');

// Post validator 
const validatePostInput = require('../../validation/post');

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get('/test', (req, res) => res.json({
    msg: "Posts Work."
}));

// @route   GET api/posts
// @desc    Get post
// @access  public

router.get('/', (req, res) => {
    Post.find()
        .sort({date: -1})
        .then(posts => res.json(posts))
        .catch( err => res.status(404).json({errors: "Post doesn't exist with that ID"}));
});

// @route   GET api/posts/:id
// @desc    Get single post by id
// @access  public

router.get('/:id', (req, res) => {
    const errors = {};
    Post.findById(req.params.id)
        .sort({date: -1})
        .then(post => {
            console.log(post);
            if (!post) {
                errors.post = "Post doesn't exist"
                return res.status(400).json(errors);
            }
            res.json(post);
        })
        .catch( err => res.status(404).json({errors: "Post doesn't exist with that ID"}));
});

// @route   POST api/posts
// @desc    Create post
// @access  private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //check validation
    if (!isValid) {
        //If any errors, send 400 with error obj
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));
})

// @route   DELETE api/posts/:id
// @desc    Delete post
// @access  private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then( profile => {
            Post.findById(req.params.id)
                .then(post => {
                    //Check for post owner
                    if (post.user.toString() !== req.user.id) {
                        return res.status(401).json({errors: 'Not Authorized'});
                    }
                    

                    //Delete
                    post.remove().then(() => res.json({ success: true} ));
                })
                .catch(err => res.status(404).json({errors: 'Post not found.'}));
        })
});

// @route   POST api/posts/like/:id
// @desc    Like post
// @access  private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then( profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        return res.status(400).json({errors: 'User already liked this post'});
                    }

                    //Add user id to likes array
                    post.likes.push({user: req.user.id});
                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({errors: 'Post not found.'}));
        })
});

// @route   POST api/posts/unlike/:id
// @desc    Unlike post
// @access  private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then( profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        return res.status(400).json({errors: 'You have not liked this post'});
                    }

                    //get index of logged user like
                    const removeIndex = post.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id);

                    //Splice out of array
                    post.likes.splice(removeIndex, 1);

                    //Save
                    post.save().then(post => res.json(post))
                })
                .catch(err => res.status(404).json({errors: 'Post not found.'}));
        })
});

// @route   POST api/posts/comment/:id
// @desc    Add Comment post
// @access  private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //check validation
    if (!isValid) {
        //If any errors, send 400 with error obj
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            }

            //Add to comments array
            post.comments.push(newComment);

            //Save
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({errors: 'Post not found.'}));
});

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete Comment post
// @access  private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => { 
    Post.findById(req.params.id)
        .then(post => {
            if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                //Comment doesnt exist
                return res.status(404).json({ comment: "Comment doesn't exist"});
            }
            
            //get index of logged user like
            const removeIndex = post.comments
                .map(item => item._id.toString())
                .indexOf(req.params.comment_id);

            //Splice out of array
            post.comments.splice(removeIndex, 1);

            //Save
            post.save().then(post => res.json(post))
        })
        .catch(err => res.status(404).json({errors: 'Post not found.'}));
});

module.exports = router;