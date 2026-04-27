import {
  BellRing,
  Braces,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Database,
  KeyRound,
  LockKeyhole,
  WalletCards,
  Webhook,
} from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";
import meterlaneLogo from "../assets/meterlane.png";
import { supabase } from "./lib/supabase";

const createRunCode = `import { Meterlane } from "@meterlane/sdk";

const meterlane = new Meterlane({
  apiKey: process.env.METERLANE_API_KEY
});

const run = await meterlane.runs.create({
  customerId: user.id,
  feature: "document_summary",
  provider: "openai",
  model: "gpt-5.2",
  creditCost: 5,
  input: {
    text: documentText
  }
});

return Response.json({
  runId: run.id,
  status: run.status
});`;

const accessCode = `const access = await meterlane.features.canRun({
  customerId: user.id,
  feature: "document_summary",
  estimatedUnits: 5
});

if (!access.allowed) {
  return Response.json({ reason: access.reason }, { status: 403 });
}`;

const webhookCode = `const event = await meterlane.webhooks.verify({
  body: rawBody,
  headers: request.headers
});

if (event.type === "run.completed") {
  await markDocumentReady(event.data.runId);
}`;

const capabilityCards = [
  {
    icon: WalletCards,
    title: "AI credit system",
    pain: "How do users or orgs get credits for AI features?",
    body: "Grant monthly credits, sell credit packs, add manual adjustments, and deduct credits when features run.",
  },
  {
    icon: CircleDollarSign,
    title: "Credit ledger",
    pain: "How do you avoid charging twice when jobs retry?",
    body: "Reserve credits before a run, commit on success, and void or refund when jobs fail.",
  },
  {
    icon: Clock3,
    title: "Hosted AI runs",
    pain: "What happens after the request ends?",
    body: "Queue and run model jobs, return a run_id, and expose queued, running, completed, failed, and cancelled states.",
  },
  {
    icon: LockKeyhole,
    title: "Usage limits",
    pain: "Can this user run this AI feature right now?",
    body: "Set limits by user, team, org, feature, plan, or time period before expensive model calls happen.",
  },
  {
    icon: BellRing,
    title: "Retries and webhooks",
    pain: "How does the app know when AI work finishes or fails?",
    body: "Retry temporary provider errors, cancel jobs, and send signed completion, failure, and alert events.",
  },
  {
    icon: Webhook,
    title: "Stripe billing sync",
    pain: "How do payments become usable AI credits?",
    body: "Connect subscriptions to credit grants, issue monthly credits on paid invoices, and support credit packs.",
  },
  {
    icon: Database,
    title: "Usage dashboard",
    pain: "Which customers, features, and models are driving usage?",
    body: "View balances, runs, failed jobs, usage, model cost estimates, Stripe sync status, and webhook replays.",
  },
  {
    icon: KeyRound,
    title: "Provider key management",
    pain: "How do teams keep control of model providers?",
    body: "Customers bring encrypted OpenAI or Anthropic keys and still pay providers directly.",
  },
];

type SignupState = {
  email: string;
  provider: string;
  techStack: string;
};

const initialSignup: SignupState = {
  email: "",
  provider: "",
  techStack: "",
};

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CapabilityPreview />
        <HowItWorks />
        <NotAWrapper />
        <SDKPreview />
      </main>
    </>
  );
}

