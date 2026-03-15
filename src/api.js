// Google Apps Script backend
// We'll create this via the manual Apps Script editor
// For now, use a simple approach: Google Sheets Web App

const SCRIPT_URL = 'PLACEHOLDER';

// Fallback to localStorage if backend fails
function getLocal() {
  try {
    return JSON.parse(localStorage.getItem('oscars2026') || '{"votes":{},"results":{}}');
  } catch { return { votes: {}, results: {} }; }
}

function setLocal(data) {
  localStorage.setItem('oscars2026', JSON.stringify(data));
}

export async function fetchData() {
  if (SCRIPT_URL === 'PLACEHOLDER') {
    // Use localStorage fallback
    return getLocal();
  }
  try {
    const res = await fetch(`${SCRIPT_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error('Backend error');
    const data = await res.json();
    setLocal(data); // cache locally
    return data;
  } catch (err) {
    console.warn('Backend fetch failed, using local:', err);
    return getLocal();
  }
}

export async function saveVote(name, picks) {
  const data = await fetchData();
  
  if (data.votes[name]) {
    throw new Error('YA_VOTO');
  }
  
  data.votes[name] = {
    name,
    timestamp: new Date().toISOString(),
    picks
  };
  
  setLocal(data);
  
  if (SCRIPT_URL !== 'PLACEHOLDER') {
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.warn('Backend save failed:', err);
    }
  }
  
  return data;
}

export async function saveResults(results) {
  const data = await fetchData();
  data.results = results;
  
  setLocal(data);
  
  if (SCRIPT_URL !== 'PLACEHOLDER') {
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.warn('Backend save failed:', err);
    }
  }
  
  return data;
}
