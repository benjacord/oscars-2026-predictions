import { useState, useEffect, useCallback } from 'react';
import { CATEGORIES } from './data/categories';
import { fetchData, saveVote } from './api';
import './App.css';

// --- INTRO SCREEN ---
function Intro({ onStart }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="screen intro-screen">
      <div className="intro-content">
        <div className={`intro-line ${phase >= 1 ? 'visible' : ''}`}>
          <span className="oscar-icon">🏆</span>
        </div>
        <div className={`intro-line ${phase >= 2 ? 'visible' : ''}`}>
          <h1>Ha llegado el momento...</h1>
        </div>
        <div className={`intro-line ${phase >= 3 ? 'visible' : ''}`}>
          <h2>Los Oscar 2026 están aquí</h2>
        </div>
        <div className={`intro-line ${phase >= 4 ? 'visible' : ''}`}>
          <p className="intro-sub">Define tu voto. Demuestra quién sabe más de cine.</p>
          <button className="btn-gold" onClick={onStart}>Comenzar</button>
        </div>
      </div>
      <div className="sparkles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="sparkle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }} />
        ))}
      </div>
    </div>
  );
}

// --- NAME ENTRY ---
function NameEntry({ onSubmit, existingNames }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (existingNames.includes(trimmed.toLowerCase())) {
      setError(`"${trimmed}" ya votó. Usa otro nombre.`);
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div className="screen name-screen">
      <div className="card-glass">
        <span className="oscar-icon">🏆</span>
        <h2>¿Quién eres?</h2>
        <p className="subtitle">Ingresa tu nombre para votar</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            placeholder="Tu nombre..."
            className="input-gold"
            autoFocus
            maxLength={20}
          />
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-gold" disabled={!name.trim()}>
            Entrar
          </button>
        </form>
        {existingNames.length > 0 && (
          <div className="already-voted">
            <p className="mini-label">Ya votaron:</p>
            <div className="voter-chips">
              {existingNames.map(n => (
                <span key={n} className="voter-chip">{n}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- LOBBY ---
function Lobby({ voters, userName, onVote, onResults }) {
  return (
    <div className="screen lobby-screen">
      <div className="card-glass wide">
        <h2>🏆 Oscar 2026 - Lobby</h2>
        <p className="subtitle">Bienvenido/a, <strong>{userName}</strong></p>

        <div className="lobby-actions">
          <button className="btn-gold" onClick={onVote}>
            🗳️ Votar mis predicciones
          </button>
          <button className="btn-outline" onClick={onResults}>
            📊 Ver resultados
          </button>
        </div>

        <div className="participants-section">
          <h3>Participantes ({voters.length})</h3>
          {voters.length === 0 ? (
            <p className="empty-msg">Nadie ha votado aún. ¡Sé el primero!</p>
          ) : (
            <div className="voter-grid">
              {voters.map((v, i) => (
                <div key={v} className="voter-card" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="voter-avatar">{v[0].toUpperCase()}</div>
                  <span>{v}</span>
                  <span className="voted-badge">✓ Votó</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- VOTING ---
function Voting({ onComplete, userName }) {
  const [catIndex, setCatIndex] = useState(0);
  const [picks, setPicks] = useState({});
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('enter');

  const category = CATEGORIES[catIndex];
  const progress = ((catIndex) / CATEGORIES.length) * 100;

  const selectNominee = (nominee) => {
    if (animating) return;
    const newPicks = { ...picks, [category.id]: nominee };
    setPicks(newPicks);

    if (catIndex < CATEGORIES.length - 1) {
      setAnimating(true);
      setDirection('exit');
      setTimeout(() => {
        setCatIndex(catIndex + 1);
        setDirection('enter');
        setTimeout(() => setAnimating(false), 50);
      }, 300);
    } else {
      onComplete(newPicks);
    }
  };

  const goBack = () => {
    if (catIndex > 0 && !animating) {
      setAnimating(true);
      setDirection('exit-back');
      setTimeout(() => {
        setCatIndex(catIndex - 1);
        setDirection('enter-back');
        setTimeout(() => setAnimating(false), 50);
      }, 300);
    }
  };

  return (
    <div className="screen voting-screen">
      <div className="voting-header">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-text">
          {catIndex + 1} / {CATEGORIES.length}
        </div>
      </div>

      <div className={`category-container ${direction}`}>
        <div className="category-header">
          <span className="cat-emoji">{category.emoji}</span>
          <h2>{category.name}</h2>
          {category.double && <span className="badge-double">x2 PUNTOS</span>}
        </div>

        <div className="nominees-grid">
          {category.nominees.map((nominee) => (
            <button
              key={nominee}
              className={`nominee-card ${picks[category.id] === nominee ? 'selected' : ''}`}
              onClick={() => selectNominee(nominee)}
            >
              <span className="nominee-name">{nominee}</span>
              {picks[category.id] === nominee && <span className="check">✓</span>}
            </button>
          ))}
        </div>

        {catIndex > 0 && (
          <button className="btn-back" onClick={goBack}>← Anterior</button>
        )}
      </div>
    </div>
  );
}

// --- CONFIRMATION ---
function Confirmation({ picks, userName, onSeal, onBack, saving }) {
  const [sealed, setSealed] = useState(false);

  const handleSeal = async () => {
    setSealed(true);
    await onSeal();
  };

  return (
    <div className="screen confirm-screen">
      <div className={`seal-overlay ${sealed ? 'visible' : ''}`}>
        <div className="seal-animation">
          <div className="seal-stamp">🏆</div>
          <h2>Voto Sellado</h2>
          <p>{userName}</p>
        </div>
      </div>

      <div className="card-glass wide">
        <h2>📋 Confirma tus predicciones</h2>
        <p className="subtitle">{userName}, revisa antes de sellar</p>

        <div className="picks-summary">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="pick-row">
              <span className="pick-cat">
                {cat.emoji} {cat.name}
                {cat.double && <span className="badge-double-sm">x2</span>}
              </span>
              <span className="pick-value">{picks[cat.id]}</span>
            </div>
          ))}
        </div>

        <div className="confirm-actions">
          <button className="btn-outline" onClick={onBack} disabled={saving}>
            ← Cambiar votos
          </button>
          <button className="btn-gold seal-btn" onClick={handleSeal} disabled={saving}>
            {saving ? '⏳ Guardando...' : '🔒 Sellar Voto'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- RESULTS ---
function Results({ data, onBack }) {
  const voters = Object.values(data.votes || {});
  const results = data.results || {};
  const hasResults = Object.values(results).some(v => v);

  // Calculate scores
  const scores = voters.map(voter => {
    let score = 0;
    CATEGORIES.forEach(cat => {
      if (results[cat.id] && voter.picks[cat.id] === results[cat.id]) {
        score += cat.double ? 2 : 1;
      }
    });
    return { name: voter.name, score };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="screen results-screen">
      <div className="card-glass wide">
        <h2>📊 Resultados Oscar 2026</h2>

        {hasResults && (
          <div className="leaderboard">
            <h3>🏆 Leaderboard</h3>
            {scores.map((s, i) => (
              <div key={s.name} className={`leader-row ${i === 0 ? 'first' : ''}`}>
                <span className="leader-pos">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span className="leader-name">{s.name}</span>
                <span className="leader-score">{s.score} pts</span>
              </div>
            ))}
          </div>
        )}

        {!hasResults && (
          <div className="no-results-msg">
            <p>Los resultados se actualizarán durante la ceremonia 🎬</p>
          </div>
        )}

        <div className="results-table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>Categoría</th>
                {voters.map(v => <th key={v.name}>{v.name}</th>)}
                {hasResults && <th className="result-col">✅ Ganador</th>}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map(cat => (
                <tr key={cat.id}>
                  <td className="cat-cell">
                    {cat.emoji} {cat.name}
                    {cat.double && <span className="badge-double-sm">x2</span>}
                  </td>
                  {voters.map(v => {
                    const pick = v.picks[cat.id];
                    const isCorrect = hasResults && results[cat.id] && pick === results[cat.id];
                    const isWrong = hasResults && results[cat.id] && pick !== results[cat.id];
                    return (
                      <td key={v.name} className={`vote-cell ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}>
                        {pick}
                        {isCorrect && ' ✅'}
                      </td>
                    );
                  })}
                  {hasResults && (
                    <td className="result-cell">{results[cat.id] || '—'}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn-outline" onClick={onBack} style={{ marginTop: '2rem' }}>
          ← Volver al lobby
        </button>
      </div>
    </div>
  );
}

// --- MAIN APP ---
export default function App() {
  const [screen, setScreen] = useState('intro');
  const [userName, setUserName] = useState('');
  const [data, setData] = useState({ votes: {}, results: {} });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [picks, setPicks] = useState({});
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const d = await fetchData();
      setData(d);
      return d;
    } catch (e) {
      console.error(e);
      setError('Error cargando datos. Recarga la página.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (screen === 'name' || screen === 'lobby' || screen === 'results') {
      loadData();
    }
  }, [screen, loadData]);

  // Check localStorage for returning user
  useEffect(() => {
    const saved = localStorage.getItem('oscar2026_user');
    if (saved) {
      setUserName(saved);
      setScreen('lobby');
    }
  }, []);

  const existingNames = Object.keys(data.votes || {});

  const handleNameSubmit = (name) => {
    setUserName(name);
    localStorage.setItem('oscar2026_user', name);
    // Check if already voted
    if (data.votes[name]) {
      setScreen('lobby');
    } else {
      setScreen('lobby');
    }
  };

  const handleVoteComplete = (p) => {
    setPicks(p);
    setScreen('confirm');
  };

  const handleSeal = async () => {
    try {
      setSaving(true);
      const newData = await saveVote(userName, picks);
      setData(newData);
      setTimeout(() => {
        setSaving(false);
        setTimeout(() => setScreen('lobby'), 1500);
      }, 2000);
    } catch (e) {
      setSaving(false);
      if (e.message === 'YA_VOTO') {
        alert('Ya votaste! No puedes cambiar tu voto.');
        setScreen('lobby');
      } else {
        alert('Error guardando voto. Intenta de nuevo.');
      }
    }
  };

  const hasVoted = data.votes && data.votes[userName];

  if (error) {
    return (
      <div className="screen">
        <div className="card-glass">
          <p className="error-msg">{error}</p>
          <button className="btn-gold" onClick={() => window.location.reload()}>Recargar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {screen === 'intro' && <Intro onStart={() => setScreen('name')} />}
      
      {screen === 'name' && (
        <NameEntry 
          onSubmit={handleNameSubmit} 
          existingNames={existingNames}
        />
      )}
      
      {screen === 'lobby' && (
        <Lobby
          voters={existingNames}
          userName={userName}
          onVote={() => setScreen('voting')}
          onResults={async () => {
            await loadData();
            setScreen('results');
          }}
        />
      )}
      
      {screen === 'voting' && (
        <Voting userName={userName} onComplete={handleVoteComplete} />
      )}
      
      {screen === 'confirm' && (
        <Confirmation
          picks={picks}
          userName={userName}
          onSeal={handleSeal}
          onBack={() => setScreen('voting')}
          saving={saving}
        />
      )}
      
      {screen === 'results' && (
        <Results data={data} onBack={() => setScreen('lobby')} />
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loader">🏆</div>
        </div>
      )}
    </div>
  );
}
