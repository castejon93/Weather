# Weather App

## Features
- Search weather by city name
- Displays temperature, humidity, weather description, feels like, and wind speed
- Error handling for invalid cities, bad API keys, and network issues
- Unit tests with Jest and React Testing Library (80%+ coverage)

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up your API key
Get a free API key from [OpenWeatherMap](https://openweathermap.org/api), then create a `.env.local` file:
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and replace `your_api_key_here` with your actual API key:
```
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
```

### 3. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Tests

### Run all tests with coverage
```bash
npm test
```
---

## Project Structure

```
weather-app/
├── app/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   └── WeatherApp.tsx      # Main weather component
├── __tests__/
│   └── WeatherApp.test.tsx # Unit tests
├── .env.local.example      # Environment variable template
├── babel.config.js         # Babel config for Jest
├── jest.setup.ts           # Jest setup file
└── README.md
```

---

## Test Coverage

The test suite covers:
- ✅ Input field and search button rendering
- ✅ Typing in the input field
- ✅ Search triggered by Enter key
- ✅ Empty input validation
- ✅ Loading state (button disabled)
- ✅ Successful weather display (temperature, humidity, description)
- ✅ Correct API call parameters
- ✅ 404 error (city not found)
- ✅ 401 error (invalid API key)
- ✅ Generic network errors
- ✅ Clearing previous results on new error
