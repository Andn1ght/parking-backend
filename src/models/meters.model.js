const mongoose = require("mongoose");

const MeterSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    properties: { type: Object, required: true },
    geometry: { type: Object, required: true },
  },
  { collection: "meter" }
);

module.exports = mongoose.model("Meter", MeterSchema);