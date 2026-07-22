import "../lib/load-env";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

async function test() {
  try {
    const docRef = doc(db, "products", "prod-19");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", JSON.stringify(docSnap.data(), null, 2));
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
