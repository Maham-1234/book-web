const validate =
  (schemas = {}) =>
  async (req, res, next) => {
    try {
      console.log('Validating request body:', req.body);

      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.body) {
        console.log('validating body', req.body);
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      // req[key] = await schemas[key].parseAsync(req[key]);
      console.log('validated');
      next();
    } catch (error) {
      return res.status(400).json({ status: 'fail', errors: error.errors });
    }
  };

module.exports = validate;
