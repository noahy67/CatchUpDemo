const firebaseAdmin = require('../firebase');

const checkAuth = (req, res, next) => {
  // must split because authorization sent with "BEARER token"
  const firebaseToken = req.headers.authorization.split(' ')[1];
  console.log(`THIS IS FT ${firebaseToken}`);
  if (firebaseToken) {
    firebaseAdmin.auth().verifyIdToken(firebaseToken)
      .then((token) => {
        console.log(token);
        console.log('FIREBASE AUTH PASSED');
        req.body.firebaseId = token.uid;
        next();
      }).catch(() => {
        res.status(403).send('Unauthorized');
      });
  } else {
    console.log('AUTHORIZATION FIREBASE FAILED');
    res.status(403).send('Unauthorized');
  }
};

module.exports = checkAuth;
