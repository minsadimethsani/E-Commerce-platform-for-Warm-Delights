import { getAllReels } from "@/lib/reels";
import ReelsClient from "./ReelsClient";

export const dynamic = "force-dynamic";

export default async function AdminReelsPage() {
  const reels = await getAllReels();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#A47251] tracking-tight">Reels Video Manager</h1>
        <p className="mt-1 text-sm text-[#A47251]/70">
          Upload and manage vertical reel videos shown on the storefront homepage hero slider. Uploaded videos are auto-compressed to optimize loading speed.
        </p>
      </div>

      <ReelsClient initialReels={reels} />
    </div>
  );
}
