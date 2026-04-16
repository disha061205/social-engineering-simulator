import { useNavigate } from "react-router-dom";

const attacks = [
  { id: "phishing", title: "Phishing", text: "Email lures, fake logins, invoices, and document shares." },
  { id: "smishing", title: "Smishing", text: "SMS links, OTP theft, delivery alerts, and mobile account pressure." },
  { id: "pretexting", title: "Pretexting", text: "Impersonation, authority pressure, and process bypass requests." },
  { id: "scareware", title: "Scareware", text: "Fake popups, virus warnings, support scams, and forced downloads." }
];

export default function AttackSelection() {
  const navigate = useNavigate();

  const chooseAttack = (attackType: string) => {
    localStorage.setItem("selectedAttackType", attackType);
    navigate("/level");
  };

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">Attack Selection</p>
        <h1>Choose a training attack</h1>
        <p className="lead">Each module follows Introduction, Simulation, User Decision, Result, Explanation, Prevention, and Post-Attack Actions.</p>
      </header>

      <section className="grid four">
        {attacks.map((attack) => (
          <button className="choice-card" key={attack.id} onClick={() => chooseAttack(attack.id)}>
            <strong>{attack.title}</strong>
            <span>{attack.text}</span>
          </button>
        ))}
      </section>
    </main>
  );
}
