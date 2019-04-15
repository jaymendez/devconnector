const express = require('express');
const router = express.Router();

// @route   GET api/posts/test
// @desc    Tests Profile route
// @access  Public
router.get('/test', (req, res) => res.json({
    msg: "Profile Work."
}));

module.exports = router;