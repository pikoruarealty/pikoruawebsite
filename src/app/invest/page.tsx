import type { Metadata } from "next";
import { ContentClusterIndex } from "@/components/seo/ContentClusterIndex";
import { getContentHubsByPrefix } from "@/lib/data/content-hubs";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Ahmedabad Property Investment and Budget Guides",
  description: "Budget-led Ahmedabad luxury property guides with location trade-offs, acquisition risks and current shortlist pathways.",
  path: "/invest",
});

export default function InvestIndexPage() {
  return (
    <ContentClusterIndex
      title="Investment and Budget Guides"
      eyebrow="Define the Acquisition"
      description="Budget bands and investment decisions translated into realistic Ahmedabad property formats, corridors and rejection criteria."
      pages={getContentHubsByPrefix("invest")}
      tools={[
        {
          href: "/invest/rental-yield-calculator-ahmedabad",
          title: "Rental Yield Calculator",
          description: "Gross and net rental yield from your own price, rent, maintenance, tax, vacancy and buying costs.",
        },
      ]}
    />
  );
}
