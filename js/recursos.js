// ===== Datos de referencia (APIs públicas) =====

const fmtARS = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
const fmtDate = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

async function fetchJSON(url, timeoutMs = 6000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// Dólar oficial (referencia Banco Nación) — dolarapi.com, API pública sin autenticación
async function loadDolar() {
  const valueEl = document.getElementById('dolarValue');
  const subEl = document.getElementById('dolarSub');
  try {
    const data = await fetchJSON('https://dolarapi.com/v1/dolares/oficial');
    valueEl.textContent = `Compra ${fmtARS(data.compra)} · Venta ${fmtARS(data.venta)}`;
    subEl.textContent = data.fechaActualizacion ? `Actualizado: ${fmtDate(data.fechaActualizacion)}` : '';
  } catch (err) {
    valueEl.textContent = 'No disponible ahora';
    subEl.textContent = 'Consultá el valor en la fuente oficial.';
  }
}

// Inflación mensual (IPC INDEC) — api.argentinadatos.com, agregador público de datos INDEC
async function loadInflacion() {
  const valueEl = document.getElementById('inflacionValue');
  const subEl = document.getElementById('inflacionSub');
  try {
    const data = await fetchJSON('https://api.argentinadatos.com/v1/finanzas/indices/inflacion');
    const ultimo = Array.isArray(data) ? data[data.length - 1] : null;
    if (!ultimo) throw new Error('sin datos');
    valueEl.textContent = `${ultimo.valor}% mensual`;
    subEl.textContent = `Período: ${fmtDate(ultimo.fecha)}`;
  } catch (err) {
    valueEl.textContent = 'No disponible ahora';
    subEl.textContent = 'Consultá el valor en la fuente oficial.';
  }
}

// Costo de crianza (INDEC) — INDEC no publica una API pública estable para este dato.
// El estudio debe actualizar este valor manualmente todos los meses cuando INDEC publica el informe.
// Editar únicamente la constante de abajo (monto en pesos y el período que corresponde).
const CANASTA_CRIANZA = {
  valor: null, // Ej: 95000  (dejar null hasta cargar el dato real)
  periodo: null, // Ej: 'Agosto 2026'
};
function loadCrianza() {
  const valueEl = document.getElementById('crianzaValue');
  const subEl = document.getElementById('crianzaSub');
  if (CANASTA_CRIANZA.valor) {
    valueEl.textContent = fmtARS(CANASTA_CRIANZA.valor);
    subEl.textContent = `Período: ${CANASTA_CRIANZA.periodo}`;
  } else {
    valueEl.textContent = 'Ver fuente oficial';
    subEl.textContent = 'Dato a cargar por el estudio — INDEC no ofrece una API pública para este valor.';
  }
}

loadDolar();
loadInflacion();
loadCrianza();

// ===== Calculadora de cuota alimentaria estimada =====
const alimentosForm = document.getElementById('alimentosForm');
if (alimentosForm) {
  alimentosForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ingreso = parseFloat(document.getElementById('alimentosIngreso').value) || 0;
    const hijos = parseInt(document.getElementById('alimentosHijos').value, 10) || 1;
    const porcentaje = Math.min(0.20 + Math.max(hijos - 1, 0) * 0.10, 0.50);
    const estimado = ingreso * porcentaje;

    document.getElementById('alimentosValue').textContent = `${fmtARS(estimado)} / mes (≈ ${Math.round(porcentaje * 100)}% del ingreso)`;
    document.getElementById('alimentosResult').hidden = false;
  });
}

// ===== Calculadora de actualización de deudas e intereses =====
const interesesForm = document.getElementById('interesesForm');
if (interesesForm) {
  interesesForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const capital = parseFloat(document.getElementById('interesesCapital').value) || 0;
    const tasaAnual = parseFloat(document.getElementById('interesesTasa').value) || 0;
    const desde = new Date(document.getElementById('interesesDesde').value);
    const hasta = new Date(document.getElementById('interesesHasta').value);

    const dias = Math.max(Math.round((hasta - desde) / (1000 * 60 * 60 * 24)), 0);
    const interes = capital * (tasaAnual / 100 / 365) * dias;
    const total = capital + interes;

    document.getElementById('interesesValue').textContent = `${fmtARS(interes)} (${dias} días)`;
    document.getElementById('interesesTotal').textContent = `Monto total actualizado: ${fmtARS(total)}`;
    document.getElementById('interesesResult').hidden = false;
  });
}
