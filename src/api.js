// Oscars 2026 - Central Backend
const API_URL = 'https://bradford-everybody-effects-side.trycloudflare.com';

export async function fetchData() {
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Backend error');
    const data = await res.json();
    localStorage.setItem('oscars2026', JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn('Backend fetch failed:', err);
    try {
      return JSON.parse(localStorage.getItem('oscars2026') || '{"votes":{},"results":{}}');
    } catch { return { votes: {}, results: {} }; }
  }
}

export async function saveVote(name, picks) {
  const timestamp = new Date().toISOString();
  
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'vote', name, picks, timestamp })
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (err.error === 'YA_VOTO') throw new Error('YA_VOTO');
    throw new Error('Error guardando voto');
  }
  
  const result = await res.json();
  localStorage.setItem('oscars2026', JSON.stringify(result.data));
  return result.data;
}

export async function saveResults(results) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'results', results })
  });
  
  if (!res.ok) throw new Error('Error guardando resultados');
  return await res.json();
}
