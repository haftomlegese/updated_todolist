const User = require("../models/users");
const jwt = require("jsonwebtoken");
const async = require("async");
const fs = require("fs");
const { body, validationResult } = require("express-validator");
const { send_deleteMessage } = require("../controller/emailController");

module.exports.signup = [
  body("email").isEmail().withMessage("Invalid Email").toLowerCase(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("password must have minimum 6 character"),
  // Process request after validation and sanitization.
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array() });
      return;
    }
    await User.findOne({ email: req.body.email })
      .then((result) => {
        if (result) {
          return res.status(400).json({ message: "User is already available" });
        }
      })
      .catch((err) => res.status(400).json({ message: err.message }));

    const user = new User({
      email: req.body.email,
      password: req.body.password,
    });

    user
      .save()
      .then((result) => {
        // create JWT token
        const token = result.createJWT();
        // send the result to front end
        res.status(201).json({ email: result.email, Token: token });
      })
      .catch((err) => {
        next(err);
      });
  },
];

module.exports.login = [
  body("email")
    .isEmail()
    .withMessage("Invalid Email")
    .toLowerCase()
    .notEmpty()
    .withMessage("please provide all input"),
  body("password").notEmpty().withMessage("please provide all input"),
  // Process request after validation and sanitization.
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array() });
      return;
    }
    const { email, password } = req.body;
    // check user with this email
    const user = await User.findOne({ email: email, userStatus: true }).catch(
      (err) => {
        // console.log(err.message)
        res.json({ err: err.message });
      }
    );
    if (!user) {
      // console.log( `Invalid Credentials(email)`)
      return res.status(400).json({ message: `Invalid Credentials` });
    }
    // check password
    const checkPassword = await user.comparePassword(password).catch((err) => {
      console.log(err.message);
    });
    if (!checkPassword) {
      // console.log( `Invalid Credentials(password)`)
      return res.status(400).json({ message: `Invalid Credentials` });
    }

    // create token
    const token = user.createJWT();
    // send result to front end
    console.log("logged in");
    res.status(200).json({ email: user.email, Token: token });
  },
];

module.exports.update_profile = async (req, res, next) => {
  console.log(req.body);
  console.log(req.file);
  const userId = req.user.userId;
  let user;

  if (!req.file) {
    user = new User({ ...req.body, _id: userId });
  } else {
    user = new User({
      ...req.body,
      imgName: req.file.filename,
      // image: {
      //     data: fs.readFileSync("uploads/" + req.file.filename),
      //     contentType: "image"
      // },
      _id: userId,
    });
  }

  User.findByIdAndUpdate(userId, user, (err, result) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    res.status(201).json({ message: "User Updated successfully" });
  });
};

module.exports.get_profile = async (req, res, next) => {
  const userId = req.user.userId;

  await User.findById(userId)
    .then((result) => {
      if (!result) {
        return res
          .status(400)
          .json({ message: "sorry, something went wrong. try again" });
      } else {
        if (!result.imgName) {
          res.status(200).json({
            email: result.email,
            fullname: result.fullname,
            gender: result.gender,
            birthDate: result.birthDate,
            phoneNumber: result.phoneNumber,
          });
        } else {
          res.status(200).json({
            email: result.email,
            fullname: result.fullname,
            gender: result.gender,
            birthDate: result.birthDate,
            phoneNumber: result.phoneNumber,
            imgName:
              result.imgName == ""
                ? ""
                : `https://mytoodoapilist.herokuapp.com/profilePic/${result.imgName}`,
          });
        }
      }
    })
    .catch((err) => {
      res.status(400).json({ message: err.message });
    });
};

module.exports.change_password = async (req, res, next) => {
  const userId = req.user.userId;

  const user = await User.findOne({ _id: userId });
  user.password = req.body.password;
  await user.save((err, result) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    } else {
      res.status(201).json({ message: "password changed successfully" });
    }
  });
};
module.exports.delete_account = async (req, res, next) => {
  const userId = req.user.userId;
  let email = "dltd.";
  let emailTobeSend;

  await User.findById(userId).then((result) => {
    email += result.email;
    emailTobeSend = result.email;
    if (!result) {
      return res
        .status(400)
        .json({ message: "sorry, something went wrong. try again" });
    } else {
      result
        .updateOne({
          email: email,
          deletionReason: req.body.deletionReason,
          userStatus: false,
        })
        .then(async (user) => {
          const reset = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "30m",
          });
          const link = `https://mytoodoapilist.herokuapp.com/api/todolist/account/accountRecovery/${reset}`;
          await send_deleteMessage(emailTobeSend, link);
          res.status(201).json({ message: "User Deleted successfully" });
        })
        .catch((err) => {
          res.status(400).json({ message: err.message });
        });
    }
  });
};

module.exports.account_recovery = async (req, res, next) => {
  try {
    const decoded = jwt.verify(req.params.id, process.env.JWT_SECRET);
    await User.findById(decoded.userId).then(async (result) => {
      if (!result) {
        return res.status(400).json({ message: "No user with id" });
      } else {
        await User.find({ email: result.email.slice(5), userStatus:true }).then(async (user) => {
          if (user) {
            return res.redirect("https://my-too-doo.netlify.app/");
          }
        
        });
        if (result.email.startsWith("dltd.")) {
            await result
              .updateOne({
                email: result.email.slice(5),
                userStatus: true,
                deletionReason: "",
              })
              .then(() => {
                return res.redirect("https://my-too-doo.netlify.app/");
              });
          }
      }
    });
  } catch (error) {
    return res.redirect("https://my-too-doo.netlify.app/Register");
  }
};
