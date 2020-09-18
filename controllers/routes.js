  const Route = require('../models/Route');
  const annealing = require('./../annealing.js');
  const distance = require('./../annealing.js');


  //Async Function to add a route to database
  exports.add_route = async (req, res, next) => {
    try {
        const routes = await Route.create(req.body);
        const startLocationCoordinates = routes.startLocation.coordinates;
        const destinationLocationCoordinates = routes.location.coordinates;
        let constraint = distance.getDistance(startLocationCoordinates[1], startLocationCoordinates[0],  destinationLocationCoordinates[1], destinationLocationCoordinates[0]);
        constraint *= 1.2;
        const coordinates = annealing.anneal(0.975,10,constraint,startLocationCoordinates[1], startLocationCoordinates[0],  destinationLocationCoordinates[1], destinationLocationCoordinates[0]);
        const coordinatesArray = coordinates.map((item) => `${item.lng}, ${item.lat};`);
        const namesArray = coordinates.map((item) => `${item.name};`);

        return res.send({
            status: 200,
            success: true,
            count: routes.length,
            data: {
                routes,
                coordinates: coordinatesArray,
                path: namesArray,
            }
        });
    } catch (error) {
      console.error(error);
      if (err.code === 11000) {
        return res.status(400).json({ error: 'This route already exists' });
      }
      res.status(500).json({ error: 'Server error' });
  }
};
