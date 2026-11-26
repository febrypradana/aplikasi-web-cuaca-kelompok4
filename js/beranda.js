const KOTA_DEFAULT = "Kediri";

const formBeranda = document.getElementById("form-beranda");
const inputKotaBeranda = document.getElementById("input-kota-beranda");
const btnLokasiAwal = document.getElementById("btn-lokasi-awal");
const infoLokasiUtama = document.getElementById("info-lokasi-utama");
const infoKoordinatUtama = document.getElementById("info-koordinat-utama");
const pesanBeranda = document.getElementById("pesan-beranda");
const kontenBeranda = document.getElementById("konten-beranda");
const previewPrakiraan = document.getElementById("preview-prakiraan");

async function renderCuacaSaatIni(namaKota) {
  pesanBeranda.innerHTML = `<p class="muted" style="margin-bottom:12px;">Memuat data cuaca untuk "${namaKota}"...</p>`;
  kontenBeranda.innerHTML = "";
  previewPrakiraan.innerHTML = "";

  try {
    const lokasi = await cariKoordinatKota(namaKota);
    const dataCuaca = await ambilCuacaOpenMeteo(lokasi.latitude, lokasi.longitude);
    const current = dataCuaca.current;
    const units = dataCuaca.current_units;
    const daily = dataCuaca.daily;

    const infoWilayah = [lokasi.nama, lokasi.wilayah, lokasi.negara].filter(Boolean).join(", ");
    infoLokasiUtama.textContent = `📍 ${infoWilayah}`;
    infoKoordinatUtama.textContent = `Koordinat: ${lokasi.latitude}, ${lokasi.longitude}`;
    pesanBeranda.innerHTML = "";

    const kondisiTeks = deskripsiWMO(current.weather_code);
    const ikon = ikonCuacaWMO(current.weather_code);
    const arahAngin = arahAnginIndonesia(current.wind_direction_10m);
    const peringatan = current.weather_code >= 61
      ? `Waspada potensi ${kondisiTeks.toLowerCase()} di wilayah ${lokasi.nama}`
      : "Tidak ada peringatan cuaca buruk saat ini";

    // Embed Radar Cuaca interaktif dari Windy berdasarkan koordinat kota
    const radarUrl = `https://embed.windy.com/embed2.html?lat=${lokasi.latitude}&lon=${lokasi.longitude}&detailLat=${lokasi.latitude}&detailLon=${lokasi.longitude}&width=650&height=450&zoom=8&level=surface&overlay=radar&product=radar&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;

    kontenBeranda.innerHTML = `
      <div class="bmkg-main-grid">
        <!-- Panel Kiri: Kartu Cuaca Utama Ala BMKG -->
        <div class="card">
          <div class="weather-card-top">
            <div class="weather-time">
              <strong>Cuaca Saat Ini</strong><br/>
              ${current.time.replace("T", " ")}
            </div>
            <span class="status-pill">Sumber: Open-Meteo API</span>
          </div>

          <div class="weather-hero">
            <div class="weather-hero-left">
              <div class="weather-big-icon">${ikon}</div>
              <div>
                <div class="weather-big-temp">${Math.round(current.temperature_2m)}°C</div>
                <div class="weather-condition-text">${kondisiTeks}</div>
                <div class="weather-feels-like">Terasa seperti ${Math.round(current.apparent_temperature)}°C</div>
              </div>
            </div>
            <div class="weather-alert-note">
              ${peringatan}
            </div>
          </div>

          <div class="weather-bottom-metrics">
            <div class="metric-item">
              <div class="metric-label">Kecepatan Angin</div>
              <div class="metric-value">${current.wind_speed_10m} ${units.wind_speed_10m}</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">Arah Angin</div>
              <div class="metric-value">🧭 ${arahAngin}</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">Kelembapan</div>
              <div class="metric-value">${current.relative_humidity_2m} %</div>
            </div>
          </div>
        </div>

        <!-- Panel Kanan: Radar Cuaca Interaktif -->
        <div class="radar-card">
          <iframe src="${radarUrl}" title="Radar Cuaca ${lokasi.nama}" loading="lazy"></iframe>
          <div class="radar-label">Radar Cuaca • ${lokasi.nama}</div>
        </div>
      </div>
    `;

    // Render strip prakiraan 7 hari di bagian bawah
    previewPrakiraan.innerHTML = daily.time.map((tanggal, i) => `
      <div class="item-card">
        <div class="muted" style="font-weight:600;">${tanggal}</div>
        <div style="font-size:2rem; margin:6px 0;">${ikonCuacaWMO(daily.weather_code[i])}</div>
        <div style="font-weight:700; font-size:1.05rem;">${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°C</div>
        <div class="muted">${deskripsiWMO(daily.weather_code[i])}</div>
      </div>
    `).join("");

  } catch (error) {
    pesanBeranda.innerHTML = `<div class="error-box">${error.message}</div>`;
  }
}

formBeranda.addEventListener("submit", (event) => {
  event.preventDefault();
  const kota = inputKotaBeranda.value.trim();
  if (kota) {
    renderCuacaSaatIni(kota);
  }
});

btnLokasiAwal.addEventListener("click", () => {
  inputKotaBeranda.value = "";
  renderCuacaSaatIni(KOTA_DEFAULT);
});

renderCuacaSaatIni(KOTA_DEFAULT);