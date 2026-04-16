import { useEffect, useMemo, useState } from "react";
import {
  archiveScenario,
  createScenario,
  fetchAdminAnalytics,
  fetchScenarioLibrary,
  updateScenario,
  type Scenario
} from "../../services/simulation/api";
import { getUserRole, logoutUser } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

type AdminTab = "users" | "scenarios" | "levels" | "content" | "feedback";
type LevelConfig = {
  scenarioCount: number;
  attackCount: number;
  genuineCount: number;
  passScore: number;
};

const defaultLevelConfig: LevelConfig = { scenarioCount: 5, attackCount: 3, genuineCount: 2, passScore: 5 };
const attackTypes = ["phishing", "smishing", "pretexting", "scareware"];
const levels = ["easy", "medium", "hard"];
const intents = ["attack", "genuine"];
const contexts = ["email", "sms", "chat", "popup"];
const decisions = ["click", "ignore", "report", "verify"];

const createEmptyScenarioDraft = () => ({
  title: "",
  attackType: "phishing",
  level: "easy",
  context: "email",
  type: "attack",
  content: "",
  correctDecision: "report",
  explanation: "",
  preventionTips: "Verify through official channels\nInspect sender identity\nValidate links before acting",
  postAttackActions: "Report the message\nChange exposed passwords\nNotify security",
  weakAreaTags: "sender_validation"
});

