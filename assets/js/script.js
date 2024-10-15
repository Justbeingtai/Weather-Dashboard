// Define the API key for OpenWeatherMap
const API_KEY = '281f84e559b86b489a067979597037f7'; 

// Get references to necessary DOM elements
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const currentWeatherDisplay = document.getElementById('current-weather');
const forecastDisplay = document.getElementById('forecast-display');
const searchHistory = document.getElementById('search-history');

// Fetch the coordinates (latitude and longitude) of a city using the OpenWeatherMap Geocoding API
function getCoordinates(cityName) {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    return fetch(geoUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                throw new Error('City not found');
            }
            return {
                lat: data[0].lat,
                lon: data[0].lon
            };
        })
        .catch(error => {
            console.error(error);
            alert('Error: Could not find city');
        });
}

// Fetch the weather data using the coordinates
function getWeather(lat, lon) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    return fetch(weatherUrl)
        .then(response => response.json());
}

// Display the current weather data
function displayCurrentWeather(data) {
    const currentWeather = data.list[0];
    const city = data.city.name;
    const date = new Date(currentWeather.dt * 1000).toLocaleDateString();
    const temperature = currentWeather.main.temp;
    const humidity = currentWeather.main.humidity;
    const windSpeed = currentWeather.wind.speed;
    const weatherIcon = `http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`;

    currentWeatherDisplay.innerHTML = `
        <h2>${city}</h2>
        <p id="current-date">${date}</p>
        <img src="${weatherIcon}" alt="Weather Icon">
        <p>Temperature: ${temperature}°C</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed} m/s</p>
    `;
}

// Display the 5-day weather forecast
function displayForecast(data) {
    forecastDisplay.innerHTML = '';
    for (let i = 0; i < data.list.length; i += 8) { // The API provides data every 3 hours, so we skip 8 (24-hour intervals)
        const forecastItem = data.list[i];
        const date = new Date(forecastItem.dt * 1000).toLocaleDateString();
        const temperature = forecastItem.main.temp;
        const humidity = forecastItem.main.humidity;
        const windSpeed = forecastItem.wind.speed;
        const weatherIcon = `http://openweathermap.org/img/wn/${forecastItem.weather[0].icon}@2x.png`;

        forecastDisplay.innerHTML += `
            <div class="forecast-item">
                <h4>${date}</h4>
                <img src="${weatherIcon}" alt="Weather Icon">
                <p>Temp: ${temperature}°C</p>
                <p>Humidity: ${humidity}%</p>
                <p>Wind Speed: ${windSpeed} m/s</p>
            </div>
        `;
    }
}

// Update and store search history in localStorage
function updateSearchHistory(city) {
    let history = JSON.parse(localStorage.getItem('history')) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem('history', JSON.stringify(history));
        displaySearchHistory();
    }
}

// Display search history from localStorage on page load
function displaySearchHistory() {
    let history = JSON.parse(localStorage.getItem('history')) || [];
    searchHistory.innerHTML = '';  
    history.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.addEventListener('click', () => {
            getCoordinates(city)
                .then(coords => getWeather(coords.lat, coords.lon))
                .then(weatherData => {
                    displayCurrentWeather(weatherData);
                    displayForecast(weatherData);
                });
        });
        searchHistory.appendChild(li);
    });
}

// Event listener for the search button to trigger the weather search and display
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city === '') {
        return;
    }

    getCoordinates(city)
        .then(coords => getWeather(coords.lat, coords.lon))
        .then(weatherData => {
            displayCurrentWeather(weatherData);
            displayForecast(weatherData);
            updateSearchHistory(city);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
});

// Call the displaySearchHistory function on page load to show saved search history
displaySearchHistory();
