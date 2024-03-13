const express = require("express");
const {
  signup,
  login,
  addList,
  updateListDescription,
  updateEmail,
  completedToDo,
  getAllList,
  getAllListAndPaginate,
  completedToDoList,
  filterByDescription,
  filterByDate,
  verifyOtp,
  resendOtp,
} = require("../controller/user.Controller");
const router = express.Router();

router.get("/getalllist/:id", getAllList);
router.get("/filter/:id", filterByDescription);
// router.get('/filterByDate/:id', filterByDate)
router.get("/completedToDoList/:id", completedToDoList);
router.get("/getalllistAndPaginate/:id", getAllListAndPaginate);
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify", verifyOtp);
router.post("/resend", resendOtp);
router.post("/savelist/:id", addList);
router.post("/completed/:id/:listId", completedToDo);
router.put("/updatelist/:id/:listId", updateListDescription);
router.put("/updateEmail/:id", updateEmail);

module.exports = router;
