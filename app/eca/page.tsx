import { ComingSoon } from "@/components/coming-soon";

export const metadata = { title: "ECA form guide, HabibEntry" };

export default function EcaPage() {
  return (
    <ComingSoon
      title="Fill your ECA form for maximum impact"
      tagline="A guided walkthrough for the Habib extra-curricular form, activities, roles, hours, and how to describe impact."
      bullets={[
        "Field-by-field guidance for the Habib ECA form.",
        "Examples of strong activity descriptions vs. weak ones.",
        "How to quantify results and describe leadership.",
        "Templates for sports, service, arts, and academic clubs.",
      ]}
    />
  );
}
