import {
  BellRing,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  WalletCards,
} from "lucide-react";
import { FormEvent, useState } from "react";
import meterlaneLogo from "../assets/meterlane.png";
import { supabase } from "./lib/supabase";

const miniSdkCode = `await meterlane.runs.create({
  customerId: user.id,
  feature: "document_summary",
  creditCost: 5,
  billing: "stripe",
  webhook: "/api/meterlane"
});`;

const capabilityCards = [
  {
    icon: WalletCards,
    title: "Credits and ledgers",
    pain: "AI users should not cost more than they pay.",
    body: "Grant monthly credits, sell credit packs, reserve before runs, commit on success, and void failed jobs.",
  },
  {
    icon: Clock3,
    title: "Hosted runs and retries",
    pain: "Long model jobs need durable status.",
    body: "Queue AI work, return a run_id, track status, retry temporary failures, and avoid double-charging.",
  },
  {
    icon: BellRing,
    title: "Limits and webhooks",
    pain: "Block abuse before the provider call starts.",
    body: "Set limits by customer, plan, feature, or period, then send signed completion and low-credit events.",
  },
  {
    icon: CircleDollarSign,
    title: "Stripe and provider keys",
    pain: "Payments need to become usable AI capacity.",
    body: "Sync Stripe subscriptions and credit packs while customers bring encrypted OpenAI or Anthropic keys.",
  },
];

const painQuotes = [
  {
    quote: "one of my AI features wasn't working",
    context: "OpenAI credits expired and a customer noticed the product failure first.",
    source: "Reddit / r/SaaS",
    href: "https://www.reddit.com/r/SaaS/comments/1l2jxmj",
  },
  {
    quote: "usage limits weren't tracked",
    context: "A founder validating pain around surprise API bills and downtime.",
    source: "Reddit / r/SaaS",
    href: "https://www.reddit.com/r/SaaS/comments/1qlof61/anyone_here_burned_by_surprise_api_overages/",
  },
  {
    quote: "it feels like reinventing the wheel",
    context: "A SaaS builder asking how others handle credits, tiers, and Stripe status.",
    source: "Reddit / r/SaaS",
    href: "https://www.reddit.com/r/SaaS/comments/1f932ml",
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
        <PainQuotes />
        <CapabilityPreview />
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
          <a href="#proof">Proof</a>
          <a href="#features">Features</a>
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
      <img className="hero-watermark" src={meterlaneLogo} alt="" aria-hidden="true" />
      <div className="site-shell hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Meterlane</p>
          <h1>Backend for AI features</h1>
          <p className="hero-kicker">Stop rebuilding the backend around every AI feature.</p>
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

function PainQuotes() {
  return (
    <section className="section pain-section" id="proof" aria-labelledby="pain-title">
      <div className="site-shell">
        <div className="pain-header">
          <p className="eyebrow">Market signal</p>
          <h2 id="pain-title">The pain is already public.</h2>
          <p>
            Builders are duct-taping credits, usage limits, provider failures,
            and Stripe state together before they can ship AI features safely.
          </p>
        </div>
        <div className="quote-grid">
          {painQuotes.map((item) => (
            <a className="quote-card" href={item.href} target="_blank" rel="noreferrer" key={item.quote}>
              <span className="quote-source">{item.source}</span>
              <blockquote>“{item.quote}”</blockquote>
              <p>{item.context}</p>
            </a>
          ))}
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
          title="The backend layer paid AI features need."
          body="Meterlane sits around your model calls: credits, limits, durable runs, billing sync, webhooks, and customer provider keys."
        />
        <div className="feature-preview">
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
          <div className="mini-sdk">
            <CodePanel title="Create a metered run" language="TypeScript" code={miniSdkCode} compact />
          </div>
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
