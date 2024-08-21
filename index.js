const container = document.querySelector(".container");
const searchBtn = document.querySelector("#search-btn");
const searchLocationBtn = document.querySelector("#search-location");
const weatherBox = document.querySelector(".weather-box");
const weatherDetails = document.querySelector(".weather-details");
const error404 = document.querySelector(".not-found");

const APIkey = 'a9342e881b75f312e8286565cb413e7b';

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
    locationName.innerHTML = `${json.name}, ${json.sys.country}`; // Display location name and country
}

function fetchWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}&units=metric`)
        .then(response => response.json())
        .then(json => {
            //console.log('API Response:', json);
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

searchBtn.addEventListener("click", () => {
    const city = document.querySelector('.search-box input').value;
    if (city === '')
         return;
    fetchWeather(city);
});

searchLocationBtn.addEventListener("click", () => {
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
                });
        }, () => {
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});
