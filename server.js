const express = require('express');
const mongoose = require('mongoose');

const users = require('./routes/api/users.routes');
const posts = require('./routes/api/posts.routes');
const profile = require('./routes/api/profile.routes');

const app = express();

// DB Config
const db = require('./config/keys.js').mongoURI;

//Connect to MongoDB
mongoose
    .connect(db, {
        useNewUrlParser: true
    })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello'));

//Use Routes

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server Running on port ${port}`));