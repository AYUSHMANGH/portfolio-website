document.addEventListener('DOMContentLoaded', function () {
  const widget = document.getElementById('weather-time-widget');
  const locationEl = document.getElementById('weather-location');
  const tempEl = document.getElementById('weather-temp');
  const condEl = document.getElementById('weather-cond');
  const iconEl = document.getElementById('weather-icon');
  const timeEl = document.getElementById('weather-time');

  if (!widget || !locationEl || !tempEl || !condEl || !timeEl || !iconEl) return;

  function updateClock() {
    const now = new Date();
    const dateStr = new Intl.DateTimeFormat(undefined, {
      weekday: 'short', year: 'numeric', month: 'short', day: '2-digit'
    }).format(now);
    const timeStr = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(now);
    timeEl.textContent = `${dateStr} · ${timeStr}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  function setStatus(text) {
    condEl.textContent = text;
  }

  function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!data || !data.current_weather) {
          setStatus('Weather unavailable');
          return;
        }
        const cw = data.current_weather;
        tempEl.textContent = `${Math.round(cw.temperature)}°C`;
        // Simple mapping for weathercode
        const desc = weatherCodeToText(cw.weathercode);
        condEl.textContent = desc;
        iconEl.textContent = weatherCodeToIcon(cw.weathercode, cw.is_day === 1);
        reverseGeocode(lat, lon).then(name => {
          locationEl.textContent = name || `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
        });
      })
      .catch(() => setStatus('Weather unavailable'));
  }

  function weatherCodeToText(code) {
    const map = {
      0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Depositing rime fog',
      51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
      56: 'Freezing drizzle', 57: 'Freezing drizzle',
      61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
      66: 'Freezing rain', 67: 'Freezing rain',
      71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
      77: 'Snow grains', 80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy rain showers',
      85: 'Snow showers', 86: 'Heavy snow showers',
      95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
    };
    return map[code] || 'Weather';
  }

  function weatherCodeToIcon(code, isDay) {
    // Emoji icon mapping by WMO weather codes; toggles sun/moon for clear/partly
    const sun = '☀️';
    const moon = '🌙';
    const clear = isDay ? sun : moon;
    const partCloud = isDay ? '🌤️' : '🌥️';
    const overcast = '☁️';
    const fog = '🌫️';
    const drizzle = '🌦️';
    const rain = '🌧️';
    const freezing = '🧊';
    const snow = '🌨️';
    const thunder = '⛈️';

    if (code === 0) return clear; // Clear sky
    if (code === 1) return isDay ? '🌤️' : '🌙☁️'; // Mainly clear
    if (code === 2) return partCloud; // Partly cloudy
    if (code === 3) return overcast; // Overcast
    if (code === 45 || code === 48) return fog; // Fog
    if (code === 51 || code === 53 || code === 55) return drizzle; // Drizzle
    if (code === 56 || code === 57) return drizzle; // Freezing drizzle
    if (code === 61 || code === 63 || code === 65) return rain; // Rain
    if (code === 66 || code === 67) return freezing; // Freezing rain
    if (code === 71 || code === 73 || code === 75) return snow; // Snow
    if (code === 77) return snow; // Snow grains
    if (code === 80 || code === 81 || code === 82) return rain; // Rain showers
    if (code === 85 || code === 86) return snow; // Snow showers
    if (code === 95 || code === 96 || code === 99) return thunder; // Thunderstorm
    return '⛅';
  }

  function reverseGeocode(lat, lon) {
    // Use Open-Meteo's geocoding without key
    const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&format=json`;
    return fetch(url)
      .then(r => r.json())
      .then(g => {
        const r = g && g.results && g.results[0];
        if (!r) return '';
        const parts = [r.city || r.name, r.admin1, r.country_code].filter(Boolean);
        return parts.join(', ');
      })
      .catch(() => '');
  }

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        fetchWeather(latitude, longitude);
      },
      () => {
        locationEl.textContent = 'Location permission denied';
        setStatus('Enable location for local weather');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  } else {
    locationEl.textContent = 'Geolocation not supported';
    setStatus('Weather unavailable');
  }
});
