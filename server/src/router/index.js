const fs = require('fs');
const path = require('path');
const express = require('express');

const router = express.Router();

const routesPath = path.join(__dirname, '..', 'routes');

fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith('.js')) {
    const routeFile = require(path.join(routesPath, file));

    let routeName = file
      .replace(/Routes?\.js$/i, '')
      .replace(/\.routes?\.js$/i, '')
      .toLowerCase();

    const routePath = `/api/${routeName}`;
    router.use(routePath, routeFile);
    console.log(`Loaded route: ${routePath} from ${file}`);
  }
});

module.exports = router;
