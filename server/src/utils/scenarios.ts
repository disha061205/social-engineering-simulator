export type AttackType = "phishing" | "smishing" | "pretexting" | "scareware";
export type Level = "easy" | "medium" | "hard";
export type ScenarioType = "attack" | "genuine";
export type DecisionAction = "click" | "ignore" | "report" | "verify";
export type ScenarioContext = "email" | "sms" | "chat" | "popup";

export type TrainingScenario = {
  id: string;
  title: string;
  attackType: AttackType;
  level: Level;
  context: ScenarioContext;
  content: string;
  visualVariant: string;
  type: ScenarioType;
  hiddenIntent: ScenarioType;
  decisionOptions: DecisionAction[];
  correctDecision: DecisionAction;
  explanation: string;
  preventionTips: string[];
  postAttackActions: string[];
  weakAreaTags: string[];
  difficultyMarkers: string[];
  moduleFlow: string[];
};

const attackCopy: Record<AttackType, {
  context: ScenarioContext;
  intro: string;
  attackSubjects: string[];
  genuineSubjects: string[];
  redFlags: string[];
  prevention: string[];
  recovery: string[];
  weakTags: string[];
}> = {
  phishing: {
    context: "email",
    intro: "Email-based social engineering that tries to steal credentials, money, or sensitive files.",
    attackSubjects: ["mailbox storage alert", "invoice approval", "cloud document share", "payroll update", "bank verification", "delivery exception", "password expiry", "HR benefits form", "security review", "conference invite", "vendor payment change", "tax document"],
    genuineSubjects: ["monthly statement notice", "scheduled benefits update", "approved cloud share", "delivery receipt", "internal newsletter", "calendar invitation", "security training reminder", "support ticket closure"],
    redFlags: ["sender domain mismatch", "urgent deadline", "credential request", "unexpected attachment", "masked link"],
    prevention: ["Open the service from a saved bookmark instead of the email link.", "Check the sender domain and link destination before acting.", "Report credential or payment requests to the security team."],
    recovery: ["Change the exposed password.", "Revoke active sessions.", "Report the message and preserve headers for investigation."],
    weakTags: ["sender_validation", "link_inspection", "urgency_pressure", "credential_request"]
  },
  smishing: {
    context: "sms",
    intro: "SMS-based social engineering that uses short links, account alerts, and OTP pressure.",
    attackSubjects: ["package redelivery", "bank card block", "wallet KYC", "OTP verification", "tax refund", "mobile plan prize", "missed voicemail", "parking fine", "account suspension", "loan approval", "electric bill warning", "delivery address correction"],
    genuineSubjects: ["delivery completed", "appointment reminder", "bank transaction notice", "two-factor code you requested", "pharmacy pickup notice", "service outage update", "ride receipt", "billing autopay confirmation"],
    redFlags: ["shortened link", "OTP request", "unknown sender", "panic language", "unexpected payment demand"],
    prevention: ["Do not open short links from unexpected texts.", "Never share OTPs with anyone.", "Verify through the official app or phone number."],
    recovery: ["Contact the provider using the official number.", "Freeze affected payment cards when needed.", "Delete malicious texts after reporting them."],
    weakTags: ["short_link", "otp_theft", "mobile_urgency", "sender_validation"]
  },
  pretexting: {
    context: "chat",
    intro: "Impersonation that creates a believable story to extract access, data, or approval.",
    attackSubjects: ["IT password reset", "CEO gift-card request", "vendor bank update", "HR file check", "building access request", "new joiner setup", "support desk verification", "auditor data request", "manager travel emergency", "procurement exception", "legal hold request", "helpdesk MFA reset"],
    genuineSubjects: ["IT ticket follow-up", "HR portal reminder", "manager asks for public report", "vendor confirms ticket number", "auditor uses approved channel", "facilities schedules access", "support asks for device serial", "procurement requests PO number"],
    redFlags: ["authority pressure", "secretive request", "password request", "unverified identity", "process bypass"],
    prevention: ["Verify identity through a second trusted channel.", "Refuse password or MFA code requests.", "Follow approval workflows even when the request sounds urgent."],
    recovery: ["Notify the helpdesk or security team.", "Document what was shared.", "Rotate credentials or revoke access if sensitive data was disclosed."],
    weakTags: ["identity_verification", "authority_pressure", "process_bypass", "data_request"]
  },
  scareware: {
    context: "popup",
    intro: "Fake security warnings that push users into installing software, calling fraud numbers, or paying.",
    attackSubjects: ["virus detected popup", "browser locked warning", "fake antivirus scan", "driver update alert", "support phone number", "subscription expired warning", "ransom countdown", "extension cleanup prompt", "system registry errors", "camera compromised alert", "malware quarantine prompt", "device performance scan"],
    genuineSubjects: ["operating system update", "browser permission prompt", "installed antivirus notice", "software update from app store", "download blocked by browser", "extension permission review", "backup reminder", "password manager warning"],
    redFlags: ["fake scan", "forced download", "support number", "countdown timer", "browser impersonation"],
    prevention: ["Close suspicious browser tabs without clicking inside the popup.", "Use installed security tools rather than popup downloads.", "Get support through official IT channels."],
    recovery: ["Disconnect from the network if software was installed.", "Run an approved security scan.", "Report any payment or remote-control session immediately."],
    weakTags: ["panic_response", "fake_support", "download_prompt", "system_prompt_validation"]
  }
};

