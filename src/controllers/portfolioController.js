// controllers/portfolioController.js
import axios from "axios";
import portfolio from "../models/portfolio.js";
import {
    fetchSingleCryptoPrice,
    validateCrypto,
    calculatePortfolioMetrics,
    handleError
} from '../utils/cryptoUtils.js';

export const createPortfolioEntry = async (req, res) => {
    try {
        const { userId, symbol, quantity, purchasePrice } = req.body;

        if (quantity <= 0 || purchasePrice <= 0) {
            return res.status(400).json({ error: "Quantity and purchase price must be greater than zero." });
        }

        const existingEntry = await portfolio.findOne({
            userId: userId,
            symbol: symbol.toUpperCase()
        });

        if (existingEntry) {
            return res.status(400).json({
                error: "You already have this cryptocurrency in your portfolio. Use the update endpoint to modify existing entries."
            });
        }

        const crypto = await validateCrypto(symbol, process.env.API_KEY);

        if (!crypto) {
            return res.status(404).json({ error: `Cryptocurrency with symbol ${symbol} not found.` });
        }

        const entry = new portfolio({
            userId,
            symbol: symbol.toUpperCase(),
            quantity,
            purchasePrice
        });
        await entry.save();

        res.status(201).json(entry);
    } catch (error) {
        const { statusCode, error: errorMessage } = handleError(error, 'Create Portfolio Entry');
        res.status(statusCode).json({ error: errorMessage });
    }
};

export const fetchPortfolio = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required to fetch the portfolio." });
        }

        const portfolioEntries = await portfolio.find({ userId });

        if (portfolioEntries.length === 0) {
            return res.status(404).json({ error: "No portfolio entries found for the given user." });
        }

        const portfolioWithPrices = await Promise.all(
            portfolioEntries.map(async (entry) => {
                const { price: currentPrice } = await fetchSingleCryptoPrice(entry.symbol, process.env.API_KEY);
                const totalValue = entry.quantity * currentPrice;

                return {
                    ...entry.toObject(),
                    currentPrice,
                    totalValue,
                };
            })
        );

        const metrics = calculatePortfolioMetrics(portfolioWithPrices);
        res.json({
            portfolio: portfolioWithPrices,
            metrics
        });

    } catch (error) {
        const { statusCode, error: errorMessage } = handleError(error, 'Fetch Portfolio');
        res.status(statusCode).json({ error: errorMessage });
    }
};

export const updatePortfolioEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, purchasePrice } = req.body;

        if (quantity <= 0 || purchasePrice <= 0) {
            return res.status(400).json({ error: "Quantity and purchase price must be greater than zero." });
        }

        const entry = await portfolio.findByIdAndUpdate(
            id,
            { quantity, purchasePrice },
            { new: true }
        );

        if (!entry) {
            return res.status(404).json({ error: "Portfolio entry not found. Please check the entry ID." });
        }

        res.json(entry);
    } catch (error) {
        const { statusCode, error: errorMessage } = handleError(error, 'Update Portfolio Entry');
        res.status(statusCode).json({ error: errorMessage });
    }
};

export const deletePortfolioEntry = async (req, res) => {
    try {
        const { id } = req.params;

        const entry = await portfolio.findByIdAndDelete(id);

        if (!entry) {
            return res.status(404).json({ error: "Portfolio entry not found. Please check the entry ID." });
        }

        res.status(204).send();
    } catch (error) {
        const { statusCode, error: errorMessage } = handleError(error, 'Delete Portfolio Entry');
        res.status(statusCode).json({ error: errorMessage });
    }
};

export const getPortfolioInsights = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required to fetch portfolio insights." });
        }

        const portfolioEntries = await portfolio.find({ userId });

        if (portfolioEntries.length === 0) {
            return res.status(404).json({ error: "No portfolio entries found for the given user." });
        }

        const insights = await Promise.all(
            portfolioEntries.map(async (entry) => {
                const { price: currentPrice, percentageChange } = await fetchSingleCryptoPrice(entry.symbol, process.env.API_KEY);
                const totalValue = entry.quantity * currentPrice;

                return {
                    ...entry.toObject(),
                    currentPrice,
                    totalValue,
                    percentageChange,
                };
            })
        );

        const metrics = calculatePortfolioMetrics(insights);

        res.json({
            totalValue: metrics.totalValue,
            totalGainLoss: metrics.totalGainLoss,
            percentageGainLoss: metrics.percentageGainLoss,
            insights
        });

    } catch (error) {
        const { statusCode, error: errorMessage } = handleError(error, 'Portfolio Insights');
        res.status(statusCode).json({ error: errorMessage });
    }
};