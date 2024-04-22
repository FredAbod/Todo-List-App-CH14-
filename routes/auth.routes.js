const router = require("express").Router();
const passport = require("passport");


router.get("/google", passport.authenticate("google", {
    scope: ['profile']
}));


router.get('/auth/google/redirect', passport.authenticate('google'), (req,res) => {
    res.send(req.user)
    console.log(req.query);
    // res.redirect('/profile');
});

module.exports = router;
