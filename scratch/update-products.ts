import "../lib/load-env";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

async function run() {
  try {
    // 1. Enable prod-19
    const prod19Ref = doc(db, "products", "prod-19");
    await updateDoc(prod19Ref, { isAvailable: true });
    console.log("prod-19 updated to isAvailable: true");

    // 2. Disable prod-27, prod-26, prod-25
    const disabledIds = ["prod-27", "prod-26", "prod-25"];
    for (const id of disabledIds) {
      const docRef = doc(db, "products", id);
      await updateDoc(docRef, { isAvailable: false });
      console.log(`${id} updated to isAvailable: false`);
    }

    console.log("Database updates completed successfully!");
  } catch (error) {
    console.error("Error updating database documents:", error);
  }
}

run();
