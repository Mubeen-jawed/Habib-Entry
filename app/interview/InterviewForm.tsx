"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, CheckCircle2, Upload } from "lucide-react";

const FIELDS = [
  "Computer Science",
  "Computer Engineering",
  "Electrical Engineering",
  "Communication and Design",
  "Social Development and Policy",
  "Comparative Humanities",
] as const;

const APPLYING_FOR = ["HUTOPS", "HUEOP", "International Candidate"] as const;

const HELP_AREAS = [
  "Confidence",
  "Talking about myself",
  "Talking about my chosen degree",
  "Handling unexpected questions",
  "English speaking",
  "Structuring answers",
  "“Why Habib?”",
] as const;

type TestDateStatus =
  | "no-submitted"
  | "yes"
  | "given"
  | "other";

type InterviewDateStatus =
  | "no-not-given"
  | "no-given"
  | "yes";

type Prefill = {
  name: string;
  whatsapp: string;
  field: string;
  applicationId: string;
  gender: string;
  testMonth: string;
  interviewDate: string;
  interviewTime: string;
  desiredDate: string;
  preparation: string;
  questions: string;
  agree: boolean;
};

const EMPTY_PREFILL: Prefill = {
  name: "",
  whatsapp: "",
  field: "",
  applicationId: "",
  gender: "",
  testMonth: "",
  interviewDate: "",
  interviewTime: "",
  desiredDate: "",
  preparation: "",
  questions: "",
  agree: false,
};

const TEST_PREFILL: Prefill = {
  name: "Test Admin",
  whatsapp: "03001234567",
  field: "Computer Science",
  applicationId: "220000",
  gender: "Male",
  testMonth: "February",
  interviewDate: "2026-08-15",
  interviewTime: "14:30",
  desiredDate: "2026-08-20",
  preparation: "A Little",
  questions: "This is a test submission from an admin.",
  agree: true,
};

