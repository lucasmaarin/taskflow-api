// Pinga o backend a cada 10 minutos para evitar sleep no plano gratuito do Render
const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 min
const API_URL = import.meta.env.VITE_API_URL;

let intervalId = null;

const ping = async () => {
  if (!API_URL) return; // em dev não faz nada (backend local não dorme)
  try {
    await fetch(`${API_URL}/health`, { method: 'GET' });
  } catch {
    // silencioso — falha de ping não deve afetar a UX
  }
};

export const startKeepAlive = () => {
  if (intervalId) return;
  ping(); // ping imediato ao iniciar
  intervalId = setInterval(ping, PING_INTERVAL_MS);
};

export const stopKeepAlive = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};
