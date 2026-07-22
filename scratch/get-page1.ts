import "../lib/load-env";

async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/products?category=All&sortBy=featured&page=1&limit=6");
    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }
    const data = await res.json();
    console.log("Total products on server:", data.total);
    console.log("Total pages:", data.totalPages);
    console.log("Fetched products count:", data.products.length);
    data.products.forEach((p: any) => {
      console.log(`ID: ${p.id} | Name: ${p.name} | Category: ${p.category} | isAvailable: ${p.isAvailable} | Badge: ${p.badge}`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
