exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ status: 'fail', message: 'You must be logged in.' });
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res
    .status(403)
    .json({ status: 'fail', message: 'Forbidden: Admin access required.' });
};
