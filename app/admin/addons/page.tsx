import { getAllAddOns } from "@/lib/addons";
import AddOnsClient from "./AddOnsClient";

export const dynamic = "force-dynamic";

export default async function AdminAddOnsPage() {
  const addons = await getAllAddOns();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2A1E17] tracking-tight">Optional Add-Ons Manager</h1>
        <p className="mt-1 text-sm text-[#2A1E17]/70">
          Manage extra modifiers and add-ons offered to customers (e.g. eggless base, ribbon gift wrapping, greeting cards) and update their prices.
        </p>
      </div>

      <AddOnsClient initialAddOns={addons} />
    </div>
  );
}
