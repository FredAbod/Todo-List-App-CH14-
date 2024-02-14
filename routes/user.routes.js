const express = require("express");
const { signup } = require("../controller/user.Controller");
const router = express.Router();

router.post("/signup", signup);

module.exports = router;
