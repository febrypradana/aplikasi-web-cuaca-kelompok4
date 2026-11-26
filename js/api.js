// API dari https://github.com/public-apis/public-apis (Kategori: Weather -> Open-Meteo)
const OPEN_METEO_GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const OPEN_METEO_FORECAST_API = "https://api.open-meteo.com/v1/forecast";

async function cariKoordinatKota(namaKota) {
  const endpoint = `${OPEN_METEO_GEOCODING_API}?name=${encodeURIComponent(namaKota)}&count=1&language=id&format=json`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error("Gagal terhubung ke Open-Meteo Geocoding API.");
  }

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`Kota "${namaKota}" tidak ditemukan pada Open-Meteo API.`);
  }

  const lokasi = data.results[0];
  return {
    nama: lokasi.name,
    wilayah: lokasi.admin1 || "",
    negara: lokasi.country || "",
    latitude: lokasi.latitude,
    longitude: lokasi.longitude
  };
}

async function ambilCuacaOpenMeteo(latitude, longitude) {
  const query = new URLSearchParams({
    latitude: latitude,
    longitude: longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max",
    timezone: "auto"
  });

  const response = await fetch(`${OPEN_METEO_FORECAST_API}?${query.toString()}`);
  if (!response.ok) {
    throw new Error("Gagal mengambil data cuaca dari Open-Meteo Forecast API.");
  }

  return await response.json();
}

function deskripsiWMO(code) {
  const daftarKode = {
    0: "Cerah",
    1: "Cerah Berawan",
    2: "Berawan Sebagian",
    3: "Mendung / Berawan",
    45: "Berkabut",
    48: "Kabut Tebal",
    51: "Gerimis Ringan",
    53: "Gerimis Sedang",
    55: "Gerimis Lebat",
    61: "Hujan Ringan",
    63: "Hujan Sedang",
    65: "Hujan Lebat",
    71: "Salju Ringan",
    80: "Hujan Lokal Ringan",
    81: "Hujan Lokal Sedang",
    82: "Hujan Lokal Lebat",
    95: "Hujan Petir"
  };
  return daftarKode[code] || `Berawan (${code})`;
}

function ikonCuacaWMO(code) {
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 65) return "🌧️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 95) return "⛈️";
  return "🌤️";
}

function arahAnginIndonesia(derajat) {
  if (derajat === undefined || derajat === null) return "Variabel";
  const arah = ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"];
  const indeks = Math.round(derajat / 45) % 8;
  return arah[indeks];
}s