import "../lib/load-env";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

async function run() {
  try {
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);
    console.log("Categories in Firestore:");
    snapshot.forEach((docSnap) => {
      console.log(JSON.stringify(docSnap.data(), null, 2));
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
