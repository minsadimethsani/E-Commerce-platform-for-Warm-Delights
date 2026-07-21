import { NextRequest, NextResponse } from "next/server";
import { getFilteredProducts, FilterParams } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse parameters from query string
    const category = searchParams.get("category") || "All";
    const subcategory = searchParams.get("subcategory") || "";
    const search = searchParams.get("search") || "";
    
    const minPriceRaw = searchParams.get("minPrice");
    const minPrice = minPriceRaw ? parseFloat(minPriceRaw) : undefined;
    
    const maxPriceRaw = searchParams.get("maxPrice");
    const maxPrice = maxPriceRaw ? parseFloat(maxPriceRaw) : undefined;

    const minRatingRaw = searchParams.get("minRating");
    const minRating = minRatingRaw ? parseFloat(minRatingRaw) : undefined;

    const onlyBestsellers = searchParams.get("onlyBestsellers") === "true";
    const sortBy = (searchParams.get("sortBy") as FilterParams["sortBy"]) || "featured";
    
    const pageRaw = searchParams.get("page");
    const page = pageRaw ? parseInt(pageRaw, 10) : 1;

    const limitRaw = searchParams.get("limit");
    const limit = limitRaw ? parseInt(limitRaw, 10) : 8;

    // Query Data Access Layer
    const result = await getFilteredProducts({
      category,
      subcategory,
      search,
      minPrice,
      maxPrice,
      minRating,
      onlyBestsellers,
      sortBy,
      page,
      limit,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching products from API:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred while querying products." },
      { status: 500 }
    );
  }
}
