// Import testing utilities from React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Import user interaction simulator
import userEvent from '@testing-library/user-event';
// Import axios for mocking API calls
import axios from 'axios';
// Import the component under test
import WeatherApp from '@/components/WeatherApp';

// ─── Setup: Mock External API ────────────────────────────────────────────
// Mock axios to prevent real API calls and control responses in tests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// ─── Test Data ──────────────────────────────────────────────────────────
// Mock successful API response matching OpenWeatherMap API structure
const mockWeatherResponse = {
  data: {
    name: 'London',
    main: {
      temp: 15.6,
      humidity: 72,
      feels_like: 14.2,
    },
    weather: [{ description: 'light rain', icon: '10d' }],
    wind: { speed: 5.3 },
  },
};

// ─── Main Test Suite ────────────────────────────────────────────────────
describe('WeatherApp', () => {

  // Reset all mock tracking before each test to ensure isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Test Suite 1: User Input & Button Interactions ──────────────────
  // Tests for input field rendering, typing, button interactions, and validation
  describe('Input field and search button', () => {
    // Verify that input field and search button are rendered
    it('renders the input field and search button', () => {
      render(<WeatherApp apiKey="test-key" />);

      expect(screen.getByTestId('city-input')).toBeInTheDocument();
      expect(screen.getByTestId('search-button')).toBeInTheDocument();
    });

    // Verify that typing in the input field updates its value
    it('updates the input value when the user types', async () => {
      render(<WeatherApp apiKey="test-key" />);
      const input = screen.getByTestId('city-input');

      await userEvent.type(input, 'Paris');

      expect(input).toHaveValue('Paris');
    });

    // Verify that pressing Enter in the input field triggers a search (API call)
    it('triggers search when Enter key is pressed', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockWeatherResponse);
      render(<WeatherApp apiKey="test-key" />);

      await userEvent.type(screen.getByTestId('city-input'), 'London');
      fireEvent.keyDown(screen.getByTestId('city-input'), { key: 'Enter' });

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      });
    });

    // Verify that searching with empty input shows a validation error
    it('shows an error if the user searches with an empty input', async () => {
      render(<WeatherApp apiKey="test-key" />);

      fireEvent.click(screen.getByTestId('search-button'));

      expect(await screen.findByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a city name.');
    });

    // Verify that the search button is disabled during loading to prevent multiple requests
    it('disables the search button while loading', async () => {
      // Mock API to never resolve, keeping the component in a loading state
      mockedAxios.get.mockImplementation(() => new Promise(() => {})); // never resolves
      render(<WeatherApp apiKey="test-key" />);

      await userEvent.type(screen.getByTestId('city-input'), 'London');
      fireEvent.click(screen.getByTestId('search-button'));

      expect(screen.getByTestId('search-button')).toBeDisabled();
    });
  });

  // ─── Test Suite 2: Successful API Responses ────────────────────────────
  // Tests for displaying weather data after successful API calls
  describe('Successful weather search', () => {
    // Verify that weather data is rendered after successful search
    it('displays weather information after a successful search', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockWeatherResponse);
      render(<WeatherApp apiKey="test-key" />);

      await userEvent.type(screen.getByTestId('city-input'), 'London');
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        expect(screen.getByTestId('weather-result')).toBeInTheDocument();
      });

      expect(screen.getByText('London')).toBeInTheDocument();
    });

    // Verify that temperature is displayed correctly (rounded to nearest integer)
    it('displays the correct temperature', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockWeatherResponse);
      render(<WeatherApp apiKey="test-key" />);

      await userEvent.type(screen.getByTestId('city-input'), 'London');
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        // API response has temp 15.6, rounded to 16°C
        expect(screen.getByTestId('temperature')).toHaveTextContent('16°C');
      });
    });

    // Verify that humidity percentage is displayed correctly
    it('displays the correct humidity', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockWeatherResponse);
      render(<WeatherApp apiKey="test-key" />);

      await userEvent.type(screen.getByTestId('city-input'), 'London');
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        expect(screen.getByTestId('humidity')).toHaveTextContent('72%');
      });
    });

    // Verify that weather description is capitalized and displayed correctly
    it('displays the correct weather description', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockWeatherResponse);
      render(<WeatherApp apiKey="test-key" />);

      await userEvent.type(screen.getByTestId('city-input'), 'London');
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        // Description is capitalized: 'light rain' → 'Light rain'
        expect(screen.getByTestId('description')).toHaveTextContent('Light rain');
      });
    });

    // Verify that the API is called with correct endpoint and parameters
    it('calls the OpenWeatherMap API with the correct parameters', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockWeatherResponse);
      render(<WeatherApp apiKey="test-key" />);

      await userEvent.type(screen.getByTestId('city-input'), 'London');
      fireEvent.click(screen.getByTestId('search-button'));

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'https://api.openweathermap.org/data/2.5/weather',
          {
            params: {
              q: 'London',
              appid: 'test-key',
              units: 'metric',
            },
          }
        );
      });
    });
  });

  // ─── Test Suite 3: Error Handling ────────────────────────────────────
  // Tests for error messages and handling of different API error scenarios
  describe('Error handling', () => {
    // Verify 404 error when city is not found
    it('shows an error message when the city is not found (404)', async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { status: 404 } });
      render(<WeatherApp apiKey="test-key" />);

      await userEvent.type(screen.getByTestId('city-input'), 'InvalidCityXYZ');
      fireEvent.click(screen.getByTestId('search-button'));

      expect(await screen.findByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'City not found. Please check the city name and try again.'
      );
    });

    // Verify 401 error when API key is invalid
    it('shows an error message for an invalid API key (401)', async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { status: 401 } });
      render(<WeatherApp apiKey="bad-key" />);

      await userEvent.type(screen.getByTestId('city-input'), 'London');
      fireEvent.click(screen.getByTestId('search-button'));

      expect(await screen.findByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Invalid API key. Please check your configuration.'
      );
    });

    // Verify generic error message for unexpected errors (network issues, etc.)
    it('shows a generic error message for unexpected errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));
      render(<WeatherApp apiKey="test-key" />);

      await userEvent.type(screen.getByTestId('city-input'), 'London');
      fireEvent.click(screen.getByTestId('search-button'));

      expect(await screen.findByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Something went wrong. Please try again later.'
      );
    });

    // Verify that previous weather data is cleared and replaced with error message on failed search
    it('clears previous weather data when a new search returns an error', async () => {
      // Setup: First search succeeds and displays weather
      mockedAxios.get.mockResolvedValueOnce(mockWeatherResponse);
      render(<WeatherApp apiKey="test-key" />);

      await userEvent.type(screen.getByTestId('city-input'), 'London');
      fireEvent.click(screen.getByTestId('search-button'));
      await waitFor(() => expect(screen.getByTestId('weather-result')).toBeInTheDocument());

      // Second search fails and should clear previous data
      mockedAxios.get.mockRejectedValueOnce({ response: { status: 404 } });
      fireEvent.click(screen.getByTestId('search-button'));

      // Verify previous weather results are cleared and error is shown
      await waitFor(() => {
        expect(screen.queryByTestId('weather-result')).not.toBeInTheDocument();
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });
  });
});
