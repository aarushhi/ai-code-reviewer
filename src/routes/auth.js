const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/github', passport.authenticate('github', { scope: ['user', 'repo'] }));

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL}?error=auth_failed` }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}?login=success&user=${encodeURIComponent(JSON.stringify({
      id: req.user.id,
      username: req.user.username,
      avatar: req.user.avatar,
      name: req.user.name
    }))}`);
  }
);

router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect(process.env.FRONTEND_URL);
  });
});

module.exports = router;