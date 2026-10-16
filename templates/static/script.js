
const weatherTypes = {
    0: ["Céu limpo", "☀️"],
    1: ["Predominantemente limpo", "🌤️"],
    2: ["Parcialmente nublado", "⛅"],
    3: ["Nublado", "☁️"],
    45: ["Neblina", "🌫️"],
    48: ["Neblina com gelo", "🌫️"],
    51: ["Garoa leve", "🌦️"],
    53: ["Garoa moderada", "🌦️"],
    55: ["Garoa intensa", "🌧️"],
    61: ["Chuva leve", "🌦️"],
    63: ["Chuva moderada", "🌧️"],
    65: ["Chuva forte", "🌧️"],
    71: ["Neve leve", "🌨️"],
    73: ["Neve moderada", "🌨️"],
    75: ["Neve intensa", "❄️"],
    80: ["Pancadas de chuva", "🌦️"],
    81: ["Pancadas moderadas", "🌧️"],
    82: ["Pancadas fortes", "⛈️"],
    95: ["Trovoadas", "⛈️"],
    96: ["Trovoadas com granizo leve", "⛈️"],
    99: ["Trovoadas com granizo forte", "⛈️"]
};

function getWeather(code) {
    return weatherTypes[code] ?? ["Condição variável", "🌡️"];
}

const weatherData = document.getElementById("weather-data");

if (weatherData) {
    const { code } = JSON.parse(weatherData.textContent);
    const [description, icon] = getWeather(code);

    document.getElementById("description").textContent = description;
    document.getElementById("weather-icon").textContent = icon;
}

document.querySelectorAll(".day-icon").forEach((element) => {
    const code = Number(element.dataset.code);
    element.textContent = getWeather(code)[1];
});

// Formata as datas da previsão no fuso local do navegador.
document.querySelectorAll(".day-card p").forEach((element) => {
    const date = new Date(`${element.textContent}T12:00:00`);

    if (!Number.isNaN(date.getTime())) {
        element.textContent = new Intl.DateTimeFormat("pt-BR", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit"
        }).format(date);
    }
});
const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");
const themeLabel = document.querySelector("#theme-label");

function applyTheme(theme) {
  document.body.dataset.theme = theme;

  const isDark = theme === "dark";
  themeIcon.textContent = isDark ? "☀" : "☾";
  themeLabel.textContent = isDark ? "Modo claro" : "Modo escuro";
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Ativar modo claro" : "Ativar modo escuro"
  );
}

applyTheme(localStorage.getItem("clima-mundo-theme") || "light");

themeToggle.addEventListener("click", () => {
  const nextTheme =
    document.body.dataset.theme === "dark" ? "light" : "dark";

  localStorage.setItem("clima-mundo-theme", nextTheme);
  applyTheme(nextTheme);
});
