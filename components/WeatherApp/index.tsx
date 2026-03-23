// Enable client-side rendering in Next.js
'use client';

// Import React hooks and third-party libraries
import { useState } from 'react';
import axios from 'axios';
import './index.css';

// Type definition for weather data returned from API
export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  feelsLike: number;
  windSpeed: number;
}

// Props interface for the WeatherApp component
interface WeatherAppProps {
  apiKey?: string;  // Optional API key for OpenWeatherMap (defaults to env variable)
}

// Main WeatherApp component that fetches and displays weather information
export default function WeatherApp({ apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '' }: WeatherAppProps) {
  // State: user input for city name
  const [city, setCity] = useState('');
  // State: fetched weather data
  const [weather, setWeather] = useState<WeatherData | null>(null);
  // State: error messages to display to user
  const [error, setError] = useState<string | null>(null);
  // State: loading indicator for API request
  const [loading, setLoading] = useState(false);

  // Fetches weather data from OpenWeatherMap API based on city input
  const fetchWeather = async () => {
    // Validate that user has entered a city name
    if (!city.trim()) {
      setError('Please enter a city name.');
      return;
    }

    // Clear previous state and enable loading indicator
    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      // Call OpenWeatherMap API with city name and API key
      const response = await axios.get(
        process.env.NEXT_PUBLIC_OPENWEATHER_API_URL || '',
        {
          params: {
            q: city.trim(),
            appid: apiKey,
            units: 'metric',
          },
        }
      );

      // Extract data from API response
      const data = response.data;
      // Transform API response into WeatherData format and update state
      setWeather({
        city: data.name,
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        feelsLike: Math.round(data.main.feels_like),
        windSpeed: data.wind.speed,
      });
    } catch (err: any) {
      // Handle different types of errors from API request
      if (err.response?.status === 404) {
        setError('City not found. Please check the city name and try again.');
      } else if (err.response?.status === 401) {
        setError('Invalid API key. Please check your configuration.');
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } finally {
      // Always disable loading indicator when request completes
      setLoading(false);
    }
  };

  // Allow user to search by pressing Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') fetchWeather();
  };

  // Render the weather app UI
  return (
    <div className="weather-container">
      <div className="weather-card">
        {/* Header section with title */}
        <div className="header">
          <h1 className="title">Weather</h1>
        </div>

        {/* Search section with input and button */}
        <div className="search-section">
          <div className="input-wrapper">
            {/* Text input for city name */}
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter city name..."
              className="city-input"
              aria-label="City name"
              data-testid="city-input"
            />
          </div>
          {/* Search button with loading spinner */}
          <button
            onClick={fetchWeather}
            disabled={loading}
            className="search-button"
            data-testid="search-button"
            aria-label="Search weather"
          >
            {loading ? <span className="spinner" /> : 'SEARCH'}
          </button>
        </div>

        {/* Error message display */}
        {error && (
          <div className="error-box" role="alert" data-testid="error-message">
            <span className="error-icon">⚠</span>
            <p>{error}</p>
          </div>
        )}

        {/* Weather results section - displayed when data is fetched */}
        {weather && (
          <div className="weather-result" data-testid="weather-result">
            {/* Display city name */}
            <div className="city-name">{weather.city}</div>
            {/* Main weather display with icon and temperature */}
            <div className="weather-main">
              {/* Current temperature display */}
              <div className="temperature" data-testid="temperature">
                {weather.temperature}°C
              </div>
            </div>
            {/* Weather description */}
            <div className="description" data-testid="description">
              {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
            </div>
            {/* Additional weather details in a 3-column grid */}
            <div className="weather-details">
              {/* Humidity card */}
              <div className="detail-card" data-testid="humidity">
                <span className="detail-icon">Humidity</span>
                <span className="detail-value">{weather.humidity}%</span>
                <span className="detail-label">Humidity</span>
              </div>
              {/* Feels like temperature card */}
              <div className="detail-card" data-testid="feels-like">
                <span className="detail-icon">Temperature</span>
                <span className="detail-value">{weather.feelsLike}°C</span>
                <span className="detail-label">Feels Like</span>
              </div>
              {/* Wind speed card */}
              <div className="detail-card" data-testid="wind-speed">
                <span className="detail-icon">Weather</span>
                <span className="detail-value">{weather.windSpeed} m/s</span>
                <span className="detail-label">Wind</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
