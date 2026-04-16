import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchResults } from "../../services/simulation/api";
import { getUserId } from "../../utils/auth";

type ResultRow = {
  _id: string;
  attackType: string;
  level: string;
  score: number;
  total: number;
  accuracy: number;
  weakAreas?: string[];
  adaptiveRecommendation?: string;
  createdAt?: string;
};

const attackTypes = ["phishing", "smishing", "pretexting", "scareware"];

export default function Scores() {
  const navigate = useNavigate();
  const userId = getUserId();
  const [results, setResults] = useState<ResultRow[]>([]);

  useEffect(() => {
    if (userId) {
      fetchResults(userId).then(setResults).catch(() => setResults([]));
    }
  }, [userId]);

  const grouped = useMemo(() => {
    return attackTypes.map((attackType) => {
      const attempts = results.filter((result) => result.attackType === attackType);
      const best = attempts.reduce<ResultRow | undefined>((currentBest, attempt) => {
        if (!currentBest || attempt.score > currentBest.score) return attempt;
        return currentBest;
      }, undefined);

      return {
        attackType,
        attempts,
        best
      };
    });
  }, [results]);

  return (
    <main className="page">
      <header className="page-header hero-band">
        <p className="eyebrow">All Scores</p>
        <h1>Progress across every module</h1>
        <p className="lead">Review phishing, smishing, pretexting, and scareware attempts together instead of only the last completed attempt.</p>
      </header>

      <section className="score-summary-grid">
        {grouped.map((group) => (
          <article className="score-module" key={group.attackType}>
            <p className="eyebrow">{group.attackType}</p>
            <strong>{group.best ? `${group.best.score}/${group.best.total ?? 5}` : "No attempts"}</strong>
            <span>{group.attempts.length} attempt{group.attempts.length === 1 ? "" : "s"}</span>
          </article>
        ))}
      </section>

      <section className="panel">
        <h2>Attempt History</h2>
        {results.length ? (
          <div className="score-table">
            <div className="score-table-head">
              <span>Attack</span>
              <span>Level</span>
              <span>Score</span>
              <span>Accuracy</span>
              <span>Weak areas</span>
            </div>
            {results.map((result) => (
              <div className="score-table-row" key={result._id}>
                <span>{result.attackType}</span>
                <span>{result.level}</span>
                <span>{result.score}/{result.total ?? 5}</span>
                <span>{Math.round(result.accuracy ?? 0)}%</span>
                <span>{result.weakAreas?.length ? result.weakAreas.join(", ") : "None"}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No attempts yet. Start a simulation to build your progress history.</p>
        )}
      </section>

      <section className="footer-actions">
        <button onClick={() => navigate("/attack")}>Start new simulation</button>
        <button onClick={() => navigate("/dashboard")}>Back to dashboard</button>
      </section>
    </main>
  );
}
