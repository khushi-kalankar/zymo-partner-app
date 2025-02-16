const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Zoom credentials
const prod = process.env.PROD === "true";
const zoomApiKey = prod ? process.env.ZOOM_API_KEY_PROD : process.env.ZOOM_API_KEY_DEV;
const zoomApiUrl = prod ? process.env.ZOOM_API_URL_PROD : process.env.ZOOM_API_URL_DEV;
const apiVer = "v2/";
const zoomId = prod ? process.env.ZOOM_ID_PROD : process.env.ZOOM_ID_DEV;
const zoomPass = prod ? process.env.ZOOM_PASS_PROD : process.env.ZOOM_PASS_DEV;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

app.get("/indian-cities", async (req, res) => {
    const query = req.query.query || "New"; // Default to "New" if empty
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&types=(cities)&components=country:IN&key=${GOOGLE_API_KEY}`;

    try {
        const response = await axios.get(apiUrl);
        if (response.data.status === "OK") {
            const cityNames = response.data.predictions.map(city => city.description);
            res.json({ cities: cityNames });
        } else {
            res.json({ cities: [] });
        }
    } catch (error) {
        console.error("Error fetching cities:", error.message);
        res.status(500).json({ error: "Failed to fetch cities" });
    }
});

async function getZoomToken() {
    const zoomTokenUrl = `${zoomApiUrl}authenticate/token`;
    const basicAuth = `Basic ${Buffer.from(
        `${zoomId}:${zoomPass}`
    ).toString("base64")}`;
    const body = {
        grant_type: "client_credentials",
    };
    const headers = {
        authorization: basicAuth,
        "Content-Type": "application/json",
    };

    const response = await axios.post(zoomTokenUrl, body, { headers });
    return response.data.access_token;
}



app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
