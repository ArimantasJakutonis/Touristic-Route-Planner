    const express = require('express');
    const router = express.Router();

    // Router is used to keep all routes in a single file for extendability of this software
    const routes_controller = require('../controllers/routes');
    router.post('/api/v1/routes', routes_controller.add_route);
    module.exports = router;
