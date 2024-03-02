const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: String,
  cca3: String,
  currency_code: String,
  currency: String,
  capital: String,
  region: String,
  subregion: String,
  area: Number,
  map_url: String,
  population: Number,
  flag_url: String,
  neighbors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Country' }], // Array of neighbor IDs
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Country', countrySchema);
