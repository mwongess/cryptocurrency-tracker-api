import mongoose from "mongoose";

const CryptocurrencySchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  market_cap: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Cryptocurrency", CryptocurrencySchema);