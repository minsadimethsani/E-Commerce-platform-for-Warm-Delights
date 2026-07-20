import type { Metadata } from "next";
import { Suspense } from "react";
import GiftsAndHampersClient from "./GiftsAndHampersClient";
import Loading from "./loading";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Gifts & Hampers | Warm Delights Artisanal Bakery",
  description:
    "Discover beautifully curated gift hampers, signature cookie sets, and artisanal sweet boxes perfect for corporate gifting, birthdays, and celebrations.",
};

export default function GiftsAndHampersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <GiftsAndHampersClient />
    </Suspense>
  );
}
