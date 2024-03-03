const mongoose = require('mongoose');

// const neighborSchema = new mongoose.Schema({
//   countries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Country' }]
// });

const neighborSchema = new mongoose.Schema({
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: true
  },
  neighborId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: true
  },
  // Optionally, you can include additional fields specific to the relationship
  // For example, you might include the date when the neighbor relationship was established
  createdAt: {
    type: Date,
    default: Date.now
  }
});

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
  neighbors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Neighbor' }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = {
  Country: mongoose.model('Country', countrySchema),
  Neighbor: mongoose.model('Neighbor', neighborSchema)
};
