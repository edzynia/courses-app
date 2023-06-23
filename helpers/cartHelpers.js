const mapItems = (arr) => {
  return arr.map((item) => ({
    ...item.courseId._doc,
    count: item.count,
    id: item.courseId.id,
  }));
};

const computePrice = (arr) => {
  return arr.reduce((total, course) => {
    return (total += course.price * course.count);
  }, 0);
};

module.exports = {
  mapItems,
  computePrice,
};
