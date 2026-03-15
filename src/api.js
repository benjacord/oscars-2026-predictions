// Oscars 2026 - Vote Storage
// Uses localStorage for instant access + syncs to central store via polling
// Each browser stores its own vote locally, and reads others from a shared votes file

const VOTES_URL = 'https://raw.githubusercontent.com/benjacord/oscars-2026-predictions/main/public/votes.json';

function getLocal() {
  try {
    return JSON.parse(localStorage.getItem('oscars2026') || '{"votes":{},"results":{}}');
  } catch { return { votes: {}, results: {} }; }
}

function setLocal(data) {
  localStorage.setItem('oscars2026', JSON.stringify(data));
}

export async function fetchData() {
  try {
    // Try to get shared votes from GitHub
    const res = await fetch(VOTES_URL + '?t=' + Date.now(), { cache: 'no-store' });
    if (res.ok) {
      const remote = await res.json();
      // Merge remote with local (local takes priority for own vote)
      const local = getLocal();
      const merged = { ...remote };
      if (!merged.votes) merged.votes = {};
      if (!merged.results) merged.results = {};
      // Merge local votes into remote
      Object.assign(merged.votes, local.votes);
      if (local.results && Object.keys(local.results).length > 0) {
        merged.results = local.results;
      }
      setLocal(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Remote fetch failed, using local:', err);
  }
  return getLocal();
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
  
  // Also POST to a webhook so the server can save to GitHub + Sheets
  try {
    await fetch('https://script.google.com/macros/s/PLACEHOLDER/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'vote', name, picks, timestamp: new Date().toISOString() })
    });
  } catch(e) { /* silently fail, localStorage is the source of truth */ }
  
  return data;
}

export async function saveResults(results) {
  const data = await fetchData();
  data.results = results;
  setLocal(data);
  return data;
}
