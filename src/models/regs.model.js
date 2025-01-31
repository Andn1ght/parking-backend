const mongoose = require("mongoose");

const RegulationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    properties: { type: Object, required: true },
    geometry: { type: Object, required: true },
  },
  { collection: "regs" }
);

module.exports = mongoose.model("Regulation", RegulationSchema);