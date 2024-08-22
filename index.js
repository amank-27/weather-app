const container = document.querySelector(".container");
const searchBtn = document.querySelector("#search-btn");
const searchLocationBtn = document.querySelector("#search-location");
const weatherBox = document.querySelector(".weather-box");
const weatherDetails = document.querySelector(".weather-details");
const error404 = document.querySelector(".not-found");
const recentSearchesContainer = document.querySelector('.recentList');
const recentSearchDiv = document.querySelector('.recent-search');

const APIkey = 'a9342e881b75f312e8286565cb413e7b';

// Update the weather information on the UI
function updateWeatherUI(json) {
    const image = document.querySelector('.weather-box img');
    const temperature = document.querySelector('#temp');
    const description = document.querySelector('#info');
    const humidity = document.querySelector('#s');
    const wind = document.querySelector('#s1');
    const locationName = document.querySelector('#location-name');

    switch (json.weather[0].main) {
        case 'Clear':
            image.src = 'clear.png';
            break;
        case 'Rain':
            image.src = 'rain.png';
            break;
        case 'Snow':
            image.src = 'snow.png';
            break;
        case 'Clouds':
            image.src = 'cloud.png';
            break;
        case 'Mist':
            image.src = 'mist.png';
            break;
        case 'Haze':
            image.src = 'mist.png';
            break;
        default:
            image.src = 'cloud.png';
    }
    temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
    description.innerHTML = `${json.weather[0].description}`;
    humidity.innerHTML = `${json.main.humidity}%`;
    wind.innerHTML = `${parseInt(json.wind.speed)}Km/h`;
    locationName.innerHTML = `${json.name}, ${json.sys.country}`; 
}

// Fetch weather data from the API
function fetchWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}&units=metric`)
        .then(response => response.json())
        .then(json => {
            if (json.cod === '404') {
                container.style.height = '400px';
                weatherBox.classList.remove('active');
                weatherDetails.classList.remove('active');
                error404.classList.add('active');
                return;
            }
            container.style.height = '500px';
            weatherBox.classList.add('active');
            weatherDetails.classList.add('active');
            error404.classList.remove('active');
            updateWeatherUI(json);
        });
}

// Get recent searches from localStorage
function getRecentSearches() {
    return JSON.parse(localStorage.getItem('recentSearches')) || [];
}

// Save recent searches to localStorage
function saveRecentSearches(searches) {
    localStorage.setItem('recentSearches', JSON.stringify(searches));
}

// Update recent searches list in the UI
function updateRecentSearchesUI() {
    recentSearchesContainer.innerHTML = ''; // Clear existing list
    const searches = getRecentSearches();
    searches.forEach(search => {
        const item = document.createElement('div');
        item.className = 'recentItem flex items-center p-1';
        item.innerHTML = `<button><i class='bx bx-history pr-[10px] text-[20px]'></i></button><p>${search}</p>`;
        // Ensure the click event is added to the new item
        item.querySelector('button').addEventListener('click', () => fetchWeather(search));
        recentSearchesContainer.appendChild(item);
    });
}

// Add a new search to the recent searches
function addRecentSearch(city) {
    const searches = getRecentSearches();
    if (searches.includes(city)) {
        // Move the city to the top if it already exists
        searches.splice(searches.indexOf(city), 1);
    }
    searches.unshift(city);
    if (searches.length > 5) {
        searches.pop(); // Keep only the latest 5 searches
    }
    saveRecentSearches(searches);
    updateRecentSearchesUI();
}

// Handle the search button click
searchBtn.addEventListener('click', () => {
    const city = document.querySelector('.search-box input').value.trim();
    if (city === '') return;
    fetchWeather(city);
    addRecentSearch(city); // Add the new search to the list
});

// Handle the search location button click (geolocation)
searchLocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIkey}&units=metric`)
                .then(response => response.json())
                .then(json => {
                    if (json.cod === '404') {
                        container.style.height = '400px';
                        weatherBox.classList.remove('active');
                        weatherDetails.classList.remove('active');
                        error404.classList.add('active');
                        return;
                    }
                    container.style.height = '500px';
                    weatherBox.classList.add('active');
                    weatherDetails.classList.add('active');
                    error404.classList.remove('active');
                    updateWeatherUI(json);
                    addRecentSearch(json.name); // Add the location to the recent searches
                });
        }, () => {
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// Initialize the recent searches list on page load
updateRecentSearchesUI();
