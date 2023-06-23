const { SEND_EMAIL, BASE_URL } = require('../keys/keys');

module.exports = function (email) {
  return {
    to: email,
    from: SEND_EMAIL,
    subject: 'Your account created',
    html: `
    <h1>Welcome to our store</h1>
    <p>You successfully created your account with indicated email: ${email}</p>
    <hr/>
    <a href="${BASE_URL}">Go to web-site</a>

    `,
  };
};
