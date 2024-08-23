const container = document.querySelector(".container");
const searchBtn = document.querySelector("#search-btn");
const searchLocationBtn = document.querySelector("#search-location");
const weatherBox = document.querySelector(".weather-box");
const weatherDetails = document.querySelector(".weather-details");
const error404 = document.querySelector(".not-found");
const recentSearchesContainer = document.querySelector('.recentList');
const recentSearchDiv = document.querySelector('.recent-search');
const cardsContainer = document.querySelector(".cards");
const APIkey = 'a9342e881b75f312e8286565cb413e7b';

// updating the weather information 
function updateWeatherUI(json) {
    const image = document.querySelector('.weather-box img');
    const temperature = document.querySelector('#temp');
    const description = document.querySelector('#info');
    const humidity = document.querySelector('#s');
    const wind = document.querySelector('#s1');
    const locationName = document.querySelector('#location-name');

   // console.log('Weather Data:', json); // Debugging line

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

// fetching weather data from the API
function fetchWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}&units=metric`)
        .then(response => response.json())
        .then(json => {
           // console.log('API Response:', json); // Debugging line
            //i have added classlist remove add to hide the image when shoeing error and vice versa
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
            fetchWeatherForecast(city); // fetch weather forecast
        });
}

// fetching 5-day weather forecast from the API
function fetchWeatherForecast(city) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIkey}&units=metric`)
        .then(response => response.json())
        .then(json => {
          //  console.log('Forecast Data:', json); // Debugging line
            updateForecastUI(json.list); // updating the weather
        });
}

// Update the forecast cards with 5-day data
function updateForecastUI(forecastList) {
    cardsContainer.innerHTML = ''; // Clear existing cards

    // filter data to get one forecast per day (usually every 3 hours) //
    const dailyForecasts = forecastList.filter((_, index) => index % 8 === 0).slice(0, 5);
   // using element creation and putting cards in the html
    dailyForecasts.forEach((forecast, index) => {
        const card = document.createElement('div');
        card.className = `hover:text-[#0fb8eb] weather-card h-[20vh] w-[20%] bg-slate-${500 + (index * 100)} relative flex flex-col items-center justify-center`;

        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        const temp = `${parseInt(forecast.main.temp)}°C`;
        const humidity = `${forecast.main.humidity}%`;
        const wind = `${parseInt(forecast.wind.speed)} km/h`;
            //card data which is going to be shown
        card.innerHTML = `
            <p class="date p-1 text-center">${date}</p>
            <p class="temp text-center">${temp}</p>
            <div class="humidity flex">
                <i class="bx bx-water"></i>
                <div class="info-humidity">
                    <span class="humidity-value">${humidity}</span>
                </div>
            </div>
            <div class="wind flex">
                <i class="bx bx-wind"></i>
                <div class="info-wind">
                    <span class="wind-value">${wind}</span>
                </div>
            </div>
        `;

        cardsContainer.appendChild(card);
    });
}

// getting recent searches from localStorage
function getRecentSearches() {
    return JSON.parse(localStorage.getItem('recentSearches')) || [];
}

// saving recent searches to localStorage
function saveRecentSearches(searches) {
    localStorage.setItem('recentSearches', JSON.stringify(searches));
}

// updating recent searches list
function updateRecentSearchesUI() {
    recentSearchesContainer.innerHTML = ''; // clearing existing list
    const searches = getRecentSearches();
    searches.forEach(search => {
        const item = document.createElement('div');
        item.className = 'recentItem flex items-center p-1';
        item.innerHTML = `<button><i class='bx bx-history pr-[10px] text-[20px]'></i></button><p>${search}</p>`;
    
        item.querySelector('button').addEventListener('click', () => fetchWeather(search));
        recentSearchesContainer.appendChild(item);
    });
}

// adding a rectent search city to input to fetch data
function addRecentSearch(city) {
    const searches = getRecentSearches();
    if (searches.includes(city)) {
        // move the city to the top if it already exists
        searches.splice(searches.indexOf(city), 1);
    }
    searches.unshift(city);
    if (searches.length > 5) {
        searches.pop(); // keeping only the latest 5 searches
    }
    saveRecentSearches(searches);
    updateRecentSearchesUI();
}


searchBtn.addEventListener('click', () => {
    const city = document.querySelector('.search-box input').value.trim();
    if (city === '') return;
    fetchWeather(city);
    addRecentSearch(city); // adding the new search to the list
});

// giving functionality to location button so to fetch current location
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
                    fetchWeatherForecast(json.name); // fetching the forecast for the current location
                    addRecentSearch(json.name); // adding the location to the recent searches
                });
        }, () => {
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// making sure the recent search remains on the page load
updateRecentSearchesUI();
