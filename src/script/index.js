"use strict";
const apiKey = "ZTP45N2BUEBFFTMBFHLHAPCC7";

//doc: DOM elements
const serverErrorText = document.getElementById('server-error');
const selectCityWrapper = document.getElementById('select-city-wrapper');
const cityesStatick = document.getElementById('cityes-statick');
const selectCityImage = document.getElementById('select-city-image');
const selectCity = document.getElementById('select-city');
const selectCityTemp = document.getElementById('select-city-temp');
const selectCityHumidity = document.getElementById('select-city-humidity');
const selectCityMaxSpeedWind = document.getElementById('select-city-max-speed-wind');
const selectCityPressure = document.getElementById('select-city-pressure');
const selectCityWeatherName = document.getElementById('select-city-weather-name');
const selectCityDate = document.getElementById('select-city-date');
const selectCityHourlyWrapper = document.getElementById('select-city-hourly-wrapper');
const selectCityDayWrapper = document.getElementById('select-city-weekly-wrapper');
const searchInput = document.getElementById('search');
const reloadBtn = document.getElementById('reload');
const mainLoader = document.getElementById('main-loader');
const popularCitiesLoader = document.getElementById('popular-loader');
const selectedCitiesLoader = document.getElementById('selected-loader');

//doc: loader animation delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let isLoadingPopularCities;
let isLoadingSelectedCity;

//doc: when content is loading
const loadingPopularCities = (isLoading) => {
  isLoadingPopularCities = isLoading;
  if (isLoading) {
    popularCitiesLoader.style.opacity = '1';
    popularCitiesLoader.style.display = 'flex';
  } else {
    popularCitiesLoader.style.opacity = '0';
    popularCitiesLoader.style.display = 'none';
  }
}

const loadingSelectedCities = (isLoading, wrapper) => {
  isLoadingSelectedCity = isLoading;
  if (isLoading) {
    selectedCitiesLoader.style.opacity = '1';
    selectedCitiesLoader.style.display = 'flex';
    wrapper.style.opacity = '0';
    wrapper.style.display = 'none';
  } else {
    selectedCitiesLoader.style.opacity = '0';
    selectedCitiesLoader.style.display = 'none';
    wrapper.style.opacity = '1';
    wrapper.style.display = 'flex';
  }
}

const checkLoaders = () => {
  if (isLoadingPopularCities || isLoadingSelectedCity) {
    mainLoader.style.opacity = '1';
    mainLoader.style.display = 'flex';
    popularCitiesLoader.style.opacity = '0';
    popularCitiesLoader.style.display = 'none';
    selectedCitiesLoader.style.opacity = '0';
    selectedCitiesLoader.style.display = 'none';
  } else {
    mainLoader.style.opacity = '0';
    mainLoader.style.display = 'none';
  }
};

