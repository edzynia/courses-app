const { SEND_EMAIL, BASE_URL } = require('../keys/keys');

module.exports = function (email, token) {
  return {
    to: email,
    from: SEND_EMAIL,
    subject: 'Access recovery',
    html: `
    <h1>You forgot your password?</h1>
    <p>If not, than ignore this email</p>
    <p>Otherwise click on the link below</p>
    <p><a href="${BASE_URL}auth/password/${token}">Restore access</a></p>
    <hr/>
    <a href="${BASE_URL}">Go to web-site</a>

    `,
  };
};
