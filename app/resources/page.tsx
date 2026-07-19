import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/back-button";
import { ResourcesRunner } from "./ResourcesRunner";

export const metadata = { title: "Resources, HabibEntry" };

export default function ResourcesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <BackButton className="mb-6" />
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold">Resources</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Guides and references to help you write stronger essays.
          </p>
        </div>
        <ResourcesRunner />
      </div>
    </AppShell>
  );
}
