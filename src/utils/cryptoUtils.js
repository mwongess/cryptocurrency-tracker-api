import axios from "axios";
import NodeCache from "node-cache";

export const cryptoCache = new NodeCache({
    stdTTL: 300,
    checkperiod: 320,
    useClones: false
});

export const priceCache = new NodeCache({
    stdTTL: 120,
    checkperiod: 150,
    useClones: false
});

export const CONFIG = {
    API_URL: "https://pro-api.coinmarketcap.com/v1/cryptocurrency",
    ENDPOINTS: {
        LISTINGS: "/listings/latest",
        QUOTES: "/quotes/latest"
    },
    LIMIT: 10,
    CURRENCY: "USD",
    CACHE_KEYS: {
        PRICES: "crypto_prices",
        LISTINGS: "crypto_listings"
    }
};

// General crypto price fetching
export async function fetchCryptoPrices(apiKey) {
    try {
        const cachedData = cryptoCache.get(CONFIG.CACHE_KEYS.PRICES);
        if (cachedData) {
            return cachedData;
        }

        const response = await axios.get(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.LISTINGS}`, {
            params: {
                limit: CONFIG.LIMIT,
                convert: CONFIG.CURRENCY,
            },
            headers: {
                'X-CMC_PRO_API_KEY': apiKey,
                'Accepts': 'application/json',
            },
        });

        const data = transformCryptoData(response.data.data);
        cryptoCache.set(CONFIG.CACHE_KEYS.PRICES, data);
        return data;
    } catch (error) {
        throw new Error(`API fetch failed: ${error.message}`);
    }
}

// Transform crypto data
export function transformCryptoData(rawData) {
    return rawData.map(crypto => ({
        symbol: crypto.symbol.toUpperCase(),
        name: crypto.name,
        price: crypto.quote.USD.price,
        market_cap: crypto.quote.USD.market_cap,
        timestamp: new Date()
    }));
}

// Database operations
export async function bulkUpsertCryptos(cryptoCurrency, cryptocurrencies) {
    const bulkOps = cryptocurrencies.map(crypto => ({
        updateOne: {
            filter: { symbol: crypto.symbol },
            update: { $set: crypto },
            upsert: true
        }
    }));

    try {
        await cryptoCurrency.bulkWrite(bulkOps);
    } catch (error) {
        throw new Error(`Database update failed: ${error.message}`);
    }
}

// Portfolio specific functions
export async function fetchSingleCryptoPrice(symbol, apiKey) {
    const cacheKey = `price_${symbol}`;
    const cachedPrice = priceCache.get(cacheKey);

    if (cachedPrice) {
        return cachedPrice;
    }

    try {
        const response = await axios.get(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.QUOTES}`, {
            params: {
                symbol: symbol.toUpperCase(),
                convert: CONFIG.CURRENCY,
            },
            headers: {
                'X-CMC_PRO_API_KEY': apiKey,
                'Accepts': 'application/json',
            },
        });

        const priceData = {
            price: response.data.data[symbol.toUpperCase()]?.quote?.USD?.price || 0,
            percentageChange: response.data.data[symbol.toUpperCase()]?.quote?.USD?.percent_change_24h || 0
        };

        priceCache.set(cacheKey, priceData);
        return priceData;
    } catch (error) {
        throw new Error(`Failed to fetch price for ${symbol}: ${error.message}`);
    }
}

// Validate crypto existence
export async function validateCrypto(symbol, apiKey) {
    const cacheKey = CONFIG.CACHE_KEYS.LISTINGS;
    let listings = cryptoCache.get(cacheKey);

    if (!listings) {
        const response = await axios.get(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.LISTINGS}`, {
            params: {
                convert: CONFIG.CURRENCY,
            },
            headers: {
                'X-CMC_PRO_API_KEY': apiKey,
                'Accepts': 'application/json',
            },
        });

        listings = response.data.data;
        cryptoCache.set(cacheKey, listings);
    }

    return listings.find(crypto =>
        crypto.symbol.toUpperCase() === symbol.toUpperCase()
    );
}

// Calculate portfolio metrics
export function calculatePortfolioMetrics(portfolioEntries) {
    const totalValue = portfolioEntries.reduce((sum, entry) => sum + entry.totalValue, 0);
    const totalCost = portfolioEntries.reduce((sum, entry) =>
        sum + (entry.quantity * entry.purchasePrice), 0
    );
    const totalGainLoss = totalValue - totalCost;
    const percentageGainLoss = ((totalValue / totalCost - 1) * 100).toFixed(2);

    return {
        totalValue,
        totalCost,
        totalGainLoss,
        percentageGainLoss
    };
}

// Error handling utility
export function handleError(error, operation) {
    console.error(`[${operation} Error]:`, error);

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message;

    return {
        statusCode,
        error: errorMessage,
        timestamp: new Date()
    };
}

// Cache management utilities
export function clearCaches() {
    cryptoCache.flushAll();
    priceCache.flushAll();
}

export function clearPriceCache(symbol) {
    if (symbol) {
        priceCache.del(`price_${symbol}`);
    } else {
        priceCache.flushAll();
    }
}