const express = require("express");
const cors = require("cors");
const axios = require("axios");


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Zoom credentials
let prod = true;
const zoomApiKey = prod
    ? "b0Jhi0eTQg6SoHq9bcmLX6ldVlzM1OU9Wyuuurl3"
    : "DqRzg8il66Qz7kXUzlHy3EyKejdfAdM12Rl7rNC2";
const zoomApiUrl = prod
    ? "https://partner-api.zoomcar.com/"
    : "https://sandbox.zoomcartest.com/";
const apiVer = "v2/";
const zoomId = prod ? "letzrent" : "bw10lmnvbmmts56b29ty2fy";
const zoomPass = prod
    ? "d&8rv#G9o9pvZ8P>D}M9"
    : "ZWIxZmQyNTIxN2Qx*YzkwNDc4Y2FjMzhh";

const GOOGLE_API_KEY = "AIzaSyD4d4ZEpEFIc290yb6WNaiTQsnM-rt4cJQ"; // Replace with your Google Places API Key

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

app.get("/zoomcar/cities", async (req, res) => {
    try {
        const token = await getZoomToken();
        const citiesUrl = `${zoomApiUrl}${apiVer}cities`;
        const headers = {
            Authorization: `Bearer ${token}`,
            "x-api-key": zoomApiKey,
            "Content-Type": "application/json",
        };
        
        const response = await axios.get(citiesUrl, { headers });
        if (!response.data || !response.data.cities) {
            return res.status(500).json({ error: "Invalid response from Zoomcar API" });
        }

        const cityNames = response.data.cities.map(city => city.name);
        res.json({ cities: cityNames });
    } catch (error) {
        console.error("Error fetching cities:", error);
        res.status(500).json({ error: "Failed to fetch cities" });
    }
});
/*
async function getUserToken() {

    try{
    const authURL = `${zoomApiUrl}${apiVer}users/auth`;
        const token = await getZoomToken();
        const headers = {
            "Content-Type": "application/json",
            "x-api-key": zoomApiKey,
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        };

    const body = {
        user_hash_id: "#", 
    };

    const response = await axios.post(authURL, body, { headers });
   

    if (response.data && response.data.status === 1 && response.data.user_token) {
        return response.data.user_token; // Return the user token
    } else {
        throw new Error(response.data?.msg || "Failed to fetch user token.");
    }
    } catch (error) {
        console.error("Error fetching user token:", {
            message: error.message,
            responseData: error.response?.data,
            responseStatus: error.response?.status,
        });
        throw error; // Re-throw error for caller to handle
    }
}*/




app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
