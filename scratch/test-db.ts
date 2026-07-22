import "../lib/load-env";

async function test() {
  try {
    console.log("Fetching first page of menu...");
    const res = await fetch("http://localhost:3000/api/products?category=All&sortBy=featured&page=1&limit=8");
    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }
    const data = await res.json();
    console.log(`Total count reported: ${data.total}`);
    console.log(`Total pages: ${data.totalPages}`);
    const products = data.products || [];
    console.log(`Fetched ${products.length} products on first page:`);
    products.forEach((p: any) => {
      console.log(`ID: ${p.id} | Name: ${p.name} | Category: ${p.category} | isAvailable: ${p.isAvailable} | Badge: ${p.badge}`);
    });
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

test();




