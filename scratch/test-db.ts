import "../lib/load-env";
import { getAllProducts } from "../lib/products";

async function test() {
  try {
    console.log("Fetching products...");
    const products = await getAllProducts();
    console.log(`Success! Fetched ${products.length} products.`);
    if (products.length > 0) {
      console.log("First product sample:", {
        id: products[0].id,
        name: products[0].name,
        createdAt: products[0].createdAt
      });
    }
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

test();
