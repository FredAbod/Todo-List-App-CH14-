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
  uploadPicture,
  forgotPassword,
  resetPassword,
} = require("../controller/user.Controller");
const upload = require("../public/image/multer");
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
router.post("/forgotPassword", forgotPassword);
router.post("/reset/:token", resetPassword);
router.post("/savelist/:id", addList);
router.post("/completed/:id/:listId", completedToDo);
router.put("/updatelist/:id/:listId", updateListDescription);
router.put("/updateEmail/:id", updateEmail);
router.put("/profilepic/:id", upload.single("profilePic"), uploadPicture);

module.exports = router;
