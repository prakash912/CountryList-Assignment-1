const { Country, Neighbor } = require('../models/Country');


const mongoose = require('mongoose');


exports.getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find();
    res.status(200).json({
      message: 'Country list',
      data: { list: countries }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', data: {} });
  }
};

exports.addCountry = async (req, res) => {
    try {
      if (Array.isArray(req.body)) {
        // If the request body is an array, iterate over each country object
        const addedCountries = [];
        for (const countryData of req.body) {
          const newCountry = new Country(countryData);
          const savedCountry = await newCountry.save();
          addedCountries.push(savedCountry);
        }
        res.status(201).json({ message: 'Countries added successfully', data: { countries: addedCountries } });
      } else {
        // If the request body is not an array, assume it's a single country object
        const newCountry = new Country(req.body);
        const savedCountry = await newCountry.save();
        res.status(201).json({ message: 'Country added successfully', data: { country: savedCountry } });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', data: {} });
    }
  };

  exports.getCountryDetail = async (req, res) => {
    try {
      const country = await Country.findById(req.params.id);
      if (!country) {
        res.status(404).json({ message: 'Country not found', data: {} });
      } else {
        res.status(200).json({
          message: 'Country detail',
          data: { country }
        });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', data: {} });
    }
  };

  exports.getCountryNeighbors = async (req, res) => {
    try {
        const { countryId } = req.params;
        console.log('Requested country ID:', countryId);

        // Find the country by ID
        const country = await Country.findById(countryId);
        console.log('Retrieved country:', country);

        if (!country) {
            console.log('Country not found');
            return res.status(404).json({ message: 'Country not found', data: {} });
        }

        // Find neighbors of the country
        const neighbors = await Neighbor.find({ countryId }).populate('neighborId');
        if (!neighbors || neighbors.length === 0) {
            console.log('No neighbors found');
            return res.status(200).json({ message: 'Country neighbors', data: { list: [] } });
        }

        console.log('Neighbors found:', neighbors);
        return res.status(200).json({ message: 'Country neighbors', data: { list: neighbors.map(neighbor => neighbor.neighborId) } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


// Add Neighbors API
// exports.addNeighbors = async (req, res) => {
//   try {
//       const { countryId } = req.params;
//       let neighborData = req.body;

//       // Remove countryId from neighborData if present
//       neighborData = neighborData.filter(id => id !== countryId);

//       // Find the country by ID
//       const country = await Country.findById(countryId);
//       if (!country) {
//           return res.status(404).json({ message: 'Country not found', data: {} });
//       }

//       // Get existing country IDs
//       const existingCountryIds = (await Country.find({}, '_id')).map(country => country._id.toString());

//       const errors = [];
//       const successfulAdditions = [];

//       for (const neighborId of neighborData) {
//           // Check if the neighbor ID exists and is not the same as the country ID
//           if (!existingCountryIds.includes(neighborId)) {
//               errors.push(`Invalid neighbor country ID: ${neighborId}`);
//               continue;
//           }

//           // Check if the neighbor already exists for the country
//           const existingNeighbor = await Neighbor.findOne({ countries: { $all: [countryId, neighborId] } });
//           if (existingNeighbor) {
//               errors.push(`Neighbor with ID ${neighborId} already exists for this country`);
//               continue;
//           }

//           // Add neighbor
//           const neighbor = new Neighbor({ countries: [countryId, neighborId] });
//           await neighbor.save();
//           successfulAdditions.push(neighbor);
//       }

//       if (successfulAdditions.length === 0) {
//           return res.status(400).json({ message: 'Failed to add neighbors', data: { neighbors: [], errors } });
//       }

//       return res.status(200).json({ message: 'Neighbors added successfully', data: { neighbors: successfulAdditions }, errors });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

exports.addNeighbors = async (req, res) => {
  try {
      const { countryId } = req.params;
      let neighborData = req.body;

      // Remove countryId from neighborData if present
      neighborData = neighborData.filter(id => id !== countryId);

      // Find the country by ID
      const country = await Country.findById(countryId);
      if (!country) {
          return res.status(404).json({ message: 'Country not found', data: {} });
      }

      // Get existing country IDs
      const existingCountryIds = (await Country.find({}, '_id')).map(country => country._id.toString());

      const errors = [];
      const successfulAdditions = [];

      for (const neighborId of neighborData) {
          // Check if the neighbor ID exists and is not the same as the country ID
          if (!existingCountryIds.includes(neighborId)) {
              errors.push(`Invalid neighbor country ID: ${neighborId}`);
              continue;
          }

          // Check if the neighbor already exists for the country
          const existingNeighbor = await Neighbor.findOne({ countryId, neighborId });
          if (existingNeighbor) {
              errors.push(`Neighbor with ID ${neighborId} already exists for this country`);
              continue;
          }

          // Add neighbor
          const neighbor = new Neighbor({ countryId, neighborId });
          await neighbor.save();
          successfulAdditions.push(neighbor);
      }

      if (successfulAdditions.length === 0) {
          return res.status(400).json({ message: 'Failed to add neighbors', data: { neighbors: [], errors } });
      }

      return res.status(200).json({ message: 'Neighbors added successfully', data: { neighbors: successfulAdditions }, errors });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};




exports.getCountriesSorted = async (req, res) => {
    try {
        let sortBy = req.query.sort_by || 'a_to_z';
        let sortCriteria;

        switch (sortBy) {
            case 'a_to_z':
                sortCriteria = { name: 1 };
                break;
            case 'z_to_a':
                sortCriteria = { name: -1 };
                break;
            case 'population_high_to_low':
                sortCriteria = { population: -1 };
                break;
            case 'population_low_to_high':
                sortCriteria = { population: 1 };
                break;
            case 'area_high_to_low':
                sortCriteria = { area: -1 };
                break;
            case 'area_low_to_high':
                sortCriteria = { area: 1 };
                break;
            default:
                sortCriteria = { name: 1 }; // Default to sort by name in ascending order
                break;
        }

        const countries = await Country.find().sort(sortCriteria);

        return res.status(200).json({
            message: 'Country list',
            data: { list: countries }
        });
    } catch (error) {
        console.error(error,"error");
        return res.status(500).json({ message: 'Internal Server Error', data: {error} });
    }
};

exports.getAllCountriesPaginated = async (req, res) => {
  try {
      let { page = 1, limit = 10, sort_by = 'a_to_z', search } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);

      const skip = (page - 1) * limit;
      let sortCriteria = {};

      switch (sort_by) {
          case 'a_to_z':
              sortCriteria = { name: 1 };
              break;
          case 'z_to_a':
              sortCriteria = { name: -1 };
              break;
          case 'population_high_to_low':
              sortCriteria = { population: -1 };
              break;
          case 'population_low_to_high':
              sortCriteria = { population: 1 };
              break;
          case 'area_high_to_low':
              sortCriteria = { area: -1 };
              break;
          case 'area_low_to_high':
              sortCriteria = { area: 1 };
              break;
          default:
              sortCriteria = { name: 1 }; // Default to sort by name in ascending order
              break;
      }

      let query = {};

      if (search) {
          const searchRegex = new RegExp(search, 'i');
          query = {
              $or: [
                  { name: searchRegex },
                  { region: searchRegex },
                  { subregion: searchRegex }
              ]
          };
      }

      const totalCountries = await Country.countDocuments(query);
      const totalPages = Math.ceil(totalCountries / limit);

      const countries = await Country.find(query)
          .sort(sortCriteria)
          .skip(skip)
          .limit(limit);

      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return res.status(200).json({
          message: 'Country list',
          data: {
              list: countries,
              has_next: hasNext,
              has_prev: hasPrev,
              page: page,
              pages: totalPages,
              per_page: limit,
              total: totalCountries
          }
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error', data: {} });
  }
}