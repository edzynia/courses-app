const { Router } = require('express');
const Course = require('../models/course');
const { mapItems, computePrice } = require('../helpers/cartHelpers');
const auth = require('../middleware/auth');

const router = Router();

router.post('/cart/add', auth, async (req, res) => {
  const course = await Course.findById(req.body.id);
  await req.user.addToCart(course);
  res.redirect('/cart');
});

router.get('/cart', auth, async (req, res) => {
  const user = await req.user.populate('cart.items.courseId');
  const courses = mapItems(user.cart.items);

  res.render('cart', {
    title: 'Cart',
    isCart: true,
    courses: courses,
    price: computePrice(courses),
  });
});

router.delete('/cart/remove/:id', auth, async (req, res) => {
  await req.user.removeFromCart(req.params.id);
  const user = await req.user.populate('cart.items.courseId');
  const courses = mapItems(user.cart.items);

  const cart = {
    courses,
    price: computePrice(courses),
  };
  res.status(200).json(cart);
});

module.exports = router;
