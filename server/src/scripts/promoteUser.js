require("dotenv").config({ path: "./.env" });
const { User, sequelize } = require("../models");

const promoteUser = async () => {
  const email = process.argv[2];

  if (!email) {
    console.error("Please provide an email address.");
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error(`Error: User with email "${email}" not found.`);
      process.exit(1);
    }

    user.role = "admin";
    await user.save();

    console.log(` Success! User "${email}" has been promoted to admin.`);
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

promoteUser();