export function InterviewForm({
  alreadySubmitted = false,
  isAdmin = false,
  intro,
}: {
  alreadySubmitted?: boolean;
  isAdmin?: boolean;
  intro?: React.ReactNode;
}) {
  const [submitted, setSubmitted] = useState(alreadySubmitted);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [applyingFor, setApplyingFor] = useState<string>("HUTOPS");
  const [applyingForOther, setApplyingForOther] = useState("");
  const [testDateStatus, setTestDateStatus] = useState<TestDateStatus>("no-submitted");
  const [testDateOther, setTestDateOther] = useState("");
  const [interviewDateStatus, setInterviewDateStatus] =
    useState<InterviewDateStatus>("no-not-given");
  const [helpAreas, setHelpAreas] = useState<string[]>([]);
  const [helpOther, setHelpOther] = useState("");
  const [admitCardName, setAdmitCardName] = useState<string | null>(null);
  const [ecaName, setEcaName] = useState<string | null>(null);

  const [prefill, setPrefill] = useState<Prefill>(EMPTY_PREFILL);
  const [prefillTick, setPrefillTick] = useState(0);

  async function applyTestPrefill() {
    setPrefill(TEST_PREFILL);
    setApplyingFor("HUTOPS");
    setApplyingForOther("");
    setTestDateStatus("yes");
    setTestDateOther("");
    setInterviewDateStatus("yes");
    setHelpAreas(["Confidence", "Structuring answers"]);
    setHelpOther("");
    setAdmitCardName(null);
    setEcaName(null);
    setPrefillTick((t) => t + 1);

    // Wait for the DOM to remount after prefillTick bump, then attach the
    // demo PDFs to the actual <input type="file"> elements via DataTransfer.
    // Browsers block direct programmatic .value assignment on file inputs,
    // but .files can be replaced from a DataTransfer.files object.
    await new Promise((r) => setTimeout(r, 0));
    try {
      const attach = async (
        inputId: string,
        url: string,
        filename: string,
        setName: (n: string | null) => void,
      ) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load ${url}`);
        const blob = await res.blob();
        const file = new File([blob], filename, { type: "application/pdf" });
        const input = document.getElementById(inputId) as HTMLInputElement | null;
        if (!input) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        setName(file.name);
      };
      await Promise.all([
        attach("admitCard", "/demo/admit-card.pdf", "demo-admit-card.pdf", setAdmitCardName),
        attach("eca", "/demo/eca.pdf", "demo-eca.pdf", setEcaName),
      ]);
    } catch (err) {
      console.warn("[interview] could not attach demo files", err);
    }
  }

  function toggleHelp(area: string) {
    setHelpAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const data = new FormData(e.currentTarget);
      const res = await fetch("/api/interview", { method: "POST", body: data });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || json.ok === false) {
        throw new Error(json.error || "Submission failed. Please try again.");
      }
      setSubmitted(true);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <Check className="mx-auto w-16 h-16 text-brand mb-4" strokeWidth={2.5} />
        <h2 className="text-xl font-semibold">Submission received</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
          Thanks, we&apos;ll reach out on WhatsApp within 12 hours. Your mock interview will be
          scheduled after your HU test.
        </p>
        {isAdmin && (
          <Button
            type="button"
            variant="outline"
            className="mt-6"
            onClick={() => setSubmitted(false)}
          >
            Submit another response (admin)
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      {intro}
    <form onSubmit={onSubmit} className="space-y-8">
      {isAdmin && (
        <div className="rounded-md border border-dashed border-brand/40 bg-brand-soft/40 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Admin — prefills every field and attaches demo PDFs (admit card + ECA) for a quick end-to-end test.
          </div>
          <Button type="button" variant="outline" size="sm" onClick={applyTestPrefill}>
            Fill with test data
          </Button>
        </div>
      )}
      <div key={prefillTick} className="space-y-8">
      <Section title="Your details">
        <FieldRow label="Name" required htmlFor="name">
          <Input id="name" name="name" required autoComplete="name" defaultValue={prefill.name} />
        </FieldRow>

        <FieldRow label="WhatsApp Number" required htmlFor="whatsapp">
          <Input
            id="whatsapp"
            name="whatsapp"
            required
            inputMode="tel"
            placeholder="03XX XXXXXXX"
            defaultValue={prefill.whatsapp}
          />
        </FieldRow>

        <FieldRow label="Field" required htmlFor="field">
          <select
            id="field"
            name="field"
            required
            defaultValue={prefill.field}
            className={selectClass}
          >
            <option value="" disabled>
              Select your field
            </option>
            {FIELDS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </FieldRow>

        <FieldRow label="Habib's Application ID" required htmlFor="applicationId">
          <Input
            id="applicationId"
            name="applicationId"
            required
            placeholder="e.g. 22XXXX"
            defaultValue={prefill.applicationId}
          />
        </FieldRow>

        <FieldRow label="Your Gender (for assigning interviewer)" required>
          <RadioGroup name="gender" options={["Male", "Female"]} required defaultValue={prefill.gender} />
        </FieldRow>
      </Section>

      <Section title="Test & interview status">
        <FieldRow label="Appearing for the test in the month of" required>
          <RadioGroup
            name="testMonth"
            options={["February", "March"]}
            required
            defaultValue={prefill.testMonth}
          />
        </FieldRow>

        <FieldRow label="Applying for" required>
          <div className="space-y-2">
            {APPLYING_FOR.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="applyingFor"
                  value={opt}
                  checked={applyingFor === opt}
                  onChange={() => setApplyingFor(opt)}
                  required
                />
                {opt}
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="applyingFor"
                value="other"
                checked={applyingFor === "other"}
                onChange={() => setApplyingFor("other")}
              />
              Other:
              <Input
                name="applyingForOther"
                value={applyingForOther}
                onChange={(e) => setApplyingForOther(e.target.value)}
                onFocus={() => setApplyingFor("other")}
                className="h-8 max-w-xs"
              />
            </label>
          </div>
        </FieldRow>

        <FieldRow label="Have you received your official HU test date?" required>
          <div className="space-y-2">
            <RadioLine
              name="testDateStatus"
              value="no-submitted"
              checked={testDateStatus === "no-submitted"}
              onChange={() => setTestDateStatus("no-submitted")}
              label="No (But I have submitted the form and fees)"
              required
            />
            <RadioLine
              name="testDateStatus"
              value="yes"
              checked={testDateStatus === "yes"}
              onChange={() => setTestDateStatus("yes")}
              label="Yes"
            />
            <RadioLine
              name="testDateStatus"
              value="given"
              checked={testDateStatus === "given"}
              onChange={() => setTestDateStatus("given")}
              label="I have given the test"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="testDateStatus"
                value="other"
                checked={testDateStatus === "other"}
                onChange={() => setTestDateStatus("other")}
              />
              Other:
              <Input
                name="testDateOther"
                value={testDateOther}
                onChange={(e) => setTestDateOther(e.target.value)}
                onFocus={() => setTestDateStatus("other")}
                className="h-8 max-w-xs"
              />
            </label>
          </div>
        </FieldRow>

        <FieldRow label="Have you received your interview date?" required>
          <div className="space-y-2">
            <RadioLine
              name="interviewDateStatus"
              value="no-not-given"
              checked={interviewDateStatus === "no-not-given"}
              onChange={() => setInterviewDateStatus("no-not-given")}
              label="No (Not given the test)"
              required
            />
            <RadioLine
              name="interviewDateStatus"
              value="no-given"
              checked={interviewDateStatus === "no-given"}
              onChange={() => setInterviewDateStatus("no-given")}
              label="No (Already given the test)"
            />
            <RadioLine
              name="interviewDateStatus"
              value="yes"
              checked={interviewDateStatus === "yes"}
              onChange={() => setInterviewDateStatus("yes")}
              label="Yes"
            />
          </div>
        </FieldRow>

        {interviewDateStatus === "yes" && (
          <FieldRow label="If yes, your Habib interview date & time">
            <div className="flex gap-3 flex-wrap">
              <Input
                type="date"
                name="interviewDate"
                className="max-w-[10rem]"
                defaultValue={prefill.interviewDate}
              />
              <Input
                type="time"
                name="interviewTime"
                className="max-w-[8rem]"
                defaultValue={prefill.interviewTime}
              />
            </div>
          </FieldRow>
        )}

        <FieldRow label="When do you want to be interviewed? (Desired date)" htmlFor="desiredDate">
          <Input
            type="date"
            id="desiredDate"
            name="desiredDate"
            className="max-w-[10rem]"
            defaultValue={prefill.desiredDate}
          />
        </FieldRow>
      </Section>

      <Section title="Uploads">
        <FieldRow
          label="Screenshot of your HU admit card"
          required
          htmlFor="admitCard"
          hint="1 file, max 10 MB."
        >
          <FileInput
            id="admitCard"
            name="admitCard"
            required
            accept="image/*,.pdf"
            maxBytes={10 * 1024 * 1024}
            filename={admitCardName}
            onFile={(f) => setAdmitCardName(f?.name ?? null)}
          />
        </FieldRow>

        <FieldRow
          label="Your extracurriculars"
          required
          htmlFor="eca"
          hint="Questions will be asked from these. 1 file, max 25 MB."
        >
          <FileInput
            id="eca"
            name="eca"
            required
            accept=".pdf,.doc,.docx,image/*"
            maxBytes={25 * 1024 * 1024}
            filename={ecaName}
            onFile={(f) => setEcaName(f?.name ?? null)}
          />
        </FieldRow>
      </Section>

      <Section title="Preparation">
        <FieldRow label="Have you prepared for interviews before?" required>
          <RadioGroup
            name="preparation"
            options={["Yes", "A Little", "Not Yet"]}
            required
            defaultValue={prefill.preparation}
          />
        </FieldRow>

        <FieldRow label="What areas do you want help with?">
          <div className="grid gap-2 sm:grid-cols-2">
            {HELP_AREAS.map((area) => (
              <label key={area} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="helpAreas"
                  value={area}
                  checked={helpAreas.includes(area)}
                  onChange={() => toggleHelp(area)}
                />
                {area}
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={helpAreas.includes("__other")}
                onChange={() => toggleHelp("__other")}
              />
              Other:
              <Input
                name="helpOther"
                value={helpOther}
                onChange={(e) => setHelpOther(e.target.value)}
                onFocus={() => {
                  if (!helpAreas.includes("__other")) toggleHelp("__other");
                }}
                className="h-8 max-w-xs"
              />
            </label>
          </div>
        </FieldRow>

        <FieldRow label="Do you have any questions?" htmlFor="questions">
          <textarea
            id="questions"
            name="questions"
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            defaultValue={prefill.questions}
          />
        </FieldRow>
      </Section>

      <Section title="Please confirm">
        <ul className="text-sm text-muted-foreground space-y-2 mb-4 list-disc pl-5">
          <li>I will join 5 minutes early.</li>
          <li>My camera will remain ON.</li>
          <li>I understand mock interviews are after the HU test.</li>
          <li>I understand this is first-come, first-served.</li>
          <li>I will be respectful to my interviewer.</li>
          <li>I allow my details to be shared only with my interviewer.</li>
        </ul>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="agree" required defaultChecked={prefill.agree} />
          Yes, I agree <span className="text-destructive">*</span>
        </label>
      </Section>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="reset" variant="outline" disabled={pending}>
          Clear form
        </Button>
        <Button type="submit" variant="brand" disabled={pending}>
          {pending ? "Submitting…" : "Submit"}
        </Button>
      </div>
    </form>
    </>
  );
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-lg border p-6 space-y-5">
      <legend className="px-2 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

function FieldRow({
  label,
  required,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function RadioGroup({
  name,
  options,
  required,
  defaultValue,
}: {
  name: string;
  options: readonly string[];
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <label key={opt} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={name}
            value={opt}
            required={required && i === 0}
            defaultChecked={defaultValue === opt}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

function RadioLine({
  name,
  value,
  checked,
  onChange,
  label,
  required,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        required={required}
      />
      {label}
    </label>
  );
}

function FileInput({
  id,
  name,
  accept,
  required,
  maxBytes,
  filename,
  onFile,
}: {
  id: string;
  name: string;
  accept?: string;
  required?: boolean;
  maxBytes: number;
  filename: string | null;
  onFile: (f: File | null) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <label
        htmlFor={id}
        className="inline-flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm cursor-pointer hover:bg-muted/50"
      >
        <Upload className="w-4 h-4 text-muted-foreground" />
        {filename ?? "Choose file"}
      </label>
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (f && f.size > maxBytes) {
            setError(`File is larger than ${Math.round(maxBytes / (1024 * 1024))} MB.`);
            e.target.value = "";
            onFile(null);
            return;
          }
          setError(null);
          onFile(f);
        }}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
