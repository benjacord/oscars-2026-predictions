// Oscars 2026 - Central Backend
const API_URL = 'https://lucky-keys-eat.loca.lt';

export async function fetchData() {
  try {
    const res = await fetch(API_URL, {
      headers: { 'bypass-tunnel-reminder': 'true' },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Backend error');
    return await res.json();
  } catch (err) {
    console.warn('Backend fetch failed:', err);
    // Fallback to localStorage
    try {
      return JSON.parse(localStorage.getItem('oscars2026') || '{"votes":{},"results":{}}');
    } catch { return { votes: {}, results: {} }; }
  }
}

export async function saveVote(name, picks) {
  const timestamp = new Date().toISOString();
  
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'bypass-tunnel-reminder': 'true'
    },
    body: JSON.stringify({ action: 'vote', name, picks, timestamp })
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (err.error === 'YA_VOTO') throw new Error('YA_VOTO');
    throw new Error('Error guardando voto');
  }
  
  const result = await res.json();
  // Also save locally as backup
  localStorage.setItem('oscars2026', JSON.stringify(result.data));
  return result.data;
}

export async function saveResults(results) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'bypass-tunnel-reminder': 'true'
    },
    body: JSON.stringify({ action: 'results', results })
  });
  
  if (!res.ok) throw new Error('Error guardando resultados');
  return await res.json();
}
