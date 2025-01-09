import express from "express";
import { fetchAndStorePrices } from "../controllers/cryptoController.js";

const router = express.Router();

router.get("/", fetchAndStorePrices);

export default router;