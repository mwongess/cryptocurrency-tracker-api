import express from "express";
import portfolioRoutes from "./portfolioRoutes.js";
import cryptoRoutes from "./cryptoRoutes.js";

const router = express.Router();

router.use("/portfolio", portfolioRoutes);
router.use("/cryptocurrencies", cryptoRoutes);

export default router;