const express = require("express");
const { signup, login, addList } = require("../controller/user.Controller");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/savelist/:id", addList);

module.exports = router;
