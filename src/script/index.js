"use strict";
const location = "Vinnitsa, Ukraine";
const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=ZTP45N2BUEBFFTMBFHLHAPCC7&contentType=json`;

// api url

async function fetchWeatherApi() {
  try {
    console.log('start fetching');
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log(data);
  } catch (e) {
    console.log(e);
  } finally {
    console.log('finish fetching');
  }
}

fetchWeatherApi();

