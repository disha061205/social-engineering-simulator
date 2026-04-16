import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchScenarios, submitScore, type DecisionAction, type Scenario } from "../../services/simulation/api";
import { getUserId } from "../../utils/auth";

const introductions: Record<string, string> = {
  phishing: "Inspect sender identity, links, attachments, and requests before acting on email.",
  smishing: "Treat unexpected SMS links and OTP requests as high risk until verified.",
  pretexting: "Verify identity and refuse process bypasses, even when the request sounds authoritative.",
  scareware: "Do not panic-click popups. Validate security warnings through trusted tools."
};

const trainingSteps = ["Introduction", "Simulation", "Decision", "Feedback", "Prevention", "Recovery"] as const;

type TrainingStep = typeof trainingSteps[number];

function extractLine(content: string, prefix: string) {
  return content
    .split("\n")
    .find((line) => line.toLowerCase().startsWith(prefix.toLowerCase()))
    ?.replace(new RegExp(`^${prefix}\\s*`, "i"), "")
    .trim();
}

function renderScenarioPreview(scenario: Scenario) {
  const subject = extractLine(scenario.content, "Subject:") || scenario.title;
  const sender = extractLine(scenario.content, "From:") || "Security Desk <notice@example.com>";
  const body = extractLine(scenario.content, "Body:") || scenario.content;
  const linkLabel = extractLine(scenario.content, "Link label:") || "Open secure review";

  if (scenario.context === "email") {
    return (
      <div className="email-preview">
        <div className="mail-sidebar">
          <span>Inbox</span>
          <span>Flagged</span>
          <span>Reported</span>
        </div>
        <div className="mail-window">
          <div className="mail-toolbar">
            <span />
            <span />
            <span />
            <strong>Mail</strong>
          </div>
          <div className="mail-header">
            <div className="avatar">{sender.slice(0, 1).toUpperCase()}</div>
            <div>
              <strong>{subject}</strong>
              <p>{sender}</p>
            </div>
          </div>
          <p>{body}</p>
          <button className="mock-link">{linkLabel}</button>
          <div className="mail-footer">Reply | Forward | Report</div>
        </div>
      </div>
    );
  }

  if (scenario.context === "sms") {
    return (
      <div className="phone-preview">
        <div className="phone-top">9:41</div>
        <div className="sms-bubble">{scenario.content}</div>
        <div className="sms-input">Message</div>
      </div>
    );
  }

  if (scenario.context === "chat") {
    return (
      <div className="chat-preview">
        <div className="chat-title">Work Chat</div>
        <div className="chat-row incoming">{scenario.content}</div>
        <div className="chat-row outgoing">I will verify through the official channel.</div>
      </div>
    );
  }

  return (
    <div className="popup-preview">
      <div className="popup-bar">
        <span />
        <strong>System Security</strong>
      </div>
      <div className="warning-icon">!</div>
      <h3>{scenario.title}</h3>
      <p>{scenario.content}</p>
      <div className="popup-actions">
        <button className="danger-button">Install now</button>
        <button className="secondary-button">Close</button>
      </div>
    </div>
  );
}

