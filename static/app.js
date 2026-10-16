const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const statusMessage = document.querySelector("#status");
const locationPicker = document.querySelector("#location-picker");
const locationSelect = document.querySelector("#location-select");
const weatherPanel = document.querySelector("#weather-panel");
let locations = [];

const weatherDescriptions = {
  0: ["Céu limpo", "☀"],
  1: ["Predominantemente limpo", "🌤"],
  2: ["Parcialmente nublado", "⛅"],
  3: ["Nublado", "☁"],
  45: ["Nevoeiro", "🌫"],
  48: ["Nevoeiro com geada", "🌫"],
  51: ["Garoa leve", "🌦"],
  53: ["Garoa moderada", "🌦"],
  55: ["Garoa intensa", "🌧"],
  56: ["Garoa congelante leve", "🌧"],
  57: ["Garoa congelante intensa", "🌧"],
  61: ["Chuva leve", "🌧"],
  63: ["Chuva moderada", "🌧"],
  65: ["Chuva forte", "🌧"],
  66: ["Chuva congelante leve", "🌧"],
  67: ["Chuva congelante forte", "🌧"],
  71: ["Neve leve", "❄"],
  73: ["Neve moderada", "❄"],
  75: ["Neve forte", "❄"],
  77: ["Grãos de neve", "❄"],
  80: ["Pancadas de chuva leves", "🌦"],
  81: ["Pancadas de chuva moderadas", "🌧"],
  82: ["Pancadas de chuva fortes", "🌧"],
  85: ["Pancadas de neve leves", "🌨"],
  86: ["Pancadas de neve fortes", "🌨"],
  95: ["Trovoada", "⛈"],
  96: ["Trovoada com granizo leve", "⛈"],
  99: ["Trovoada com granizo forte", "⛈"],
};

function describeWeather(code) {
  return weatherDescriptions[code] || ["Condição variável", "🌤"];
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

async function readJson(response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Ocorreu um erro inesperado.");
  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city.length < 2) {
    showStatus("Digite pelo menos duas letras para buscar.", true);
    return;
  }

  locationPicker.hidden = true;
  weatherPanel.hidden = true;
  locationSelect.replaceChildren();
  showStatus("Buscando cidades…");

  try {
    const response = await fetch(`/api/locations?name=${encodeURIComponent(city)}`);
    const data = await readJson(response);
    locations = data.locations;

    if (!locations.length) {
      showStatus("Nenhuma cidade encontrada. Tente incluir o país, como “Lima, Peru”.", true);
      return;
    }

    locations.forEach((location, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = [location.name, location.admin1, location.country]
        .filter(Boolean)
        .join(", ");
      locationSelect.append(option);
    });

    locationPicker.hidden = false;
    showStatus(`${locations.length} resultado(s). Selecione a cidade desejada.`);
    await loadWeather();
  } catch (error) {
    showStatus(error.message || "Não foi possível buscar a cidade.", true);
  }
});

locationSelect.addEventListener("change", loadWeather);

async function loadWeather() {
  const location = locations[Number(locationSelect.value)];
  if (!location) return;

  showStatus("Carregando previsão…");
  weatherPanel.hidden = true;

  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    city: location.name,
    country: location.country,
  });

  try {
    const response = await fetch(`/api/weather?${params.toString()}`);
    const data = await readJson(response);
    renderWeather(data);
    weatherPanel.hidden = false;
    showStatus("");
  } catch (error) {
    showStatus(error.message || "Não foi possível carregar a previsão.", true);
  }
}

function renderWeather(data) {
  const current = data.current;
  const [description, symbol] = describeWeather(current.weather_code);
  const place = [data.city, data.country].filter(Boolean).join(", ");

  document.querySelector("#city-title").textContent = place;
  document.querySelector("#weather-symbol").textContent = symbol;
  document.querySelector("#temperature").textContent = formatNumber(current.temperature);
  document.querySelector("#condition").textContent = description;
  document.querySelector("#feels-like").textContent = `${formatNumber(current.feels_like)} °C`;
  document.querySelector("#humidity").textContent = `${formatNumber(current.humidity)}%`;
  document.querySelector("#wind").textContent = `${formatNumber(current.wind_speed)} km/h`;
  document.querySelector("#precipitation").textContent = `${formatNumber(current.precipitation)} mm`;

  const localTime = current.time ? current.time.replace("T", " · ") : data.timezone;
  document.querySelector("#local-time").textContent = `${localTime} · ${data.timezone || "horário local"}`;

  const list = document.querySelector("#forecast-list");
  list.replaceChildren();
  data.forecast.forEach((day, index) => {
    const [dayDescription, daySymbol] = describeWeather(day.weather_code);
    const item = document.createElement("article");
    item.className = "forecast-day";

    const label = document.createElement("span");
    label.className = "forecast-date";
    label.textContent = index === 0 ? "Hoje" : formatDate(day.date);

    const icon = document.createElement("span");
    icon.className = "forecast-icon";
    icon.textContent = daySymbol;
    icon.setAttribute("aria-label", dayDescription);

    const temps = document.createElement("span");
    temps.className = "forecast-temps";
    temps.textContent = `${formatNumber(day.temperature_max)}° / ${formatNumber(day.temperature_min)}°`;

    const rain = document.createElement("span");
    rain.className = "forecast-rain";
    rain.textContent = day.precipitation_probability == null
      ? "—"
      : `☂ ${formatNumber(day.precipitation_probability)}%`;

    item.append(label, icon, temps, rain);
    list.append(item);
  });
}

function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date)
    .replace(".", "");
}