function Header() {
  return (
    <header className="site-header">
      <nav className="site-shell nav-bar" aria-label="Primary navigation">
        <a className="brand-row nav-brand" href="#" aria-label="Meterlane home">
          <img className="brand-logo" src={meterlaneLogo} alt="" />
          <span>Meterlane</span>
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#sdk">SDK</a>
          <a href="#waitlist">Waitlist</a>
        </div>
        <a className="nav-cta" href="#waitlist">Join waitlist &gt;</a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero section" id="waitlist">
      <div className="site-shell hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Meterlane</p>
          <h1>Backend for AI features</h1>
          <p className="hero-subheadline">
            Hosted AI runs, credit ledgers, usage limits, webhooks, provider key
            management, and Stripe billing sync for apps built on OpenAI,
            Anthropic, and other model providers.
          </p>
          <WaitlistSignup />
          <div className="hero-proof">
            <span>Hosted runs</span>
            <span>Credit ledgers</span>
            <span>Stripe sync</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CapabilityPreview() {
  return (
    <section className="section" id="features">
      <div className="site-shell">
        <SectionHeader
          eyebrow="What it handles"
          title="The backend around your AI features."
          body="Model APIs generate outputs. Meterlane handles the credits, limits, runs, billing sync, webhooks, and provider keys around those AI features."
        />
        <div className="capability-grid">
          {capabilityCards.map(({ icon: Icon, title, pain, body }) => (
            <article className="capability-card" key={title}>
              <span className="icon-box"><Icon size={20} /></span>
              <h3>{title}</h3>
              <p className="pain-line">{pain}</p>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["Check credits and limits", "Confirm the customer can run this feature before expensive inference starts."],
    ["Reserve credits and create a run", "Store the request, customer, feature, model, and idempotency key."],
    ["Execute the model job", "Use the customer's encrypted OpenAI or Anthropic key, then retry temporary failures."],
    ["Commit usage and notify your app", "Commit or void credits, update status, sync billing state, and send signed webhooks."],
  ];

  return (
    <section className="section section-band">
      <div className="site-shell">
        <SectionHeader
          eyebrow="Flow"
          title="One run lifecycle for every AI feature."
          body="Meterlane turns a model call into a durable product workflow with credit reservations, limits, retries, billing sync, status, and webhooks."
        />
        <div className="steps">
          {steps.map(([title, body], index) => (
            <article className="step-card" key={title}>
              <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function NotAWrapper() {
  return (
    <section className="section section-band">
      <div className="site-shell comparison">
        <div>
          <p className="eyebrow">Not a model wrapper</p>
          <h2>Meterlane is the backend around your AI features.</h2>
          <p>
            OpenAI and Claude handle inference. Meterlane handles the product
            backend around that inference: credits, ledgers, run records, status,
            retries, limits, billing sync, webhooks, and provider keys. You still
            choose the provider, model, prompt, and product experience.
          </p>
        </div>
        <div className="comparison-grid" aria-label="OpenAI and Claude compared with Meterlane">
          <ComparisonCard
            icon={<Braces size={22} />}
            title="Model providers"
            items={["Inference APIs", "Model selection", "Token billing", "Provider dashboards"]}
          />
          <ComparisonCard
            icon={<Database size={22} />}
            title="Meterlane"
            items={["Credit ledgers", "Hosted run lifecycle", "Limits and retries", "Stripe sync and webhooks"]}
          />
        </div>
      </div>
    </section>
  );
}

function SDKPreview() {
  return (
    <section className="section" id="sdk">
      <div className="site-shell">
        <SectionHeader
          eyebrow="SDK preview"
          title="Small API surface for AI feature backends."
          body="The SDK preview is illustrative for validation, but the intended shape is direct: create runs, check credits and limits, and verify webhooks."
        />
        <div className="sdk-grid">
          <CodePanel title="Create a run" language="TypeScript" code={createRunCode} compact />
          <CodePanel title="Check feature access" language="TypeScript" code={accessCode} compact />
          <CodePanel title="Verify a webhook" language="TypeScript" code={webhookCode} compact />
        </div>
      </div>
    </section>
  );
}

function WaitlistSignup() {
  const [form, setForm] = useState<SignupState>(initialSignup);
  const [errors, setErrors] = useState<Partial<Record<keyof SignupState, string>>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: keyof SignupState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSubmitError("");
  }

  function validate() {
    const nextErrors: Partial<Record<keyof SignupState, string>> = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("waitlist_submissions").insert({
      email: form.email.trim(),
      provider: form.provider || null,
      tech_stack: form.techStack.trim() || null,
      source: "meterlane-phase-0-waitlist",
    });

    setIsSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        setSubmitError("That email is already on the waitlist.");
        return;
      }

      setSubmitError(error.message || "Something went wrong. Please try again.");
      console.error("Meterlane waitlist submission failed", error);
      return;
    }

    setSubmitted(true);
  }

  return (
    <div className="waitlist-card">
      <div className="form-shell">
          {submitted ? (
            <div className="success-state" role="status">
              <CheckCircle2 size={36} />
              <h3>Request received.</h3>
              <p>
                Thanks. Your waitlist request has been saved.
              </p>
              <button className="button secondary" type="button" onClick={() => { setSubmitted(false); setForm(initialSignup); }}>
                Submit another response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="inline-waitlist">
                <TextField label="Email" type="email" value={form.email} error={errors.email} onChange={(value) => updateField("email", value)} />
                <button className="button primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Joining..." : "Join waitlist"}
                </button>
              </div>
              <details className="optional-fields">
                <summary>Add stack details</summary>
                <SelectField
                  label="AI provider optional"
                  value={form.provider}
                  error={errors.provider}
                  onChange={(value) => updateField("provider", value)}
                  options={["OpenAI", "Anthropic", "Google", "Other"]}
                />
                <TextField
                  label="Tech stack optional"
                  value={form.techStack}
                  error={errors.techStack}
                  onChange={(value) => updateField("techStack", value)}
                  placeholder="Next.js, Rails, Stripe, OpenAI..."
                />
              </details>
              {submitError ? <p className="form-error" role="alert">{submitError}</p> : null}
            </form>
          )}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="section-header">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

function CodePanel({ title, language, code, compact = false }: { title: string; language: string; code: string; compact?: boolean }) {
  return (
    <figure className={`code-panel${compact ? " compact" : ""}`}>
      <figcaption>
        <span className="window-controls" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span>{title}</span>
        <span>{language}</span>
      </figcaption>
      <pre><code>{code}</code></pre>
    </figure>
  );
}

function ComparisonCard({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return (
    <article className="comparison-card">
      <span className="icon-box">{icon}</span>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <small id={`${id}-error`}>{error}</small> : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  error,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  options: string[];
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select one</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      {error ? <small id={`${id}-error`}>{error}</small> : null}
    </label>
  );
}

export default App;
