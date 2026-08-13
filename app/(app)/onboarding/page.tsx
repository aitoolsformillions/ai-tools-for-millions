import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveMemberPreferences } from "./actions";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: preferences } = await supabase
    .from("member_preferences")
    .select(`
      primary_goal,
      experience_level,
      business_interest,
      weekly_time,
      monthly_budget,
      onboarding_complete
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <section>
      <div style={{ marginBottom: 34 }}>
        <p
          style={{
            margin: 0,
            color: "#60a5fa",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Personalize AITFM
        </p>

        <h1
          style={{
            margin: "10px 0 0",
            fontSize: "clamp(40px, 7vw, 64px)",
            letterSpacing: "-.05em",
            lineHeight: 1.05,
          }}
        >
          Tell us what you want AI to help you accomplish.
        </h1>

        <p
          style={{
            margin: "16px 0 0",
            maxWidth: 820,
            color: "var(--muted)",
            fontSize: 18,
            lineHeight: 1.75,
          }}
        >
          Your answers help AI Tools for Millions prioritize
          opportunities, workflows, tools, and learning paths
          that better match your goals.
        </p>
      </div>

      <form
        action={saveMemberPreferences}
        className="card"
        style={{
          maxWidth: 880,
          padding: "clamp(24px, 5vw, 38px)",
        }}
      >
        <PreferenceSection
          number="01"
          title="What is your primary goal?"
          description="Choose the result you most want AITFM to help you achieve."
        >
          <RadioOption
            name="primaryGoal"
            value="Make Money"
            title="Make Money"
            description="Find practical AI-assisted services, businesses, products, and income opportunities."
            defaultChecked={
              preferences?.primary_goal ===
                "Make Money" ||
              !preferences?.primary_goal
            }
          />

          <RadioOption
            name="primaryGoal"
            value="Save Time"
            title="Save Time"
            description="Automate repetitive work and improve personal or business efficiency."
            defaultChecked={
              preferences?.primary_goal === "Save Time"
            }
          />

          <RadioOption
            name="primaryGoal"
            value="Learn AI"
            title="Learn AI"
            description="Build practical AI skills without unnecessary technical complexity."
            defaultChecked={
              preferences?.primary_goal === "Learn AI"
            }
          />

          <RadioOption
            name="primaryGoal"
            value="Find Market Gaps"
            title="Find Market Gaps"
            description="Discover underserved problems and opportunities where AI may create leverage."
            defaultChecked={
              preferences?.primary_goal ===
              "Find Market Gaps"
            }
          />
        </PreferenceSection>

        <PreferenceSection
          number="02"
          title="How experienced are you with AI?"
          description="This helps us determine how much explanation and complexity to recommend."
        >
          <RadioOption
            name="experienceLevel"
            value="Beginner"
            title="Beginner"
            description="I am still learning the tools and want clear guidance."
            defaultChecked={
              preferences?.experience_level ===
                "Beginner" ||
              !preferences?.experience_level
            }
          />

          <RadioOption
            name="experienceLevel"
            value="Intermediate"
            title="Intermediate"
            description="I already use some AI tools and want better systems and workflows."
            defaultChecked={
              preferences?.experience_level ===
              "Intermediate"
            }
          />

          <RadioOption
            name="experienceLevel"
            value="Advanced"
            title="Advanced"
            description="I am comfortable with AI and want deeper implementation opportunities."
            defaultChecked={
              preferences?.experience_level ===
              "Advanced"
            }
          />
        </PreferenceSection>

        <PreferenceSection
          number="03"
          title="Which area interests you most?"
          description="We'll use this as one signal for future opportunity and workflow recommendations."
        >
          <SelectField
            name="businessInterest"
            defaultValue={
              preferences?.business_interest ?? "Other"
            }
            options={[
              "Local Services",
              "Real Estate",
              "Content",
              "Ecommerce",
              "Consulting",
              "Professional Services",
              "Other",
            ]}
          />
        </PreferenceSection>

        <PreferenceSection
          number="04"
          title="How much time can you realistically invest each week?"
          description="AITFM can eventually prioritize opportunities that fit your available time."
        >
          <RadioOption
            name="weeklyTime"
            value="Under 2 hours"
            title="Under 2 hours"
            description="I need very lightweight opportunities and workflows."
            defaultChecked={
              preferences?.weekly_time ===
              "Under 2 hours"
            }
          />

          <RadioOption
            name="weeklyTime"
            value="2-5 hours"
            title="2–5 hours"
            description="I can consistently dedicate a few hours each week."
            defaultChecked={
              preferences?.weekly_time ===
                "2-5 hours" ||
              !preferences?.weekly_time
            }
          />

          <RadioOption
            name="weeklyTime"
            value="5+ hours"
            title="5+ hours"
            description="I can devote meaningful weekly time to building and implementation."
            defaultChecked={
              preferences?.weekly_time === "5+ hours"
            }
          />
        </PreferenceSection>

        <PreferenceSection
          number="05"
          title="What monthly AI budget are you comfortable with?"
          description="We'll use this to avoid recommending expensive tool stacks that don't fit your budget."
        >
          <RadioOption
            name="monthlyBudget"
            value="$0-$100"
            title="$0–$100"
            description="Prioritize free and low-cost tools."
            defaultChecked={
              preferences?.monthly_budget ===
                "$0-$100" ||
              !preferences?.monthly_budget
            }
          />

          <RadioOption
            name="monthlyBudget"
            value="$100-$500"
            title="$100–$500"
            description="I can invest in several useful paid tools when justified."
            defaultChecked={
              preferences?.monthly_budget ===
              "$100-$500"
            }
          />

          <RadioOption
            name="monthlyBudget"
            value="$500+"
            title="$500+"
            description="I am willing to invest more when the opportunity supports it."
            defaultChecked={
              preferences?.monthly_budget === "$500+"
            }
          />
        </PreferenceSection>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
            paddingTop: 28,
            borderTop:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {preferences?.onboarding_complete ? (
            <Link
              href="/dashboard"
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              ← Return to Dashboard
            </Link>
          ) : (
            <span
              style={{
                color: "var(--muted)",
                fontSize: 14,
              }}
            >
              You can change these preferences later.
            </span>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: "12px 20px",
              fontWeight: 800,
            }}
          >
            {preferences?.onboarding_complete
              ? "Update My Preferences"
              : "Personalize My Experience"}
          </button>
        </div>
      </form>
    </section>
  );
}

function PreferenceSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "28px 0",
        borderBottom:
          "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <p
          style={{
            margin: 0,
            color: "#60a5fa",
            fontSize: 11,
            fontWeight: 900,
          }}
        >
          {number}
        </p>

        <h2
          style={{
            margin: "6px 0 0",
            fontSize: 27,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: "8px 0 0",
            color: "var(--muted)",
            lineHeight: 1.65,
          }}
        >
          {description}
        </p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function RadioOption({
  name,
  value,
  title,
  description,
  defaultChecked,
}: {
  name: string;
  value: string;
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label
      style={{
        display: "grid",
        gridTemplateColumns: "24px 1fr",
        gap: 12,
        padding: 16,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.09)",
        background: "rgba(255,255,255,0.03)",
        cursor: "pointer",
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        required
        style={{
          width: 18,
          height: 18,
          marginTop: 3,
        }}
      />

      <span>
        <strong
          style={{
            display: "block",
            color: "#ffffff",
          }}
        >
          {title}
        </strong>

        <span
          style={{
            display: "block",
            marginTop: 4,
            color: "var(--muted)",
            lineHeight: 1.55,
            fontSize: 14,
          }}
        >
          {description}
        </span>
      </span>
    </label>
  );
}

function SelectField({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue: string;
  options: string[];
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      required
      style={{
        width: "100%",
        padding: "14px 16px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "#0f172a",
        color: "#ffffff",
        fontSize: 16,
      }}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}