const validate = (schemas) => async (req, res, next) => {
  try {
    if (schemas.params) {
      req.params = await schemas.params.parseAsync(req.params);
    }
    if (schemas.body) {
      req.body = await schemas.body.parseAsync(req.body);
    }
    if (schemas.query) {
      req.query = await schemas.query.parseAsync(req.query);
    }
    next();
  } catch (error) {
    return res.status(400).json({ status: 'fail', errors: error.errors });
  }
};

module.exports = validate;