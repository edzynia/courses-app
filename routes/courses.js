const { Router, request } = require('express');
const Course = require('../models/course');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

const router = Router();

//All courses
router.get('/', async (req, res) => {
  const courses = await Course.find()
    .populate('userId', 'email name')
    .select('price title img');

  res.render('courses', {
    title: 'Courses',
    isCourses: true,
    courses,
  });
});

//Add new course
router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/');
  }

  const course = await Course.findById(req.params.id);
  res.render('course-edit', {
    title: `Edit ${course.title}`,
    course,
  });
});

//Open and delete specific course
router.post('/remove', auth, async (req, res) => {
  try {
    const { id } = req.body;
    await Course.findOneAndDelete({
      _id: id,
    });
    res.redirect('/courses');
  } catch (err) {
    console.log(err);
  }
});

//Open and change specific course
router.post('/edit', auth, async (req, res) => {
  const { id } = req.body;
  delete req.body.id;

  await Course.findByIdAndUpdate(id, req.body);
  res.redirect('/courses');
});

//Open specific course
router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id);
  res.render('course', {
    layout: 'empty',
    title: `Course ${course.title}`,
    course,
  });
});

module.exports = router;
