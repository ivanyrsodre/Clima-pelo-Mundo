from flask import Flask, jsonify, render_template, request
import requests

app = Flask(__name__)

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/api/locations")
def search_locations():
    """Procura cidades pelo nome e devolve até oito correspondências."""
    name = request.args.get("name", "").strip()
    if len(name) < 2:
        return jsonify({"error": "Digite pelo menos duas letras para buscar uma cidade."}), 400

    try:
        response = requests.get(
            GEOCODING_URL,
            params={"name": name, "count": 8, "language": "pt", "format": "json"},
            timeout=10,
        )
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException:
        return jsonify({"error": "Não foi possível consultar o serviço de busca. Tente novamente."}), 502
    except ValueError:
        return jsonify({"error": "O serviço de busca retornou uma resposta inválida."}), 502

    locations = []
    for item in payload.get("results", []):
        locations.append(
            {
                "name": item.get("name", "Cidade"),
                "admin1": item.get("admin1", ""),
                "country": item.get("country", ""),
                "latitude": item.get("latitude"),
                "longitude": item.get("longitude"),
                "timezone": item.get("timezone", ""),
            }
        )

    return jsonify({"locations": locations})


@app.get("/api/weather")
def get_weather():
    """Consulta a previsão para as coordenadas da cidade escolhida."""
    try:
        latitude = float(request.args.get("latitude", ""))
        longitude = float(request.args.get("longitude", ""))
    except (TypeError, ValueError):
        return jsonify({"error": "Selecione uma cidade válida antes de consultar a previsão."}), 400

    if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
        return jsonify({"error": "As coordenadas da cidade são inválidas."}), 400

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": ",".join(
            [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "is_day",
                "precipitation",
                "weather_code",
                "wind_speed_10m",
            ]
        ),
        "daily": ",".join(
            [
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_probability_max",
            ]
        ),
        "timezone": "auto",
        "forecast_days": 5,
        "temperature_unit": "celsius",
        "wind_speed_unit": "kmh",
    }

    try:
        response = requests.get(FORECAST_URL, params=params, timeout=10)
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException:
        return jsonify({"error": "Não foi possível consultar a previsão agora. Tente novamente."}), 502
    except ValueError:
        return jsonify({"error": "O serviço meteorológico retornou uma resposta inválida."}), 502

    current = payload.get("current", {})
    daily = payload.get("daily", {})
    dates = daily.get("time", [])
    forecast = []
    for index, date in enumerate(dates):
        forecast.append(
            {
                "date": date,
                "weather_code": _at(daily.get("weather_code", []), index),
                "temperature_max": _at(daily.get("temperature_2m_max", []), index),
                "temperature_min": _at(daily.get("temperature_2m_min", []), index),
                "precipitation_probability": _at(
                    daily.get("precipitation_probability_max", []), index
                ),
            }
        )

    return jsonify(
        {
            "city": request.args.get("city", "Cidade"),
            "country": request.args.get("country", ""),
            "timezone": payload.get("timezone", ""),
            "current": {
                "temperature": current.get("temperature_2m"),
                "feels_like": current.get("apparent_temperature"),
                "humidity": current.get("relative_humidity_2m"),
                "precipitation": current.get("precipitation"),
                "weather_code": current.get("weather_code"),
                "wind_speed": current.get("wind_speed_10m"),
                "is_day": current.get("is_day"),
                "time": current.get("time"),
            },
            "current_units": payload.get("current_units", {}),
            "daily_units": payload.get("daily_units", {}),
            "forecast": forecast,
        }
    )


def _at(values, index):
    return values[index] if index < len(values) else None


if __name__ == "__main__":
    # debug=True é prático no desenvolvimento local; não use esse modo em produção.
    app.run(debug=True)
