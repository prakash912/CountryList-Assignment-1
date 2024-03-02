const Country = require('../models/Country');
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
      const country = await Country.findById(req.params.id).populate('neighbors');
      if (!country) {
        res.status(404).json({ message: 'Country not found', data: {} });
        return;
      }
  
      // Extract neighbor details
      const neighborDetails = country.neighbors.map(neighbor => ({
        id: neighbor.id,
        name: neighbor.name,
        cca3: neighbor.cca3,
        currency_code: neighbor.currency_code,
        currency: neighbor.currency,
        capital: neighbor.capital,
        region: neighbor.region,
        subregion: neighbor.subregion,
        area: neighbor.area,
        map_url: neighbor.map_url,
        population: neighbor.population,
        flag_url: neighbor.flag_url
      }));
  
      res.status(200).json({
        message: 'Country neighbours',
        data: { countries: neighborDetails }
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', data: {} });
    }
  };
  

  exports.addNeighbor = async (req, res) => {
    const { countryId } = req.params;
    const neighborData = req.body;

    try {
        // Find the country by ID
        const country = await Country.findById(countryId);
        if (!country) {
            return res.status(404).json({ message: 'Country not found', data: {} });
        }

        // Loop through neighbor data and add neighbors to the country
        for (const neighbor of neighborData) {
            // Create a new neighbor country object based on the provided data
            const newNeighbor = new Country({
                name: neighbor.name,
                cca3: neighbor.cca3,
                currency_code: neighbor.currency_code,
                currency: neighbor.currency,
                capital: neighbor.capital,
                region: neighbor.region,
                subregion: neighbor.subregion,
                area: neighbor.area,
                map_url: neighbor.map_url,
                population: neighbor.population,
                flag_url: neighbor.flag_url
            });
            // Save the new neighbor country to the database
            await newNeighbor.save();
            // Add the newly created neighbor country's ID to the country's neighbors array
            country.neighbors.push(newNeighbor._id);
        }

        // Save the updated country with new neighbors
        await country.save();

        // Fetch updated country data after saving
        const updatedCountry = await Country.findById(countryId).populate('neighbors');

        return res.status(200).json({ message: 'Neighbors added successfully', data: { country: updatedCountry } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error', data: {} });
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