"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookMarked,
  ClipboardList,
  Download,
  GraduationCap,
  Lightbulb,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  PromptsGuideBody,
  RubricGuideContent,
  TipsGuideContent,
  downloadPromptsPdf,
  downloadRubricPdf,
  downloadTipsPdf,
} from "@/app/essay/guides";
import { ESSAY_PROMPTS } from "@/app/essay/prompts";
import { downloadScholarshipsPdf } from "@/app/grades/download";
import { ScholarshipList } from "@/app/grades/ScholarshipList";

type Guide = "tips" | "rubric" | "prompts" | "scholarships";

const GUIDES: Array<{
  key: Guide;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: "tips",
    title: "Essay tips",
    description:
      "A five-paragraph outline you can use as a scaffold for any prompt.",
    icon: Lightbulb,
  },
  {
    key: "rubric",
    title: "Essay grading",
    description:
      "SAT-style rubric covering thesis, organization, structure, language, mechanics, and support.",
    icon: ClipboardList,
  },
  {
    key: "prompts",
    title: "Essay topics",
    description: `Prompt bank of ${ESSAY_PROMPTS.length} essay questions with a printable PDF option.`,
    icon: BookMarked,
  },
];

export function ResourcesRunner() {
  const [openGuide, setOpenGuide] = useState<Guide | null>(null);
  const tipsRef = useRef<HTMLDialogElement | null>(null);
  const rubricRef = useRef<HTMLDialogElement | null>(null);
  const promptsRef = useRef<HTMLDialogElement | null>(null);
  const scholarshipsRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const map: Record<Guide, HTMLDialogElement | null> = {
      tips: tipsRef.current,
      rubric: rubricRef.current,
      prompts: promptsRef.current,
      scholarships: scholarshipsRef.current,
    };
    for (const [k, dlg] of Object.entries(map)) {
      if (!dlg) continue;
      const shouldBeOpen = openGuide === k;
      if (shouldBeOpen && !dlg.open) dlg.showModal();
      if (!shouldBeOpen && dlg.open) dlg.close();
    }
  }, [openGuide]);

  const close = () => setOpenGuide(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {GUIDES.map(({ key, title, description, icon: Icon }) => (
          <ResourceCard
            key={key}
            title={title}
            description={description}
            icon={Icon}
            onOpen={() => setOpenGuide(key)}
          />
        ))}
        <ResourceCard
          title="Scholarships"
          description="Habib University merit- and need-based scholarship programs with grade requirements for national and international boards."
          icon={GraduationCap}
          onOpen={() => setOpenGuide("scholarships")}
        />
      </div>

      <dialog
        ref={tipsRef}
        onClose={close}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="m-auto w-[calc(100%-1.5rem)] max-w-lg rounded-lg p-0 backdrop:bg-foreground/40"
      >
        <div className="flex flex-col max-h-[85vh]">
          <div className="flex items-start justify-between gap-4 border-b p-5">
            <div className="min-w-0 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-brand" />
              <div className="text-base font-medium">Essay structure tip</div>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto p-5 text-sm">
            <TipsGuideContent />
          </div>
          <DialogDownloadFooter
            onClick={downloadTipsPdf}
            label="Download essay tips as PDF"
          />
        </div>
      </dialog>

      <dialog
        ref={rubricRef}
        onClose={close}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="m-auto w-[calc(100%-1.5rem)] max-w-3xl rounded-lg p-0 backdrop:bg-foreground/40"
      >
        <div className="flex flex-col max-h-[85vh]">
          <div className="flex items-start justify-between gap-4 border-b p-5">
            <div className="min-w-0 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-brand" />
              <div className="text-base font-medium">
                SAT-style scoring rubric
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-auto p-5 text-sm">
            <RubricGuideContent />
          </div>
          <DialogDownloadFooter
            onClick={downloadRubricPdf}
            label="Download essay grading rubric as PDF"
          />
        </div>
      </dialog>

      <dialog
        ref={promptsRef}
        onClose={close}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="m-auto w-[calc(100%-1.5rem)] max-w-2xl rounded-lg p-0 backdrop:bg-foreground/40"
      >
        <div className="flex flex-col max-h-[85vh]">
          <div className="flex items-start justify-between gap-4 border-b p-5">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Prompt bank
              </div>
              <div className="mt-1 text-base font-medium leading-snug">
                All essay prompts
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {ESSAY_PROMPTS.length} prompts that may appear on the test.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto p-5">
            <PromptsGuideBody />
          </div>
          <DialogDownloadFooter
            onClick={downloadPromptsPdf}
            label="Download essay prompts as PDF"
          />
        </div>
      </dialog>

      <dialog
        ref={scholarshipsRef}
        onClose={close}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="m-auto w-[calc(100%-1.5rem)] max-w-3xl rounded-lg p-0 backdrop:bg-foreground/40"
      >
        <div className="flex flex-col max-h-[85vh]">
          <div className="flex items-start justify-between gap-4 border-b p-5">
            <div className="min-w-0 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-brand" />
              <div className="text-base font-medium">Scholarships</div>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto p-5">
            <ScholarshipList />
          </div>
          <DialogDownloadFooter
            onClick={downloadScholarshipsPdf}
            label="Download scholarships as PDF"
          />
        </div>
      </dialog>
    </>
  );
}

function DownloadIconButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-brand-soft hover:text-brand-ink transition-colors"
    >
      <Download className="w-4 h-4" />
    </button>
  );
}

function ResourceCard({
  title,
  description,
  icon: Icon,
  onOpen,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onOpen: () => void;
}) {
  const commonClass =
    "flex flex-col cursor-pointer transition-colors hover:border-brand/40 hover:bg-brand-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(commonClass)}
    >
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="w-4 h-4 text-brand" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function DialogDownloadFooter({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-end border-t p-4">
      <DownloadIconButton onClick={onClick} label={label} />
    </div>
  );
}
