import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

const normalizeStringList = (value: unknown, fallback: string[] = []) => {
  if (Array.isArray(value)) {
    const items = value.map((item) => String(item).trim()).filter(Boolean);
    return items.length ? items : fallback;
  }

  if (typeof value === "string") {
    const items = value
      .split(/\r?\n|[.;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    return items.length ? items : fallback;
  }

  return fallback;
};

const normalizeScenario = (raw: any): Scenario => ({
  id: String(raw?.id ?? raw?._id ?? ""),
  title: String(raw?.title ?? "Untitled scenario"),
  attackType: String(raw?.attackType ?? "phishing"),
  level: String(raw?.level ?? "easy"),
  context: raw?.context ?? "email",
  content: String(raw?.content ?? ""),
  visualVariant: String(raw?.visualVariant ?? `${raw?.context ?? "email"}-${raw?.level ?? "easy"}`),
  type: raw?.type ?? "attack",
  hiddenIntent: raw?.hiddenIntent ?? raw?.type ?? "attack",
  decisionOptions: normalizeStringList(raw?.decisionOptions, ["click", "ignore", "report", "verify"]) as DecisionAction[],
  correctDecision: (raw?.correctDecision ?? (raw?.type === "genuine" ? "verify" : "report")) as DecisionAction,
  explanation: String(raw?.explanation ?? "Review the sender, context, urgency, and requested action."),
  preventionTips: normalizeStringList(raw?.preventionTips ?? raw?.prevention, ["Verify through an official channel."]),
  postAttackActions: normalizeStringList(raw?.postAttackActions ?? raw?.solution, ["Report and contain the incident."]),
  weakAreaTags: normalizeStringList(raw?.weakAreaTags, ["verification"]),
  difficultyMarkers: normalizeStringList(raw?.difficultyMarkers, [String(raw?.level ?? "easy")]),
  moduleFlow: normalizeStringList(raw?.moduleFlow, ["Introduction", "Simulation", "User Decision", "Result", "Explanation", "Prevention", "Post-Attack Actions"]),
  status: typeof raw?.status === "string" ? raw.status : undefined,
  source: raw?.source === "database" ? "database" : "built-in"
});

export type DecisionAction = "click" | "ignore" | "report" | "verify";

export type Scenario = {
  id: string;
  title: string;
  attackType: string;
  level: string;
  context: "email" | "sms" | "chat" | "popup";
  content: string;
  visualVariant: string;
  type: "attack" | "genuine";
  hiddenIntent: "attack" | "genuine";
  decisionOptions: DecisionAction[];
  correctDecision: DecisionAction;
  explanation: string;
  preventionTips: string[];
  postAttackActions: string[];
  weakAreaTags: string[];
  difficultyMarkers: string[];
  moduleFlow: string[];
  status?: string;
  source?: "database" | "built-in";
};

export type SimulationResponse = {
  attackType: string;
  level: string;
  attemptRules: {
    totalScenarios: number;
    attackScenarios: number;
    genuineScenarios: number;
    nonRepetition: string;
  };
  scenarios: Scenario[];
};

export type ScenarioDraft = {
  title: string;
  attackType: string;
  level: string;
  context: string;
  type: string;
  content: string;
  [key: string]: unknown;
};

export const fetchScenarios = async (attackType: string, level: string, used: string[] = [], focus: string[] = []) => {
  const res = await API.get<SimulationResponse>("/simulate", {
    params: {
      attackType,
      level,
      used: used.join(","),
      focus: focus.join(",")
    }
  });
  return {
    ...res.data,
    scenarios: Array.isArray(res.data?.scenarios) ? res.data.scenarios.map(normalizeScenario) : []
  };
};

export const submitScore = async (data: any) => {
  const res = await API.post("/score", data);
  return res.data;
};

export const fetchResults = async (userId: string) => {
  const res = await API.get(`/results/${userId}`);
  return res.data;
};

export const fetchAdminAnalytics = async () => {
  const res = await API.get("/admin/analytics");
  return res.data;
};

export const fetchScenarioLibrary = async (attackType = "", level = "") => {
  const res = await API.get("/scenario", { params: { attackType, level } });
  return Array.isArray(res.data) ? res.data.map(normalizeScenario) : [];
};

export const createScenario = async (scenario: ScenarioDraft) => {
  const res = await API.post("/scenario", scenario);
  return res.data;
};

export const updateScenario = async (scenarioId: string, scenario: Partial<ScenarioDraft>) => {
  const res = await API.put(`/scenario/${scenarioId}`, scenario);
  return res.data;
};

export const archiveScenario = async (scenarioId: string) => {
  const res = await API.delete(`/scenario/${scenarioId}`);
  return res.data;
};

export const submitFeedback = async (data: {
  userId: string;
  attemptId?: string;
  attackType: string;
  level: string;
  rating: number;
  comments: string;
}) => {
  const res = await API.post("/feedback", data);
  return res.data;
};
