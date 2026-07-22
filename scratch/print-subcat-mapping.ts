import "../lib/load-env";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

async function run() {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    console.log("Products in Firestore:");
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      console.log(`ID: ${data.id} | Name: ${data.name} | Category: ${data.category} | Subcategory: ${data.subcategory}`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
