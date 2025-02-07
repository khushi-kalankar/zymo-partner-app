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

app.get("/zoomcar/search", async (req, res) => {
    try {
        const token = await getZoomToken();
        const apiURL =`${zoomApiUrl}${apiVer}search?`;
        const apiKey = "DqRzg8il66Qz7kXUzlHy3EyKejdfAdM12Rl7rNC2";
        
        const startEpochMillis = new Date().getTime() + 120 * 60 * 1000;
 const endEpochMillis = startEpochMillis + 2 * 24 * 60 * 60 * 1000; // 2 days from start
        const parameters = `starts_epoch=${startEpochMillis}&ends_epoch=${endEpochMillis}`;
        const latLong = "lat=12.971599&lng=77.594566";
        const country = "country_code=IND";
        const city = "city=Bangalore";
        const type = "type=hd";

        const header = {
            "Content-Type": "application/json",
            "x-api-key":  zoomApiKey,
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
        };

        const fetchUrl = `${apiURL}${latLong}&${city}&${country}&${parameters}&${type}`;
        console.log(fetchUrl);
        const response = await axios.get(fetchUrl, { headers: header });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: error.message,
        });
    }
});   

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

async function getUserToken() {

    try{
    const authURL = `${zoomApiUrl}${apiVer}users/auth`;
        const token = await getZoomToken();
        const headers = {
            "Content-Type": "application/json",
            "x-api-key": zoomApiKey,
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
        };

    const body = {
        user_hash_id: "chogV8noqsYgNXbTIo1pQ4dhRBa2", 
    };

    const response = await axios.post(authURL, body, { headers });
   /*onsole.log("User Token Response:", response.data);*/

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
}

app.post("/zoomcar/book", async (req, res) => {
    try {
        const {
            carId,
            city,
            pricingId,
            starts,
            ends,
            cargroupId,
            locationId,
            
        } = req.body;

        const userToken = await getUserToken();
        const bearerToken = await getZoomToken();
        // Validate required fields
        if (!carId || !city  || !pricingId || !starts || !ends || !cargroupId || !locationId) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // URL and headers
        const bookingUrl =`${zoomApiUrl}${apiVer}bookings`;
        const apiKey = "DqRzg8il66Qz7kXUzlHy3EyKejdfAdM12Rl7rNC2";
        const headers = {
            "Content-Type": "application/json",
            "x-api-key": zoomApiKey,
            Authorization: `Bearer ${bearerToken}`,
            "USER-TOKEN": userToken,
        };

        // Booking payload
        const bookingData = {
            booking_params: {
                type: "normal",
                cargroup_id: cargroupId,
                car_id: carId,
                city: city,
                defer_deposit: false,
                search_location_id: "326",
                ends: ends, // End time in milliseconds
                fuel_included: true,
                lat:  12.961, // Use default if not provided
                lng:  77.6371, // Use default if not provided
                pricing_id: pricingId,
                starts: starts, // Start time in milliseconds
                location_id: locationId,
            },
        };

        // Make the API request
        const response = await axios.post(bookingUrl, bookingData, { headers });
        console.log("Booking response:", response.data);
        // Respond with booking data
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error making booking request:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.msg || "Failed to process booking.",
        });
    }
});


app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
