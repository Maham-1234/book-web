const { User } = require('../models');
const passport = require('passport');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  console.log(firstName, lastName, email, password);
  console.log('in register function');
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(
        res,
        'An account with this email already exists.',
        422
      );
    }
    console.log('user not found in db');

    const user = await User.create({ firstName, lastName, email, password });
    console.log('user created');
    req.login(user, (err) => {
      if (err) {
        return errorResponse(
          res,
          'An error occurred during login after registering.'
        );
      }
      return successResponse(
        res,
        { user },
        'User registered successfully.',
        201
      );
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    return errorResponse(
      res,
      'An unexpected error occurred while registering.'
    );
  }
};

exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return errorResponse(res, 'An unexpected server error occurred.');
    }
    if (!user) {
      return errorResponse(res, info.message, 401);
    }

    req.login(user, (err) => {
      if (err) {
        return errorResponse(res, 'An error occurred during login.');
      }
      return successResponse(res, { user }, 'Login successful.');
    });
  })(req, res, next);
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return errorResponse(res, 'Logout failed.');
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return successResponse(
        res,
        null,
        'You have been successfully logged out.'
      );
    });
  });
};

exports.getCurrentUser = (req, res) => {
  return successResponse(
    res,
    { user: req.user },
    'Session user retrieved successfully.'
  );
};
