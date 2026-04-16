import { useNavigate } from "react-router-dom";

const levels = [
  { id: "easy", title: "Easy", text: "Obvious red flags, generic wording, and visible urgency." },
  { id: "medium", title: "Medium", text: "Plausible branding, mixed details, and moderate pressure." },
  { id: "hard", title: "Hard", text: "Contextual messages, subtle mismatch, and professional tone." }
];

export default function LevelSelection() {
  const navigate = useNavigate();
  const attackType = localStorage.getItem("selectedAttackType") || "phishing";

  const chooseLevel = (level: string) => {
    localStorage.setItem("selectedLevel", level);
    navigate(`/simulation?attackType=${attackType}&level=${level}`);
  };

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">Level Selection</p>
        <h1>{attackType} difficulty</h1>
        <p className="lead">Each attempt draws five scenarios: three attacks, two genuine messages, randomized and shuffled.</p>
      </header>

      <section className="grid three">
        {levels.map((level) => (
          <button className="choice-card" key={level.id} onClick={() => chooseLevel(level.id)}>
            <strong>{level.title}</strong>
            <span>{level.text}</span>
          </button>
        ))}
      </section>
    </main>
  );
}
