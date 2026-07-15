export function SiteFooter() {
  return (
    <footer className="border-t mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} HabibEntry. Independent prep site — not affiliated with Habib University.</p>
        <p>Made for aspiring Habibians.</p>
      </div>
    </footer>
  );
}
