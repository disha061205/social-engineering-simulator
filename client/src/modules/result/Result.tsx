import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitFeedback, type Scenario } from "../../services/simulation/api";
import { getUserId } from "../../utils/auth";

type ScenarioResult = {
  scenarioId: string;
  title: string;
  selectedAction: string;
  correctAction: string;
  correct: boolean;
  explanation: string;
  preventionTips: string[];
  postAttackActions: string[];
  weakAreaTags: string[];
};

type LastResult = {
  attackType: string;
  level: string;
  score: number;
  total: number;
  accuracy: number;
  feedbackBand: string;
  adaptiveRecommendation: string;
  results: ScenarioResult[];
  weakAreas: string[];
  scenarios: Scenario[];
};

export default function Result() {
  const navigate = useNavigate();
  const [reviewIndex, setReviewIndex] = useState(0);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const raw = localStorage.getItem("lastResult");
  const result = raw ? JSON.parse(raw) as LastResult : null;

  if (!result) {
    return (
      <main className="page">
        <h1>Result + Feedback</h1>
        <p>No completed attempt is available yet.</p>
        <button onClick={() => navigate("/attack")}>Start simulation</button>
      </main>
    );
  }

  const currentReview = result.results[reviewIndex];
  const currentScenario = result.scenarios.find((scenario) => scenario.id === currentReview?.scenarioId);

  const sendFeedback = async () => {
    await submitFeedback({
      userId: getUserId(),
      attemptId: (result as any).attemptId,
      attackType: result.attackType,
      level: result.level,
      rating,
      comments
    });
    setFeedbackMessage("Feedback submitted.");
    setComments("");
  };

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">Result + Feedback</p>
        <h1>{result.score}/{result.total} score</h1>
        <p className="lead">{result.feedbackBand}. Accuracy: {Math.round(result.accuracy)}%.</p>
      </header>

      <section className="grid two">
        <article className="panel">
          <h2>Post-Level Analysis</h2>
          <p>Correct: {result.score}</p>
          <p>Wrong: {result.total - result.score}</p>
          <p>Adaptive next step: {result.adaptiveRecommendation}</p>
          <div className="tag-list">
            {result.weakAreas.length ? result.weakAreas.map((area) => <span className="tag" key={area}>{area}</span>) : <span className="tag">No weak areas</span>}
          </div>
        </article>

        <article className="panel">
          <h2>Next Level / Retry</h2>
          <p>Low score repeats the same or easier level with weak-area focus. Medium score raises difficulty carefully. A perfect score unlocks the next level.</p>
          <button onClick={() => navigate(`/simulation?attackType=${result.attackType}&level=${result.level}`)}>Retry focused attempt</button>
        </article>
      </section>

      {currentReview && (
        <section className="result-list">
          <article className="panel">
            <p className="eyebrow">Scenario {reviewIndex + 1} of {result.results.length}: {currentReview.correct ? "Correct safe behavior" : "Attack success / missed judgment"}</p>
            <h2>{currentReview.title}</h2>
            {currentScenario && <p className="hint">{currentScenario.context} / {currentScenario.visualVariant}</p>}
            <p>Decision: {currentReview.selectedAction}. Correct action: {currentReview.correctAction}.</p>
            <p>{currentReview.explanation}</p>
            <h3>Prevention</h3>
            {currentReview.preventionTips.map((tip) => <p key={tip}>{tip}</p>)}
            <h3>Recovery</h3>
            {currentReview.postAttackActions.map((action) => <p key={action}>{action}</p>)}
          </article>

          <section className="footer-actions">
            <button disabled={reviewIndex === 0} onClick={() => setReviewIndex((index) => index - 1)}>Previous review</button>
            <button disabled={reviewIndex === result.results.length - 1} onClick={() => setReviewIndex((index) => index + 1)}>Next review</button>
          </section>
        </section>
      )}

      <section className="panel feedback-card">
        <p className="eyebrow">Training Feedback</p>
        <h2>Rate this attempt</h2>
        <div className="form-grid compact">
          <label>
            Rating
            <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
              <option value={5}>5 - Very useful</option>
              <option value={4}>4 - Useful</option>
              <option value={3}>3 - Okay</option>
              <option value={2}>2 - Needs work</option>
              <option value={1}>1 - Not useful</option>
            </select>
          </label>
          <label>
            Comments
            <textarea value={comments} onChange={(event) => setComments(event.target.value)} placeholder="What should the training improve?" />
          </label>
        </div>
        {feedbackMessage && <p className="success-text">{feedbackMessage}</p>}
        <button onClick={sendFeedback}>Submit feedback</button>
      </section>

      <section className="footer-actions">
        <button onClick={() => navigate("/attack")}>Next module</button>
        <button onClick={() => navigate("/dashboard")}>Back to dashboard</button>
      </section>
    </main>
  );
}
