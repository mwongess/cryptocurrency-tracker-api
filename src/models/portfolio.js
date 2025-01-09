import mongoose from "mongoose";

const PortfolioSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  purchasePrice: { type: Number, required: true, min: 0 },
});

export default mongoose.model("Portfolio", PortfolioSchema);