const mongoose = require("mongoose");

const MeterSchema = new mongoose.Schema({
  type: { type: String, required: true },
  properties: { type: Object, required: true },
  geometry: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true } // GeoJSON format
  }
});

module.exports = mongoose.model("Meter", MeterSchema);