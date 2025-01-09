import express from "express";
import {
    createPortfolioEntry,
    fetchPortfolio,
    updatePortfolioEntry,
    deletePortfolioEntry,
    getPortfolioInsights,
} from "../controllers/portfolioController.js";

const router = express.Router();

router.post("/", createPortfolioEntry);
router.get("/", fetchPortfolio);
router.put("/:id", updatePortfolioEntry);
router.delete("/:id", deletePortfolioEntry);
router.get("/insights", getPortfolioInsights);

export default router;