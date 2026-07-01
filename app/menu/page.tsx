import type { Metadata } from "next";
import MenuClient from "./MenuClient";

export const metadata: Metadata = {
  title: "Menu | Warm Delights Artisanal Bakery",
  description:
    "Explore our complete menu of handcrafted signature cakes, freshly baked quiches, artisanal pastries, homemade cookies, and custom creations.",
};

export default function MenuPage() {
  return <MenuClient />;
}
