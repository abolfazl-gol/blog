const _db = require('./db');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const redis = require('redis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const authRouter = require('./routes/auth');
const blogsRouter = require('./routes/blogs');
const postsRouter = require('./routes/posts');
const domainRouter = require('./routes/domain');

var port = 8080;
var app = express();
var client = redis.createClient();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('blog secret'))
app.use(session({
    store: new RedisStore({client: client, host: 'localhost', port: 6379}),
    cookie: { maxAge: 800000 },
    secret: 'blog secret',
    resave: true,
    saveUninitialized: true,
}))

app.use(flash());

app.use('/users', authRouter);
app.use('/blogs', blogsRouter);
app.use('/blogs/:blogId/posts', postsRouter);
app.use('/', domainRouter);

app.get('/', async (req, res) => res.redirect('/blogs'))

app.listen(port, () =>{
    console.log(`server is running on this port: http://localhost:${port}`)
})