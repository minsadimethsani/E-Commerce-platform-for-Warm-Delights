import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    const result: any[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      result.push({
        id: docSnap.id,
        name: data.name,
        category: data.category,
        isAvailableRaw: data.isAvailable,
        hasIsAvailableField: "isAvailable" in data,
      });
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
