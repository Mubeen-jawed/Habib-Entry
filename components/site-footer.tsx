import Link from "next/link";
import { Container } from "@/components/ui/container";
import { BrandMark } from "@/components/brand-mark";
import { Squiggle } from "@/components/ui/scribble";

const COLS = [
  {
    title: "Practice",
    links: [
      { href: "/schools/dsse", label: "DSSE" },
      { href: "/schools/ahss", label: "AHSS" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/essay", label: "Essay writer" },
      { href: "/interview", label: "Mock interview" },
      { href: "/grades", label: "Scholarships" },
      { href: "/eca", label: "ECA help" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create account" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 relative">
      <Squiggle
        color="rgba(10,10,10,0.20)"
        className="absolute -top-1 left-0 right-0"
      />
      <div className="pt-10 bg-card border-t border-border/60">
      <Container size="lg" className="py-10">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <BrandMark size="sm" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Focused prep for the Habib University entrance exam, practice, mock
              tests, and essay guidance.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                {col.title}
              </div>
              <ul className="space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-foreground/80 hover:text-brand-strong transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-border/70 flex flex-col md:flex-row gap-2 md:items-center md:justify-between text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} HabibEntry. Independent prep site, not
            affiliated with Habib University.
          </p>
        </div>
      </Container>
      </div>
    </footer>
  );
}
