const { Router, request } = require('express');
const user = require('../middleware/user');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const senggrit = require('nodemailer-sendgrid-transport');
const { SENDGRID_API_KEY } = require('../keys/keys');
const registerEmail = require('../emails/registration');
const resetPass = require('../emails/reset');

const router = Router();

const transporter = nodemailer.createTransport(
  senggrit({
    auth: { api_key: SENDGRID_API_KEY },
  }),
);

router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError'),
  });
});

router.post('/login', async (req, res) => {
  try {
    const { password, email } = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
      const isSame = await bcrypt.compare(password, candidate.password);

      if (isSame) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;

        req.session.save((err) => {
          if (err) {
            throw err;
          } else {
            res.redirect('/');
          }
        });
      } else {
        req.flash('loginError', 'Incorrect email or password');
        res.redirect('/auth/login#login');
      }
    } else {
      req.flash('loginError', 'There is no user with this email');
      res.redirect('/auth/login#login');
    }
  } catch (err) {
    console.log(err);
    res.redirect('/auth/login#login');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login');
  });
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, repeat, name } = req.body;
    const candidate = await User.findOne({ email });

    if (candidate) {
      req.flash('registerError', 'The user with the same email is exist');
      res.redirect('/auth/login#register');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        email,
        name,
        password: hashedPassword,
        cart: { items: [] },
      });
      await user.save();
      await transporter.sendMail(registerEmail(email)); //after redirect
      res.redirect('/auth/login#login');
    }
  } catch (err) {
    console.log(err);
  }
});

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Forgot password?',
    error: req.flash('error'),
  });
});

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Something went wrong, try again later');
        return res.redirect('/auth/reset');
      }
      const token = buffer.toString('hex');
      const candidate = await User.findOne({ email: req.body.email });
      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenEx = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        await transporter.sendMail(resetPass(candidate.email, token));
        res.redirect('/auth/login');
      } else {
        req.flash('error', "The indicated email doesn't exist");
        return res.redirect('/auth/reset');
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login');
  }

  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenEx: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect('/auth/login');
    } else {
      res.render('auth/password', {
        title: 'Restore access',
        error: req.flash('error'),
        userId: user._id.toString(),
        token: req.params.token,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post('/password', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenEx: { $gt: Date.now() },
    });
    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenEx = undefined;

      await user.save();
      res.redirect('/auth/login');
    } else {
      req.flash('loginError', 'Token expired');
      res.redirect('/auth/login');
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
