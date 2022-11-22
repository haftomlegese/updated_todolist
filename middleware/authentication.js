const jwt = require('jsonwebtoken');
const User = require('../models/users');
require('dotenv').config();

const authenticate = async (req, res, next) => {
    try {
      console.log(req.headers.authorization);
      const token = req.headers.authorization.split(' ')[1];
      if (!token)
        return res.status(401).send("Access denied. No token provided.");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded){
        return res.status(401).send("Unauthorized access");
      }
      
      req.user = { userId: decoded.userId };
      await User.findById(req.user.userId)
        .then((result) => {
          if(result.email.startsWith('dltd.') ){
            return res.redirect('https://my-too-doo.netlify.app/');
          }
        })

      next();
    } catch (ex) {
      res.status(400).send("Invalid token.");
    }
  };

  module.exports = authenticate;