class WeatherWidget {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseApiUrl = `https://weather.visualcrossing.com`;
  }

  //doc: method for fetch popular cities
  async fetchPopularCitiesApi() {
    loadingPopularCities(true);
    checkLoaders();
    try {
      await delay(800);
      const responses = await Promise.all([
        fetch(`${this.baseApiUrl}/VisualCrossingWebServices/rest/services/timeline/Kyiv?unitGroup=metric&key=${this.apiKey}&contentType=json`),
        fetch(`${this.baseApiUrl}/VisualCrossingWebServices/rest/services/timeline/London?unitGroup=metric&key=${this.apiKey}&contentType=json`),
        fetch(`${this.baseApiUrl}/VisualCrossingWebServices/rest/services/timeline/Warsaw?unitGroup=metric&key=${this.apiKey}&contentType=json`),
        fetch(`${this.baseApiUrl}/VisualCrossingWebServices/rest/services/timeline/Berlin?unitGroup=metric&key=${this.apiKey}&contentType=json`),
        fetch(`${this.baseApiUrl}/VisualCrossingWebServices/rest/services/timeline/Paris?unitGroup=metric&key=${this.apiKey}&contentType=json`),
      ]);
      const dataPromises = responses.map(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status:${response.status}`);
        }
        return response.json();
      });
      const [kievData, londonData, warsawData, berlinData,
        parisData] = await Promise.all(dataPromises);
      return [kievData, londonData, warsawData, berlinData, parisData];
    } catch (error) {
      console.error(error);
    } finally {
      loadingPopularCities(false);
      checkLoaders();
    }
  }

  //doc: method for fetch selected city
  async fetchSelectedCityApi(location = 'Vinnitsa') {
    loadingSelectedCities(true, selectCityWrapper);
    checkLoaders();
    try {
      await delay(1200);
      const response = await fetch(`${this.baseApiUrl}/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=${this.apiKey}&contentType=json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data)
      return data;
    } catch (error) {
      console.error(error);
      selectCityWrapper.innerHTML = "";
      serverErrorText.style.display = "block";
    } finally {
      loadingSelectedCities(false, selectCityWrapper);
      checkLoaders();
    }
  }

  //doc: method for render popular cities(default)
  async renderPopularCities() {
    //doc: reset data
    cityesStatick.innerHTML = '';

    //doc: fetch data from api, then render
    const weatherStaticData = await this.fetchPopularCitiesApi();

    //doc: render popular cities(static)
    weatherStaticData.map((data) => {
      const cardHTML = `
           <div class="weather-widget__popular-card">
             <p class="weather-widget__popular-name">
               ${data.address}
             </p>
             <img class="weather-widget__popular-img" src="src/img/${data.currentConditions.icon}.svg" alt="${data.conditions}">
             <p class="weather-widget__popular-temp">
               ${Math.round(data.currentConditions.temp)}°C
             </p>
          </div>
      `;
      cityesStatick.innerHTML += cardHTML;
    });
  }

  //doc: method for render select city(input value)
  async renderSelectCity() {
    //doc: reset data
    selectCityHourlyWrapper.innerHTML = '';
    selectCityDayWrapper.innerHTML = '';

    //doc: fetch data from api, then render
    const weatherCustomData = await this.fetchSelectedCityApi(this.location);
    const cityDate = new Date(weatherCustomData.days[0].datetime).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    //doc: render selected city information
    selectCityDate.textContent = cityDate;
    selectCityImage.src = `src/img/${weatherCustomData.currentConditions.icon}.svg`;
    selectCity.textContent = weatherCustomData.resolvedAddress;
    selectCityTemp.textContent = `${Math.round(weatherCustomData.currentConditions.temp)}°C`;
    selectCityWeatherName.textContent = weatherCustomData.currentConditions.conditions;
    selectCityHumidity.textContent = `${weatherCustomData.currentConditions.humidity}%`;
    selectCityMaxSpeedWind.textContent = `${Math.round(weatherCustomData.days[0].windspeed)} km/h`;
    selectCityPressure.textContent = `${Math.round(weatherCustomData.currentConditions.pressure)} hPa`;

    //doc: hours weather
    weatherCustomData.days[0].hours.forEach((hour) => {
      // variable
      const hours = hour.datetime.slice(0, 5);
      const temperature = Math.round(hour.temp);

      // card render
      const cardHTML = `
        <div class="weather-widget__forecast-card">
          <p class="weather-widget__forecast-name">
            ${hours}
          </p>
          <img class="weather-widget__forecast-image" src="src/img/${hour.icon}.svg" alt="${hour.conditions}">
          <p class="weather-widget__forecast-temp">
            ${temperature}°C
          </p>
        </div>
      `;
      selectCityHourlyWrapper.innerHTML += cardHTML;
    });

    //doc: weekly weather
    weatherCustomData.days.forEach((day) => {
      // option
      const dateOptionConfig = new Date(day.datetime).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
      });
      const temperatureMin = Math.round(day.tempmin);
      const temperatureMax = Math.round(day.tempmax);

      // card render
      const cardHTML = `
        <div class="weather-widget__weekly-card">
          <p class="weather-widget__weekly-name">${dateOptionConfig}</p>
          <img class="weather-widget__weekly-image" src="src/img/${day.icon}.svg" alt="${day.conditions}">
          <p class="weather-widget__weekly-temp">${temperatureMin}°C/${temperatureMax}°C</p>
        </div>
      `;

      selectCityDayWrapper.innerHTML += cardHTML;
    });
  }
}

//doc: get api key
const widget = new WeatherWidget(apiKey);

//doc: load popular cities and select city when page is loaded
addEventListener("DOMContentLoaded", () => {
  widget.renderPopularCities();
  widget.renderSelectCity();
})

addEventListener("change", async (event) => {
  if (event.target === searchInput) {
    widget.location = event.target.value;
    await widget.renderSelectCity();
  }
})
reloadBtn.addEventListener("click", (e) => {
  serverErrorText.style.display = "none";
  widget.renderPopularCities();
  widget.renderSelectCity();
})
