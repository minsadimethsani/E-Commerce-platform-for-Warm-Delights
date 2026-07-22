import type { Metadata } from "next";
import { Suspense } from "react";
import MenuClient from "./MenuClient";
import MenuLoading from "./loading";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Menu | Warm Delights Artisanal Bakery",
  description:
    "Explore our complete menu of handcrafted signature cakes, freshly baked quiches, artisanal pastries, homemade cookies, and custom creations.",
};

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuLoading />}>
      <MenuClient />
    </Suspense>
  );
}
