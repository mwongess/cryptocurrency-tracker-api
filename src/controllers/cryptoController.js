import { fetchCryptoPrices, bulkUpsertCryptos, handleError } from "../utils/cryptoUtils.js";
import cryptoCurrency from "../models/crypto.js";

export const fetchAndStorePrices = async (req, res) => {
    try {
        const cryptocurrencies = await fetchCryptoPrices(process.env.API_KEY);

        await bulkUpsertCryptos(cryptoCurrency, cryptocurrencies);

        const storedCryptos = await cryptoCurrency.find()
            .sort({ market_cap: -1 })
            .limit(10);

        res.status(200).json({
            message: "Top 10 cryptocurrencies",
            data: storedCryptos,
        });
    } catch (error) {
        const { statusCode, error: errorMessage } = handleError(error, "fetchAndStorePrices");
        res.status(statusCode).json({ message: "Error fetching cryptocurrency prices.", error: errorMessage });
    }
};