const splitTextareaList = (value: string) =>
  value
    .split(/\r?\n|[.;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const joinTextareaList = (items?: string[]) => (items?.length ? items.join("\n") : "");

const deriveSource = (scenario: Scenario) => scenario.source ?? (scenario.id.includes("-") ? "built-in" : "database");
const isCustomScenario = (scenario: Scenario | null) => !!scenario && deriveSource(scenario) === "database";
const scenarioSubtitle = (scenario: Scenario) => `${scenario.attackType} / ${scenario.level} / ${scenario.type} / ${deriveSource(scenario)}`;
const readStoredLevelConfig = (): LevelConfig => {
  try {
    const saved = localStorage.getItem("adminLevelConfig");
    return saved ? JSON.parse(saved) as LevelConfig : defaultLevelConfig;
  } catch {
    localStorage.removeItem("adminLevelConfig");
    return defaultLevelConfig;
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [scenarioFilters, setScenarioFilters] = useState({ attackType: "phishing", level: "easy" });
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(readStoredLevelConfig);
  const [draft, setDraft] = useState(createEmptyScenarioDraft);
  const [contentDraft, setContentDraft] = useState({
    explanation: "",
    preventionTips: "",
    postAttackActions: ""
  });

  const selectedScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? null,
    [scenarios, selectedScenarioId]
  );

  const refreshAdmin = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const analytics = await fetchAdminAnalytics();
      setData(analytics);
    } catch (error: any) {
      setData(null);
      setLoadError(error.response?.data?.message || "Admin analytics could not be loaded. Please refresh after the server is ready.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshScenarios = () => {
    fetchScenarioLibrary(scenarioFilters.attackType, scenarioFilters.level)
      .then((items) => {
        setScenarios(items);
        setSelectedScenarioId((previous) => {
          if (previous && items.some((scenario: Scenario) => scenario.id === previous)) return previous;
          return items[0]?.id ?? "";
        });
      })
      .catch(() => {
        setScenarios([]);
        setSelectedScenarioId("");
      });
  };

  useEffect(() => {
    refreshAdmin();
  }, []);

  useEffect(() => {
    refreshScenarios();
  }, [scenarioFilters.attackType, scenarioFilters.level]);

  useEffect(() => {
    if (!selectedScenario) {
      setContentDraft({ explanation: "", preventionTips: "", postAttackActions: "" });
      return;
    }

    setContentDraft({
      explanation: selectedScenario.explanation ?? "",
      preventionTips: joinTextareaList(selectedScenario.preventionTips),
      postAttackActions: joinTextareaList(selectedScenario.postAttackActions)
    });
  }, [selectedScenario]);

  const filteredScenarios = useMemo(() => {
    return scenarios
      .filter((scenario) => scenario.status !== "archived")
      .sort((left, right) => {
        const sourceOrder = deriveSource(left) === deriveSource(right)
          ? 0
          : deriveSource(left) === "database" ? -1 : 1;
        if (sourceOrder !== 0) return sourceOrder;
        return left.title.localeCompare(right.title);
      });
  }, [scenarios]);

  const addScenario = async () => {
    const scenario = {
      ...draft,
      hiddenIntent: draft.type,
      visualVariant: `${draft.context}-${draft.level}-custom`,
      decisionOptions: decisions,
      preventionTips: splitTextareaList(draft.preventionTips),
      postAttackActions: splitTextareaList(draft.postAttackActions),
      weakAreaTags: splitTextareaList(draft.weakAreaTags),
      difficultyMarkers: [draft.level],
      status: "active"
    };

    await createScenario(scenario);
    setDraft(createEmptyScenarioDraft());
    setAdminMessage("Scenario added with its own explanation, prevention tips, and recovery actions.");
    refreshScenarios();
  };

  const removeSelectedScenario = async () => {
    if (!selectedScenario || !isCustomScenario(selectedScenario)) return;
    await archiveScenario(selectedScenario.id);
    setAdminMessage(`Scenario "${selectedScenario.title}" was removed from the active library.`);
    refreshScenarios();
  };

  const saveLevelConfig = () => {
    localStorage.setItem("adminLevelConfig", JSON.stringify(levelConfig));
    setAdminMessage("Level configuration draft saved.");
  };

  const saveScenarioContent = async () => {
    if (!selectedScenario || !isCustomScenario(selectedScenario)) return;

    await updateScenario(selectedScenario.id, {
      explanation: contentDraft.explanation,
      preventionTips: splitTextareaList(contentDraft.preventionTips),
      postAttackActions: splitTextareaList(contentDraft.postAttackActions)
    });

    setAdminMessage(`Content saved for "${selectedScenario.title}".`);
    refreshScenarios();
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/", { replace: true });
  };

  return (
    <main className="page admin-page">
      <header className="page-header hero-band">
        <div className="header-actions">
          <div>
            <p className="eyebrow">Admin Dashboard</p>
            <h1>Training command center</h1>
            <p className="lead">Manage users, scenario content, level rules, learning copy, and learner feedback from one workspace.</p>
          </div>
          <button onClick={handleLogout}>Log out</button>
        </div>
      </header>

      {getUserRole() !== "admin" && (
        <section className="panel">
          <h2>Admin access required</h2>
          <p>Only registered admin accounts can open this page.</p>
        </section>
      )}

      {getUserRole() === "admin" && isLoading && (
        <section className="panel">
          <h2>Loading admin workspace</h2>
          <p>Fetching analytics, users, scenarios, and feedback.</p>
        </section>
      )}

      {getUserRole() === "admin" && loadError && (
        <section className="panel">
          <h2>Admin data unavailable</h2>
          <p>{loadError}</p>
          <div className="admin-inline-actions">
            <button onClick={refreshAdmin}>Retry loading admin data</button>
            <button onClick={handleLogout}>Log out and sign in again</button>
          </div>
        </section>
      )}

      {getUserRole() === "admin" && !isLoading && !loadError && !data && (
        <section className="panel">
          <h2>Admin session needs refresh</h2>
          <p>The admin page loaded without usable data. This can happen with a stale browser session.</p>
          <div className="admin-inline-actions">
            <button onClick={refreshAdmin}>Retry loading admin data</button>
            <button onClick={handleLogout}>Log out and sign in again</button>
          </div>
        </section>
      )}

      {getUserRole() === "admin" && data && (
        <>
          <section className="metric-grid">
            <article className="metric"><strong>{data.totalUsers}</strong><span>Tracked learners</span></article>
            <article className="metric"><strong>{data.totalRegisteredLearners}</strong><span>Registered learners</span></article>
            <article className="metric"><strong>{data.averageScore}</strong><span>Average score</span></article>
            <article className="metric"><strong>{data.mostFailedAttackType}</strong><span>Most failed attack</span></article>
          </section>

          <section className="admin-tabs">
            {(["users", "scenarios", "levels", "content", "feedback"] as AdminTab[]).map((tab) => (
              <button className={activeTab === tab ? "selected" : ""} key={tab} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </section>

          {activeTab === "users" && (
            <section className="grid two">
              <article className="panel">
                <h2>User Tracking</h2>
                {data.attempts?.length ? data.attempts.map((attempt: any) => (
                  <div className="score-row admin-attempt-row" key={attempt._id}>
                    <strong>{attempt.userName}</strong>
                    <span>{attempt.attackType}</span>
                    <span>{attempt.level}</span>
                    <span>{attempt.score}/{attempt.total}</span>
                    <span>{attempt.userEmail || "No email recorded"}</span>
                  </div>
                )) : <p>No attempts recorded yet.</p>}
              </article>

              <article className="panel">
                <h2>Weak Areas</h2>
                <div className="tag-list">
                  {data.weakAreas?.length ? data.weakAreas.map((area: any) => <span className="tag" key={area._id}>{area._id}: {area.count}</span>) : <p>No weak areas yet.</p>}
                </div>
              </article>
            </section>
          )}

          {activeTab === "scenarios" && (
            <section className="grid two admin-workspace">
              <article className="panel">
                <h2>Scenario Management</h2>
                <div className="form-grid compact">
                  <label>
                    Attack type
                    <select value={scenarioFilters.attackType} onChange={(event) => setScenarioFilters((previous) => ({ ...previous, attackType: event.target.value }))}>
                      {attackTypes.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label>
                    Level
                    <select value={scenarioFilters.level} onChange={(event) => setScenarioFilters((previous) => ({ ...previous, level: event.target.value }))}>
                      {levels.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                </div>

                <div className="scenario-list">
                  {filteredScenarios.length ? filteredScenarios.map((scenario) => (
                    <button
                      className={selectedScenario?.id === scenario.id ? "selected scenario-list-item" : "scenario-list-item"}
                      key={scenario.id}
                      onClick={() => setSelectedScenarioId(scenario.id)}
                    >
                      <strong>{scenario.title || "Untitled scenario"}</strong>
                      <span>{scenarioSubtitle(scenario)}</span>
                    </button>
                  )) : <p>No scenarios found for this attack/level combination.</p>}
                </div>

                <div className="admin-inline-actions">
                  <button disabled={!selectedScenario || !isCustomScenario(selectedScenario)} onClick={removeSelectedScenario}>
                    Remove selected scenario
                  </button>
                  <button disabled={!selectedScenario} onClick={() => setActiveTab("content")}>
                    Open selected scenario content
                  </button>
                </div>
                <p className="hint">Built-in scenarios are preview-only. Custom database scenarios can be edited or removed.</p>
              </article>

              <article className="panel">
                <h2>Add / Preview Scenario</h2>
                <div className="form-grid compact">
                  <label>
                    Title
                    <input value={draft.title} onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))} />
                  </label>
                  <label>
                    Attack
                    <select value={draft.attackType} onChange={(event) => setDraft((previous) => ({ ...previous, attackType: event.target.value }))}>
                      {attackTypes.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label>
                    Level
                    <select value={draft.level} onChange={(event) => setDraft((previous) => ({ ...previous, level: event.target.value }))}>
                      {levels.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label>
                    Context
                    <select value={draft.context} onChange={(event) => setDraft((previous) => ({ ...previous, context: event.target.value }))}>
                      {contexts.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label>
                    Intent
                    <select value={draft.type} onChange={(event) => setDraft((previous) => ({ ...previous, type: event.target.value }))}>
                      {intents.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label>
                    Correct decision
                    <select value={draft.correctDecision} onChange={(event) => setDraft((previous) => ({ ...previous, correctDecision: event.target.value }))}>
                      {decisions.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label>
                    Weak-area tags
                    <input value={draft.weakAreaTags} onChange={(event) => setDraft((previous) => ({ ...previous, weakAreaTags: event.target.value }))} />
                  </label>
                  <label>
                    Message
                    <textarea value={draft.content} onChange={(event) => setDraft((previous) => ({ ...previous, content: event.target.value }))} />
                  </label>
                  <label>
                    Explanation
                    <textarea value={draft.explanation} onChange={(event) => setDraft((previous) => ({ ...previous, explanation: event.target.value }))} />
                  </label>
                  <label>
                    Prevention tips
                    <textarea value={draft.preventionTips} onChange={(event) => setDraft((previous) => ({ ...previous, preventionTips: event.target.value }))} />
                  </label>
                  <label>
                    Post-attack actions
                    <textarea value={draft.postAttackActions} onChange={(event) => setDraft((previous) => ({ ...previous, postAttackActions: event.target.value }))} />
                  </label>
                </div>
                <button disabled={!draft.title || !draft.content || !draft.explanation} onClick={addScenario}>Add scenario</button>

                {selectedScenario && (
                  <div className="preview-box">
                    <p className="eyebrow">Preview</p>
                    <h3>{selectedScenario.title}</h3>
                    <p className="hint">{scenarioSubtitle(selectedScenario)}</p>
                    <p>{selectedScenario.content}</p>
                  </div>
                )}
              </article>
            </section>
          )}

          {activeTab === "levels" && (
            <section className="panel">
              <h2>Level Configuration</h2>
              <div className="form-grid four-col">
                <label>Scenarios per attempt<input type="number" value={levelConfig.scenarioCount} onChange={(event) => setLevelConfig((previous) => ({ ...previous, scenarioCount: Number(event.target.value) }))} /></label>
                <label>Attack count<input type="number" value={levelConfig.attackCount} onChange={(event) => setLevelConfig((previous) => ({ ...previous, attackCount: Number(event.target.value) }))} /></label>
                <label>Genuine count<input type="number" value={levelConfig.genuineCount} onChange={(event) => setLevelConfig((previous) => ({ ...previous, genuineCount: Number(event.target.value) }))} /></label>
                <label>Unlock score<input type="number" value={levelConfig.passScore} onChange={(event) => setLevelConfig((previous) => ({ ...previous, passScore: Number(event.target.value) }))} /></label>
              </div>
              {adminMessage && <p className="success-text">{adminMessage}</p>}
              <button onClick={saveLevelConfig}>Save level configuration</button>
              <p className="hint">Current backend rule remains 5 scenarios with 3 attack and 2 genuine. This panel prepares the admin configuration UI for persistence.</p>
            </section>
          )}

          {activeTab === "content" && (
            <section className="panel">
              <h2>Scenario Content Management</h2>
              {selectedScenario ? (
                <>
                  <div className="preview-box">
                    <p className="eyebrow">Selected scenario</p>
                    <h3>{selectedScenario.title}</h3>
                    <p className="hint">{scenarioSubtitle(selectedScenario)}</p>
                  </div>

                  <div className="form-grid compact">
                    <label>
                      Explanation
                      <textarea
                        disabled={!isCustomScenario(selectedScenario)}
                        value={contentDraft.explanation}
                        onChange={(event) => setContentDraft((previous) => ({ ...previous, explanation: event.target.value }))}
                      />
                    </label>
                    <label>
                      Prevention tips
                      <textarea
                        disabled={!isCustomScenario(selectedScenario)}
                        value={contentDraft.preventionTips}
                        onChange={(event) => setContentDraft((previous) => ({ ...previous, preventionTips: event.target.value }))}
                      />
                    </label>
                    <label>
                      Post-attack actions
                      <textarea
                        disabled={!isCustomScenario(selectedScenario)}
                        value={contentDraft.postAttackActions}
                        onChange={(event) => setContentDraft((previous) => ({ ...previous, postAttackActions: event.target.value }))}
                      />
                    </label>
                  </div>

                  {adminMessage && <p className="success-text">{adminMessage}</p>}
                  <button disabled={!isCustomScenario(selectedScenario)} onClick={saveScenarioContent}>Save scenario content</button>
                  <p className="hint">
                    Each scenario now carries its own explanation, prevention tips, and post-attack actions.
                    {isCustomScenario(selectedScenario) ? " One line per item works well here." : " Built-in scenarios remain read-only previews."}
                  </p>
                </>
              ) : (
                <p>Select a scenario in the scenarios tab first, then open content to edit its linked guidance.</p>
              )}
            </section>
          )}

          {activeTab === "feedback" && (
            <section className="panel">
              <h2>Feedback System</h2>
              {data.feedback?.length ? data.feedback.map((item: any) => (
                <div className="feedback-row" key={item._id}>
                  <strong>{item.rating}/5</strong>
                  <span>{item.attackType} / {item.level}</span>
                  <p>{item.comments || "No comment"}</p>
                </div>
              )) : <p>Feedback appears here after users submit ratings from the result page.</p>}
            </section>
          )}
        </>
      )}
    </main>
  );
}