export default function Simulation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const attackType = params.get("attackType") || localStorage.getItem("selectedAttackType") || "phishing";
  const level = params.get("level") || localStorage.getItem("selectedLevel") || "easy";
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [decisions, setDecisions] = useState<Record<string, DecisionAction>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeStep, setActiveStep] = useState<TrainingStep>("Introduction");
  const [loading, setLoading] = useState(true);
  const currentScenario = scenarios[currentIndex];
  const currentDecision = currentScenario ? decisions[currentScenario.id] : undefined;
  const decisionSubmitted = Boolean(currentDecision);
  const currentDecisionCorrect = currentScenario
    ? currentDecision === currentScenario.correctDecision
    : false;
  const answeredCount = Object.keys(decisions).length;

  const usedScenarioIds = useMemo(() => {
    const raw = localStorage.getItem("usedScenarioIds");
    return raw ? JSON.parse(raw) as string[] : [];
  }, []);

  const focusWeakAreas = useMemo(() => {
    const raw = localStorage.getItem("weakAreas");
    return raw ? JSON.parse(raw) as string[] : [];
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchScenarios(attackType, level, usedScenarioIds, focusWeakAreas)
      .then((data) => setScenarios(data.scenarios))
      .finally(() => setLoading(false));
  }, [attackType, focusWeakAreas, level, usedScenarioIds]);

  const chooseDecision = (scenarioId: string, action: DecisionAction) => {
    setDecisions((previous) => ({ ...previous, [scenarioId]: action }));
    setActiveStep("Feedback");
  };

  const goToScenario = (nextIndex: number) => {
    setCurrentIndex(nextIndex);
    setActiveStep("Introduction");
  };

  const finishAttempt = async () => {
    const userId = getUserId();
    const payload = {
      userId,
      attackType,
      level,
      scenarios,
      decisions: scenarios.map((scenario) => ({
        scenarioId: scenario.id,
        action: decisions[scenario.id]
      }))
    };

    const result = await submitScore(payload);
    const nextUsed = Array.from(new Set([...usedScenarioIds, ...scenarios.map((scenario) => scenario.id)]));
    localStorage.setItem("usedScenarioIds", JSON.stringify(nextUsed));
    localStorage.setItem("weakAreas", JSON.stringify(result.weakAreas ?? []));
    localStorage.setItem("lastResult", JSON.stringify({ ...result, attackType, level, scenarios }));
    navigate("/result");
  };

  if (loading) {
    return <main className="page"><p>Loading scenarios...</p></main>;
  }

  if (!currentScenario) {
    return <main className="page"><p>No scenarios are available for this module yet.</p></main>;
  }

  const renderActiveStep = () => {
    if (activeStep === "Introduction") {
      return (
        <section className={`scenario-frame ${currentScenario.context}`}>
          <div className="scenario-meta">
            <span>{currentIndex + 1} of {scenarios.length}</span>
            <span>{currentScenario.context}</span>
            <span>{currentScenario.level}</span>
          </div>
          <h2>Introduction</h2>
          <p>{introductions[attackType]}</p>
          <p>Review the scenario like a real message. Do not rely on one clue. Check sender identity, requested action, urgency, links, and whether the channel is expected.</p>
          <button onClick={() => setActiveStep("Simulation")}>Open simulation</button>
        </section>
      );
    }

    if (activeStep === "Simulation") {
      return (
        <section className={`scenario-frame ${currentScenario.context}`}>
          <div className="scenario-meta">
            <span>{currentIndex + 1} of {scenarios.length}</span>
            <span>{currentScenario.context}</span>
            <span>{currentScenario.visualVariant}</span>
          </div>
          <h2>{currentScenario.title}</h2>
          {renderScenarioPreview(currentScenario)}
          <button onClick={() => setActiveStep("Decision")}>Make decision</button>
        </section>
      );
    }

    if (activeStep === "Decision") {
      return (
        <section className={`scenario-frame ${currentScenario.context}`}>
          <div className="scenario-meta">
            <span>{currentIndex + 1} of {scenarios.length}</span>
            <span>Choose one action</span>
          </div>
          <h2>User Decision</h2>
          <p>Pick what you would do in a real work environment.</p>
          <section className="decision-grid embedded">
            {currentScenario.decisionOptions.map((action) => (
              <button
                key={action}
                className={currentDecision === action ? "selected" : ""}
                onClick={() => chooseDecision(currentScenario.id, action)}
              >
                {action}
              </button>
            ))}
          </section>
        </section>
      );
    }

    if (!decisionSubmitted) {
      return (
        <section className={`scenario-frame ${currentScenario.context}`}>
          <h2>{activeStep}</h2>
          <p>Make your decision first. Feedback, prevention, and recovery unlock after you choose an action.</p>
          <button onClick={() => setActiveStep("Decision")}>Go to decision</button>
        </section>
      );
    }

    if (activeStep === "Feedback") {
      return (
        <section className={`scenario-frame ${currentScenario.context}`}>
          <h2>{currentDecisionCorrect ? "Correct safe behavior" : "Attack success / missed judgment"}</h2>
          <p>Your decision: {currentDecision}. Correct action: {currentScenario.correctDecision}.</p>
          <p>{currentScenario.explanation}</p>
        </section>
      );
    }

    if (activeStep === "Prevention") {
      return (
        <section className={`scenario-frame ${currentScenario.context}`}>
          <h2>Prevention</h2>
          {currentScenario.preventionTips.map((tip) => <p key={tip}>{tip}</p>)}
        </section>
      );
    }

    return (
      <section className={`scenario-frame ${currentScenario.context}`}>
        <h2>Recovery</h2>
        {currentScenario.postAttackActions.map((action) => <p key={action}>{action}</p>)}
      </section>
    );
  };

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">Scenario Execution</p>
        <h1>{attackType} / {level}</h1>
        <p className="lead">{introductions[attackType]}</p>
      </header>

      <section className="workflow-strip">
        {trainingSteps.map((step) => (
          <button
            className={activeStep === step ? "active" : ""}
            key={step}
            onClick={() => setActiveStep(step)}
          >
            {step}
          </button>
        ))}
      </section>

      {renderActiveStep()}

      <section className="footer-actions">
        <button disabled={currentIndex === 0} onClick={() => goToScenario(currentIndex - 1)}>Previous</button>
        {currentIndex < scenarios.length - 1 ? (
          <button disabled={!decisions[currentScenario.id]} onClick={() => goToScenario(currentIndex + 1)}>Next scenario</button>
        ) : (
          <button disabled={answeredCount !== scenarios.length} onClick={finishAttempt}>Submit attempt</button>
        )}
      </section>
    </main>
  );
}
