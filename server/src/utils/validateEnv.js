const { REQUIRED_ENV_VARS } = require('../config/constants');

const validateEnv = () => {
  const missingVars = REQUIRED_ENV_VARS.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `FATAL ERROR: Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  console.log('Environment variables are configured correctly.');
};

module.exports = validateEnv;
