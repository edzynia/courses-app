const express = require('express');
const path = require('path');
const csrf = require('csurf');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const cartRoutes = require('./routes/cart');
const ordersRouters = require('./routes/orders');
const authRouts = require('./routes/auth');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const { MONGODB_URI, PORT, SESSION_SECRET } = require('./keys/keys');

const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const {
  allowInsecurePrototypeAccess,
} = require('@handlebars/allow-prototype-access');

const app = express();

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: '.hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
});

const store = new MongoStore({
  collection: 'sessions',
  uri: MONGODB_URI,
});

app.engine('.hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  }),
);
app.use(csrf());
app.use(flash());

app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/', cartRoutes);
app.use('/', ordersRouters);
app.use('/auth', authRouts);

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
    });
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}
start();
