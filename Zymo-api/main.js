
function getcities() {
    const url = "http://localhost:3000/zoomcar/cities";
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
        })
        .catch((error) => console.error("Error", error));
}
async function fetchCities() {
    const query = document.getElementById("city-input").value.trim();
    if (query.length < 2) return; // Fetch only when at least 2 characters are typed

    const apiUrl = `http://localhost:3000/indian-cities?query=${query}`; // Pass query to backend

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cities) {
            displayCities(data.cities);
        } else {
            console.error("Error: Invalid response");
        }
    } catch (error) {
        console.error("Error fetching cities:", error);
    }
}

function displayCities(cities) {
    const citiesList = document.getElementById("cities-list");
    citiesList.innerHTML = ""; // Clear previous results

    cities.forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;
        citiesList.appendChild(li);
    });
}
