const express = require("express");
const {
  signup,
  login,
  update_profile,
  change_password,
  get_profile,
  delete_account,
  account_recovery,
} = require("../controller/userController");
const {
  sendEmail,
  confirm,
  newPassword,
} = require("../controller/forgetpasswordController");
const auth = require("../middleware/authentication");
const multer = require("multer");
const cors = require("cors");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const prefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, prefix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
}).single("profilePic");

/**
 * @swagger
 * components:
 *  schemas:
 *      OTP:
 *          type: object
 *          require:
 *              - email
 *              - code
 *              - expireIn
 *          properties:
 *              id:
 *                  type: string
 *                  description: The auto-generated id for the OTP
 *              email:
 *                  type: string
 *                  description: The user email
 *              code:
 *                  type: string
 *                  description: The OTP code
 *              expireIn:
 *                  type: number
 *                  description: expire time in secs
 *      Users:
 *          type: object
 *          require:
 *              - email
 *              - password
 *              - fullname
 *              - birthDate
 *              - gender
 *              - phoneNumber
 *              - userStatus
 *              - deletionReason
 *              - imgName
 *              - image
 *          properties:
 *              id:
 *                  type: string
 *                  description: The auto-generated id for the user
 *              email:
 *                  type: string
 *                  description: The user email
 *              password:
 *                  type: string
 *                  description: The user's password
 *              fullname:
 *                  type: string
 *                  description: name of the user
 *              birthDate:
 *                  type: date
 *                  description: user birth date
 *              gender:
 *                  type: string
 *                  description: The user's gender
 *              phoneNumber:
 *                  type: string
 *                  description: user's phone number
 *              userStatus:
 *                  type: boolean
 *                  description: The user status whether the user is active or not
 *              deletionReason:
 *                  type: string
 *                  description: The user's reason for account deletion
 *              imgName:
 *                  type: string
 *                  description: user profile picture file name
 *              image:
 *                  type: buffer
 *                  description: image data in binary
 *
 *
 */

/**
 * @swagger
 * tags:
 *      name: Users
 *      description: the Users managing API
 */

/**
 * @swagger
 * /api/todolist/account/signup:
 *   post:
 *     summary: Create a new user
 *     description: signup to the site
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Users'
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Users'
 *       400:
 *         description: Invalid Email
 */
router.post("/signup", signup);

/**
 * @swagger
 * /api/todolist/account/login:
 *   post:
 *     summary: login to home page
 *     description: login to the site
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Users'
 *     responses:
 *       200:
 *         description: The user was successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Users'
 *       400:
 *         description: Invalid Email or password
 */
router.post("/login", login);

/**
 * @swagger
 * /api/todolist/account/forgetPassword:
 *   post:
 *     summary: forget password
 *     description: To get your password when you forget it
 *     tags: [Users]
 *     parameters:
 *        - in: body
 *          name: email
 *          schema:
 *              type: string
 *          required: true
 *          description: user email
 *     responses:
 *       201:
 *         description: Password reset email has been sent. Please check your email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OTP'
 *       400:
 *         description: User not found!
 */
router.post("/forgetPassword", cors(), sendEmail);

/**
 * @swagger
 * /api/todolist/account/confirmCode:
 *   post:
 *     summary: confirm otp code
 *     description: To confirm code send to the email to reset password
 *     tags: [Users]
 *     parameters:
 *        - in: body
 *          name: email
 *          schema:
 *              type: string
 *          required: true
 *          description: user email
 *        - in: body
 *          name: code
 *          schema:
 *              type: string
 *          required: true
 *          description: otp code
 *     responses:
 *       200:
 *         description: OTP verified
 *         content:
 *           application/json:
 *              name: resetToken
 *              schema:
 *                  type: string
 *       400:
 *         description: invalid code
 */
router.post("/confirmCode", cors(), confirm);

/**
 * @swagger
 * /api/todolist/account/newpassword:
 *   post:
 *     summary: enter new password
 *     description: To reset password with new password
 *     tags: [Users]
 *     parameters:
 *        - in: body
 *          name: resetToken
 *          schema:
 *              type: string
 *          required: true
 *          description: reset token
 *        - in: body
 *          name: password
 *          schema:
 *              type: string
 *          required: true
 *          description: new passwords
 *     responses:
 *       200:
 *         description: Password reset successfully
 *
 *       400:
 *         description: User not found
 */
router.post("/newpassword", cors(), newPassword);

/**
 * @swagger
 * /api/todolist/account/update:
 *  patch:
 *      summary: Update Profile
 *      description: update the information for the user in profile
 *      tags: [Users]
 *      security:
 *          -   BearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          fullname:
 *                              type: string
 *                          phoneNumber:
 *                              type: string
 *                          gender:
 *                              type: string
 *                          birthDate:
 *                              type: string
 *                          image:
 *                              type: string
 *      responses:
 *          200:
 *              description: profile has been updated successfully
 *          400:
 *              description: Something went wrong
 *
 */
router.patch("/update", [auth, upload, cors()], update_profile);

/**
 * @swagger
 * /api/todolist/account/changePassword:
 *   patch:
 *     summary: password change
 *     description: To change one's account with new password
 *     security:
 *          -   BearerAuth: []
 *     tags: [Users]
 *     parameters:
 *        - in: body
 *          name: password
 *          schema:
 *              type: string
 *          required: true
 *          description: new password
 *        - in: header
 *          name: token
 *          schema:
 *              type: string
 *          required: true
 *          description: user token
 *     responses:
 *       200:
 *         description: password changed successfully
 *
 *       400:
 *         description: Error
 */
router.patch("/changePassword", auth, change_password);

/**
 * @swagger
 * /api/todolist/account/profile:
 *   get:
 *     summary: get profile
 *     description: To view one's user profile
 *     security:
 *          -   BearerAuth: []
 *     tags: [Users]
 *     parameters:
 *        - in: header
 *          name: token
 *          schema:
 *              type: string
 *          required: true
 *          description: user token
 *     responses:
 *       200:
 *         description: return profile
 *         content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          email:
 *                              type: string
 *                          fullname:
 *                              type: string
 *                          phoneNumber:
 *                              type: string
 *                          gender:
 *                              type: string
 *                          birthDate:
 *                              type: string
 *                          imgName:
 *                              type: string
 *
 *       400:
 *         description: Error
 */
router.get("/profile", auth, get_profile);

/**
 * @swagger
 * /api/todolist/account/delete:
 *   delete:
 *     summary: delete account
 *     description: To delete one's account with deletion reason
 *     security:
 *          -   BearerAuth: []
 *     tags: [Users]
 *     parameters:
 *        - in: body
 *          name: deletionReason
 *          schema:
 *              type: string
 *          required: true
 *          description: reason for account deletion
 *        - in: header
 *          name: token
 *          schema:
 *              type: string
 *          required: true
 *          description: user token
 *     responses:
 *       200:
 *         description: user deleted successfully
 *
 *       400:
 *         description: Error
 */
router.delete("/delete", auth, delete_account);

router.get("/accountRecovery/:id", account_recovery);


module.exports = router;
