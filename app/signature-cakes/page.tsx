import type { Metadata } from "next";
import { Suspense } from "react";
import SignatureCakesClient from "./SignatureCakesClient";
import Loading from "./loading";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Signature Cakes | Warm Delights Artisanal Bakery",
  description:
    "Explore our complete range of handcrafted signature cakes, from decadent chocolate fudge to light strawberry gateaux, made with organic ingredients.",
};

export default function SignatureCakesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SignatureCakesClient />
    </Suspense>
  );
}
