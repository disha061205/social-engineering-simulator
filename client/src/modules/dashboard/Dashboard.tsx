import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchResults } from "../../services/simulation/api";
import { getUserId, logoutUser } from "../../utils/auth";

type ResultRow = {
  _id: string;
  attackType: string;
  level: string;
  score: number;
  total: number;
  accuracy: number;
  weakAreas?: string[];
  adaptiveRecommendation?: string;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const userId = getUserId();
  const [results, setResults] = useState<ResultRow[]>([]);

  const handleLogout = () => {
    logoutUser();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (userId) {
      fetchResults(userId).then(setResults).catch(() => setResults([]));
    }
  }, [userId]);

  const lastAttempt = results[0];
  const weakAreas = Array.from(new Set(results.flatMap((result) => result.weakAreas ?? []))).slice(0, 6);

  return (
    <main className="page">
      <header className="page-header hero-band">
        <div className="header-actions">
          <div>
            <p className="eyebrow">User Dashboard</p>
            <h1>Train against social engineering</h1>
            <p className="lead">Start a new simulation, continue from your last attempt, review scores, and focus weak areas.</p>
          </div>
          <button onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <section className="action-grid">
        <button onClick={() => navigate("/attack")}>Start new simulation</button>
        <button onClick={() => navigate(lastAttempt ? `/simulation?attackType=${lastAttempt.attackType}&level=${lastAttempt.level}` : "/attack")}>
          Continue last attempt
        </button>
        <button onClick={() => navigate("/scores")}>View scores</button>
      </section>

      <section className="grid two">
        <article className="panel">
          <h2>Scores</h2>
          {results.length ? results.slice(0, 5).map((result) => (
            <div className="score-row" key={result._id}>
              <strong>{result.attackType}</strong>
              <span>{result.level}</span>
              <span>{result.score}/{result.total ?? 5}</span>
              <span>{Math.round(result.accuracy ?? 0)}%</span>
            </div>
          )) : <p>No attempts yet.</p>}
        </article>

        <article className="panel">
          <h2>Weak Areas</h2>
          {weakAreas.length ? weakAreas.map((area) => <span className="tag" key={area}>{area}</span>) : <p>Weak areas appear after an attempt.</p>}
          {lastAttempt?.adaptiveRecommendation && <p className="hint">Next: {lastAttempt.adaptiveRecommendation}</p>}
        </article>
      </section>
    </main>
  );
}
