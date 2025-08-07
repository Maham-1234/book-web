const { User } = require('../models');
const passport = require('passport');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const fs = require('fs');
const path = require('path');

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

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    await user.save();

    return successResponse(res, { user }, 'Profile updated successfully.');
  } catch (error) {
    console.log(error.message);
    return errorResponse(res, 'Failed to update profile.');
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    if (!req.file) {
      return errorResponse(res, 'No image file uploaded.', 400);
    }

    if (user.avatar) {
      const oldAvatarPath = path.join(
        process.cwd(),
        'uploads',
        'avatars',
        user.avatar
      );
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    user.avatar = req.file.filename;
    await user.save();

    return successResponse(res, { user }, 'Avatar uploaded successfully.');
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return errorResponse(res, error.message || 'Failed to upload avatar.');
  }
};
