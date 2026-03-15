const BLOB_ID = '019cf34f-fc35-7eea-87fc-eb42c60c02c3';
const BASE_URL = `https://jsonblob.com/api/jsonBlob/${BLOB_ID}`;

export async function fetchData() {
  const res = await fetch(BASE_URL, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Error cargando datos');
  return res.json();
}

export async function saveVote(name, picks) {
  // Read current data
  const data = await fetchData();
  
  // Check if already voted
  if (data.votes[name]) {
    throw new Error('YA_VOTO');
  }
  
  // Add vote
  data.votes[name] = {
    name,
    timestamp: new Date().toISOString(),
    picks
  };
  
  // Write back
  const res = await fetch(BASE_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) throw new Error('Error guardando voto');
  return data;
}

export async function saveResults(results) {
  const data = await fetchData();
  data.results = results;
  
  const res = await fetch(BASE_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) throw new Error('Error guardando resultados');
  return data;
}
