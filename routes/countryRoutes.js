const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');

router.route("/")
.get(countryController.getAllCountriesPaginated)
.post(countryController.addCountry);
router.get('/:id', countryController.getCountryDetail);
router.get('/:id/neighbour', countryController.getCountryNeighbors);
router.post('/:countryId/neighbors', countryController.addNeighbor);
router.get('/sorted', countryController.getCountriesSorted);




module.exports = router;
