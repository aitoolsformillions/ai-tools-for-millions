import { recordMemberOutcome } from "@/app/(app)/outcomes/actions";

type RecordOutcomeFormProps = {
  sourceType:
    | "opportunity"
    | "learning_path"
    | "stack"
    | "tool";
  sourceId: string;
  sourceSlug: string;
};

export function RecordOutcomeForm({
  sourceType,
  sourceId,
  sourceSlug,
}: RecordOutcomeFormProps) {
  return (
    <form
      action={recordMemberOutcome}
      style={{
        display: "grid",
        gap: 14,
      }}
    >
      <input
        type="hidden"
        name="sourceType"
        value={sourceType}
      />

      <input
        type="hidden"
        name="sourceId"
        value={sourceId}
      />

      <input
        type="hidden"
        name="sourceSlug"
        value={sourceSlug}
      />

      <div>
        <label
          htmlFor="outcomeType"
          style={{
            display: "block",
            marginBottom: 6,
            color: "#dbeafe",
            fontWeight: 700,
          }}
        >
          What result did you get?
        </label>

        <select
          id="outcomeType"
          name="outcomeType"
          required
          style={fieldStyle}
        >
          <option value="money_earned">
            Money earned
          </option>

          <option value="time_saved">
            Time saved
          </option>

          <option value="leads_generated">
            Leads generated
          </option>

          <option value="tasks_automated">
            Tasks automated
          </option>

          <option value="skill_gained">
            Skill gained
          </option>

          <option value="other">
            Other
          </option>
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <div>
          <label
            htmlFor="numericValue"
            style={labelStyle}
          >
            Value
          </label>

          <input
            id="numericValue"
            name="numericValue"
            type="number"
            step="0.01"
            min="0"
            placeholder="Example: 250"
            style={fieldStyle}
          />
        </div>

        <div>
          <label
            htmlFor="unit"
            style={labelStyle}
          >
            Unit
          </label>

          <input
            id="unit"
            name="unit"
            type="text"
            placeholder="USD, hours, leads..."
            style={fieldStyle}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="summary"
          style={labelStyle}
        >
          Result summary
        </label>

        <input
          id="summary"
          name="summary"
          type="text"
          required
          maxLength={200}
          placeholder="Example: Booked 3 additional appointments"
          style={fieldStyle}
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          style={labelStyle}
        >
          Notes
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="What worked? What would you change next time?"
          style={{
            ...fieldStyle,
            resize: "vertical",
          }}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        style={{
          justifySelf: "start",
        }}
      >
        Record Outcome
      </button>
    </form>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: 6,
  color: "#dbeafe",
  fontWeight: 700,
};

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border:
    "1px solid rgba(255,255,255,0.12)",
  background: "#0f172a",
  color: "#ffffff",
  fontSize: 15,
};