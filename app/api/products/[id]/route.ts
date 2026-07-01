import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/products";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        { error: `Product with ID '${id}' was not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Error fetching single product from API:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred while querying product." },
      { status: 500 }
    );
  }
}
