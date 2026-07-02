import { collection, getDocs, updateDoc, doc, Timestamp, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { Order } from "@/types/database";

/**
 * Fetch all orders from Firestore sorted by creation date descending.
 * Converts Timestamp objects to plain ISO strings for React Server Component serialization.
 */
export async function getAllOrders(): Promise<Order[]> {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const list: Order[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      const createdStr = data.createdAt?.toDate 
        ? data.createdAt.toDate().toISOString() 
        : (typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString());

      const updatedStr = data.updatedAt?.toDate 
        ? data.updatedAt.toDate().toISOString() 
        : (typeof data.updatedAt === "string" ? data.updatedAt : new Date().toISOString());

      list.push({
        id: data.id,
        userId: data.userId,
        items: data.items || [],
        subtotal: data.subtotal,
        tax: data.tax,
        shippingFee: data.shippingFee,
        total: data.total,
        status: data.status,
        shippingAddress: data.shippingAddress,
        paymentDetails: data.paymentDetails,
        createdAt: createdStr as any,
        updatedAt: updatedStr as any,
      });
    });
    return list;
  } catch (error) {
    console.error("Error fetching orders from Firestore:", error);
    return [];
  }
}

/**
 * Update the status of a specific order in Firestore.
 */
export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<boolean> {
  try {
    const orderDocRef = doc(db, "orders", orderId);
    await updateDoc(orderDocRef, {
      status,
      updatedAt: Timestamp.now()
    });
    console.log(`Order ${orderId} status updated to ${status}`);
    return true;
  } catch (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    return false;
  }
}
