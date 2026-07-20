import type { Metadata } from "next";
import { Suspense } from "react";
import CustomCreationsClient from "./CustomCreationsClient";
import Loading from "./loading";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Custom Creations | Warm Delights Artisanal Bakery",
  description:
    "Design and order your dream cake for weddings, birthdays, and milestones. Choose sizes, flavors, icings, and upload a design reference.",
};

export default function CustomCreationsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CustomCreationsClient />
    </Suspense>
  );
}
