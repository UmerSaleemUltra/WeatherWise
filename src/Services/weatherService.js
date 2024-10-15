const apiKey = 'c24b5c0929dd458481f202142242204'; // Replace with your actual API key

// Function to get current weather data for a specific city
export const getWeatherData = async (city) => {
  const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  const data = await response.json();
  return data;
};

// Function to get weekly forecast data for a specific city
export const getWeeklyForecast = async (city) => {
  const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch weekly forecast');
  }
  const data = await response.json();
  return data.forecast.forecastday;
};

// Function to get hourly forecast data for a specific city
export const getHourlyForecast = async (city) => {
  const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&hours=12`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch hourly forecast');
  }
  const data = await response.json();
  return data.forecast.forecastday[0].hour;
};

// Function to get historical weather data for a specific city
export const getHistoricalWeather = async (city, date) => {
  const apiUrl = `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${city}&dt=${date}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch historical weather data');
  }
  const data = await response.json();
  return data;
};
