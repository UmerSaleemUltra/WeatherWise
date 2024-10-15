import { useEffect, useState } from 'react';
import { getWeatherData, getWeeklyForecast, getHourlyForecast } from './Services/weatherService';
import {
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Autocomplete,
  Grid,
  Snackbar,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const fetchCitySuggestions = async (query) => {
  const response = await fetch(`https://api.weatherapi.com/v1/search.json?key=c24b5c0929dd458481f202142242204&q=${query}`);
  return response.json();
};

const WeatherDashboard = () => {
  const [city, setCity] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [hourly, setHourly] = useState(null);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || []);
  const [unit, setUnit] = useState(localStorage.getItem('unit') || 'C');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch weather data for the searched city
  useEffect(() => {
    if (searchCity) {
      setLoading(true);
      setError('');
      const fetchWeather = async () => {
        try {
          const data = await getWeatherData(searchCity);
          if (data.error) {
            throw new Error(data.error.message);
          }
          setWeather(data);
          const forecastData = await getWeeklyForecast(searchCity);
          const hourlyData = await getHourlyForecast(searchCity);
          setForecast(forecastData.forecast);
          setHourly(hourlyData.hourly);
        } catch (error) {
          setError(`Error: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };
      fetchWeather();
    }
  }, [searchCity]);

  // Fetch city suggestions as the user types
  useEffect(() => {
    if (city.trim()) {
      const fetchSuggestions = async () => {
        const suggestions = await fetchCitySuggestions(city);
        setCitySuggestions(suggestions);
      };
      fetchSuggestions();
    } else {
      setCitySuggestions([]);
    }
  }, [city]);

  // Handle city search
  const handleSearch = () => {
    if (city.trim()) {
      setSearchCity(city);
      setCity('');
    }
  };

  // Add city to favorites
  const addFavorite = () => {
    if (weather && !favorites.includes(weather.location.name)) {
      const newFavorites = [...favorites, weather.location.name];
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setSnackbarMessage(`${weather.location.name} added to favorites!`);
      setSnackbarOpen(true);
    }
  };

  // Remove city from favorites
  const removeFavorite = (city) => {
    const newFavorites = favorites.filter(fav => fav !== city);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setSnackbarMessage(`${city} removed from favorites!`);
    setSnackbarOpen(true);
  };

  // Fetch weather for favorite city
  const fetchFavoriteWeather = async (city) => {
    setLoading(true);
    setError('');
    try {
      const data = await getWeatherData(city);
      if (data.error) {
        throw new Error(data.error.message);
      }
      setWeather(data);
      const forecastData = await getWeeklyForecast(city);
      const hourlyData = await getHourlyForecast(city);
      setForecast(forecastData.forecast);
      setHourly(hourlyData.hourly);
    } catch (error) {
      setError(`Error fetching weather for ${city}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Temperature conversion
  const convertTemp = (temp) => {
    return unit === 'C' ? temp : (temp * 9 / 5) + 32;
  };

  // Toggle temperature unit
  const toggleUnit = () => {
    const newUnit = unit === 'C' ? 'F' : 'C';
    setUnit(newUnit);
    localStorage.setItem('unit', newUnit); // Store the selected unit in localStorage
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto bg-white text-black rounded-lg shadow-lg">
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Autocomplete
            freeSolo
            options={citySuggestions.map(option => option.name)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="City"
                variant="outlined"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4} className="flex">
          <Button variant="contained" onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">Search</Button>
          <IconButton onClick={addFavorite} className="ml-2">
            <FavoriteIcon color="primary" />
          </IconButton>
          <Button variant="outlined" onClick={toggleUnit} className="ml-2">
            {unit === 'C' ? 'Switch to °F' : 'Switch to °C'}
          </Button>
        </Grid>
      </Grid>

      {loading && (
        <div className="flex justify-center">
          <CircularProgress />
          <p className="ml-2">Loading weather data...</p>
        </div>
      )}

      {error && <p className="text-red-600 text-center">{error}</p>}

      {weather && (
        <div className="bg-blue-100 p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold">{weather.location.name}</h1>
          <img src={weather.current.condition.icon} alt={weather.current.condition.text} />
          <p>{weather.current.condition.text}</p>
          <p>Temperature: {convertTemp(weather.current.temp_c).toFixed(1)} °{unit}</p>
          <p>Humidity: {weather.current.humidity}%</p>
          <p>Wind: {weather.current.wind_kph} kph {weather.current.wind_dir}</p>
          <p>Pressure: {weather.current.pressure_mb} mb</p>
          <p>Cloud Cover: {weather.current.cloud}%</p>
        </div>
      )}

      <Typography variant="h6" className="font-semibold">Favorite Cities</Typography>
      {favorites.length > 0 ? (
        <div className="space-y-4">
          {favorites.map((favCity) => (
            <div key={favCity} className="flex justify-between items-center p-4 bg-gray-200 rounded-md">
              <span>{favCity}</span>
              <div className="flex">
                <Button variant="outlined" onClick={() => fetchFavoriteWeather(favCity)} className="mr-2">
                  Get Weather
                </Button>
                <IconButton onClick={() => removeFavorite(favCity)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No favorite cities added.</p>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </div>
  );
};

export default WeatherDashboard;