const levelMarkers: Record<Level, string[]> = {
  easy: ["obvious warning signs", "generic message", "visible urgency"],
  medium: ["plausible branding", "mixed genuine details", "moderate urgency"],
  hard: ["contextual timing", "subtle mismatch", "professional tone"]
};

const levels: Level[] = ["easy", "medium", "hard"];
const attackTypes: AttackType[] = ["phishing", "smishing", "pretexting", "scareware"];
const moduleFlow = ["Introduction", "Simulation", "User Decision", "Result", "Explanation", "Prevention", "Post-Attack Actions"];

function buildMessageContent(
  attackType: AttackType,
  level: Level,
  type: ScenarioType,
  subject: string,
  marker: string,
  cue: string
) {
  const isAttack = type === "attack";
  const urgency = level === "easy" ? "within 30 minutes" : level === "medium" ? "before end of day" : "after the pending review closes";

  if (attackType === "phishing") {
    return isAttack
      ? `Subject: Action needed: ${subject}
From: Security Desk <notice@secure-${subject.replaceAll(" ", "-")}.co>
Body: We detected an issue on your account. Open the secure review link and confirm your password ${urgency}. If you do not complete this, access may be paused.
Link label: Review account
Training cue: ${marker}. Hidden red flag: ${cue}.`
      : `Subject: ${subject}
From: Notifications <no-reply@trusted.example>
Body: Your requested update is available in the official portal. No password, payment, or attachment action is required from this email.
Next step: Open the official app or bookmarked portal if you want to review it.
Training cue: ${marker}.`;
  }

  if (attackType === "smishing") {
    return isAttack
      ? `SMS: ${subject}: your account requires confirmation ${urgency}. Tap the link and enter the verification code we send next. Hidden red flag: ${cue}. Training cue: ${marker}.`
      : `SMS: ${subject}. This notice matches an expected activity and does not request an OTP, payment, or password. Training cue: ${marker}.`;
  }

  if (attackType === "pretexting") {
    return isAttack
      ? `Chat: "Hi, this is Operations. I am handling ${subject}. Send the password/MFA approval here so I can close the request ${urgency}. Keep this in chat so the ticket does not get delayed." Hidden red flag: ${cue}. Training cue: ${marker}.`
      : `Chat: "Following up on ${subject}. Please use the official portal/ticket and share only the approved reference number. No password or MFA code is needed." Training cue: ${marker}.`;
  }

  return isAttack
    ? `Popup: Critical warning for ${subject}. Your device is unsafe. Install the recommended cleaner or call support ${urgency}. Hidden red flag: ${cue}. Training cue: ${marker}.`
    : `System notice: ${subject}. The update comes from an installed trusted app and can be reviewed from system settings. Training cue: ${marker}.`;
}

function buildScenario(attackType: AttackType, level: Level, type: ScenarioType, index: number): TrainingScenario {
  const copy = attackCopy[attackType];
  const subjects = type === "attack" ? copy.attackSubjects : copy.genuineSubjects;
  const subject = subjects[index % subjects.length] ?? subjects[0] ?? "security notice";
  const marker = levelMarkers[level][index % levelMarkers[level].length] ?? "scenario variation";
  const tag = copy.weakTags[index % copy.weakTags.length] ?? "verification";
  const id = `${attackType}-${level}-${type}-${String(index + 1).padStart(2, "0")}`;
  const isAttack = type === "attack";
  const correctDecision: DecisionAction = isAttack ? (index % 2 === 0 ? "report" : "verify") : (index % 2 === 0 ? "verify" : "click");
  const cue = copy.redFlags[index % copy.redFlags.length] ?? "verification mismatch";

  return {
    id,
    title: `${subject} (${level})`,
    attackType,
    level,
    context: copy.context,
    content: buildMessageContent(attackType, level, type, subject, marker, cue),
    visualVariant: `${copy.context}-${level}-variant-${(index % 5) + 1}`,
    type,
    hiddenIntent: type,
    decisionOptions: ["click", "ignore", "report", "verify"],
    correctDecision,
    explanation: isAttack
      ? `This is ${attackType}. The strongest warning sign is ${cue}, combined with ${marker}.`
      : `This appears genuine because it uses an expected channel and does not request a risky bypass. Verification is still appropriate when unsure.`,
    preventionTips: copy.prevention,
    postAttackActions: isAttack ? copy.recovery : ["Keep using the official workflow.", "Report only if new evidence makes the message suspicious.", "Record the verification source for auditability."],
    weakAreaTags: [tag, cue.replaceAll(" ", "_")],
    difficultyMarkers: [marker],
    moduleFlow
  };
}

export const scenarios: TrainingScenario[] = attackTypes.flatMap((attackType) =>
  levels.flatMap((level) => [
    ...Array.from({ length: 18 }, (_, index) => buildScenario(attackType, level, "attack", index)),
    ...Array.from({ length: 12 }, (_, index) => buildScenario(attackType, level, "genuine", index))
  ])
);

export const attackIntroductions = attackTypes.map((attackType) => ({
  attackType,
  introduction: attackCopy[attackType].intro,
  requiredFlow: moduleFlow
}));
