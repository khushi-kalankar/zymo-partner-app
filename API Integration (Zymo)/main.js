// Zoom car API
function apiTest() {
    const url = "http://localhost:3000/zoomcar/search";
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            const cardSection = document.getElementById("card-section");
            cardSection.innerHTML = "";
            
            const header = data.sections[0].header;
            document.querySelector(".header").textContent = header;

            const cars = data.sections[0].cards;
            let count = 1;
            cars.forEach((car) => {
                const card = document.createElement("div");
                card.classList.add("card");
                card.innerHTML = getCardHTML(car, count);

                cardSection.appendChild(card);
                
                count += 1;
            });
            
        })
        .catch((error) => console.error("Error", error));
}

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
function bookCar(button) {
    const carId = button.getAttribute("data-car-id");
    const cargroupId = button.getAttribute("data-cargroup-id");
    const locationId = button.getAttribute("data-location-id");
    const pricingId = button.getAttribute("data-pricing-id");
    const city = button.getAttribute("data-city");
    const starts =new Date().getTime() + 120 * 60 * 1000;
    const ends = starts+ 2 * 24 * 60 * 60 * 1000; // 2 days from start

    fetch("http://localhost:3000/zoomcar/book", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            carId,
            cargroupId,
            locationId,
            pricingId,
            city,
            starts,
            ends,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(`Booking failed: ${data.error}`);
            } else {
                alert(`Booking successful! Confirmation Key: ${data.booking.confirmation_key}`);
                console.log(data);
            }
        })
        .catch((error) => console.error("Booking error:", error));
}

function getCardHTML(car, count) {
    return `
    <div class="count">${count}</div>
    <img class="card-img" src="${car.car_data.image_urls[0]}">
    <div class="card-description">
        <span>Brand: <span class="brand">${car.car_data.brand}</span></span>
        <span>Model: <span class="model">${car.car_data.name}</span></span>
        <span>Amount: <span class="amount">${car.car_data.pricing.payable_amount}</span></span>
        <div class="card-tags">
            <span class="tag1">${car.car_data.accessories[0]}</span>
            <span class="tag2">${car.car_data.accessories[1]}</span>
            <span class="tag3">${car.car_data.accessories[2]}</span>
        </div>
         <button 
            onclick="bookCar(this)"
            data-car-id="${car.car_data.car_id}"
            data-cargroup-id="${car.car_data.cargroup_id}"
            data-location-id="${car.car_data.location.location_id}"
            data-pricing-id="${car.car_data.pricing.id}"
            data-city="Bangalore">
            Book Now
        </button>
    </div>
    `;
}
