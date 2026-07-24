import { ComingSoon } from "@/components/coming-soon";
import { RELATED_SLUGS } from "@/components/related-prep-topics";

export const metadata = {
  title: "Habib ECA form guide, activities, roles & impact | Imtehan",
  description:
    "A guided walkthrough for the Habib University extra-curricular form: field-by-field guidance, examples of strong activity descriptions, and templates for sports, service, arts, and academic clubs.",
  alternates: { canonical: "/eca" },
};

export default function EcaPage() {
  return (
    <ComingSoon
      title="Fill your Habib ECA form for maximum impact"
      tagline="A guided walkthrough for the Habib extra-curricular form, activities, roles, hours, and how to describe impact."
      bullets={[
        "Field-by-field guidance for the Habib ECA form.",
        "Examples of strong activity descriptions vs. weak ones.",
        "How to quantify results and describe leadership.",
        "Templates for sports, service, arts, and academic clubs.",
      ]}
      relatedSlugs={[...RELATED_SLUGS.metaCurricular]}
      relatedEyebrow="Also on Imtehan"
      relatedEyebrowTone="mint"
      relatedTitle="Habib entrance test preparation, end to end"
    />
  );
}
