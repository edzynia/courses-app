const { Router } = require('express');
const { mapItems } = require('../helpers/cartHelpers');
const Order = require('../models/order');
const auth = require('../middleware/auth');

const router = Router();

router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ 'user.userId': req.user._id }).populate(
      'user.userId',
    );

    res.render('orders', {
      title: 'Orders',
      isOrder: true,
      orders: orders.map((ord) => {
        return {
          ...ord._doc,
          price: ord.courses.reduce((total, c) => {
            return (total += c.course.price * c.count);
          }, 0),
        };
      }),
    });
  } catch (err) {
    console.log(err);
  }
});

router.post('/orders', auth, async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.courseId');
    const courses = user.cart.items.map((i) => ({
      count: i.count,
      course: { ...i.courseId._doc },
    }));

    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user,
      },
      courses,
    });

    await order.save();
    await req.user.clearCart();

    res.redirect('/orders');
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
