"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types/database";
import { doc, updateDoc, Timestamp, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface OrdersTableProps {
  initialOrders: Order[];
}

const statusOptions: Order["status"][] = [
  "pending",
  "processing",
  "baked",
  "out-for-delivery",
  "delivered",
  "cancelled",
];

export default function OrdersTable({ initialOrders }: OrdersTableProps) {
  const { setIsMutating } = useAuth();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          userId: data.userId,
          items: data.items || [],
          subtotal: data.subtotal,
          tax: data.tax,
          shippingFee: data.shippingFee,
          total: data.total,
          status: data.status,
          shippingAddress: data.shippingAddress,
          paymentDetails: data.paymentDetails,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          billingDetails: data.billingDetails,
          fulfillment: data.fulfillment,
          orderNote: data.orderNote,
        } as Order);
      });
      setOrders(list);

      // Sync active selected order details
      if (selectedOrder) {
        const updated = list.find((o) => o.id === selectedOrder.id);
        if (updated) {
          setSelectedOrder(updated);
        }
      }
    }, (error) => {
      console.error("Firestore onSnapshot for orders failed:", error);
    });

    return () => unsubscribe();
  }, [selectedOrder]);

  // Update order status directly in Firestore
  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    setUpdatingId(orderId);
    setIsMutating(true);
    try {
      const docRef = doc(db, "orders", orderId);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      // If selected order is the one being updated, sync it
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (error) {
      console.error("Failed to update status in database:", error);
      alert("Error: Missing database permissions or network error.");
    } finally {
      setUpdatingId(null);
      setIsMutating(false);
    }
  };

  const getStatusBadgeClass = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-[#DCF0C3] text-[#2A1E17] border border-[#DCF0C3]";
      case "cancelled":
        return "bg-red-50 text-red-700 border border-red-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "processing":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      case "baked":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "out-for-delivery":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  if (selectedOrder) {
    const formattedDate = selectedOrder.createdAt
      ? new Date(selectedOrder.createdAt as any).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleDateString();

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#A47251]/10 pb-6">
          <div className="space-y-1.5">
            <button
              onClick={() => setSelectedOrder(null)}
              className="group flex items-center text-xs font-bold uppercase tracking-wider text-[#DD9E59] hover:text-[#2A1E17] transition-colors mb-2 cursor-pointer"
            >
              <span className="mr-1.5 transition-transform group-hover:-translate-x-1">&larr;</span> Back to Orders
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-serif text-2xl font-bold text-[#2A1E17]">
                Order #{selectedOrder.id}
              </h2>
              <span className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(selectedOrder.status)}`}>
                {selectedOrder.status}
              </span>
            </div>
            <p className="text-xs text-[#2A1E17]/60">
              Placed on {formattedDate}
            </p>
          </div>

          {/* Action (Update Status) */}
          <div className="flex items-center gap-3 bg-[#F0D8A1]/50 border border-[#A47251]/5 rounded-xl p-3.5 self-start sm:self-auto">
            <label className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Update Status:</label>
            <select
              value={selectedOrder.status}
              disabled={updatingId === selectedOrder.id}
              onChange={(e) =>
                handleStatusChange(selectedOrder.id, e.target.value as Order["status"])
              }
              className="bg-white border border-[#A47251]/10 rounded-lg py-1.5 pl-3 pr-8 text-xs font-semibold text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] cursor-pointer disabled:opacity-40"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Grid Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (Items & Pricing) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Card */}
            <div className="rounded-2xl border border-[#A47251]/5 bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-3">
                Order Items
              </h3>
              <div className="divide-y divide-[#A47251]/5">
                {selectedOrder.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[#A47251]/5 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#2A1E17] text-sm">{item.name}</h4>
                        <p className="text-xs text-[#2A1E17]/60 mt-0.5">Quantity: {item.quantity}</p>
                        <p className="text-xs text-[#2A1E17]/60">Unit Price: Rs. {item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#2A1E17] text-sm">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Card */}
            <div className="rounded-2xl border border-[#A47251]/5 bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-3">
                Payment Summary
              </h3>
              <div className="space-y-2.5 text-sm text-[#2A1E17]/85">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#2A1E17]">Rs. {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span className="font-medium text-[#2A1E17]">Rs. {selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-medium text-[#2A1E17]">Rs. {selectedOrder.shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#2A1E17] pt-4 border-t border-dashed border-[#A47251]/10">
                  <span>Total Amount</span>
                  <span className="text-lg text-[#2E1D13]">Rs. {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Billing & Fulfillment) */}
          <div className="space-y-6">
            {/* Customer & Billing Card */}
            {selectedOrder.billingDetails && (
              <div className="rounded-2xl border border-[#A47251]/5 bg-white p-6 shadow-xs space-y-3">
                <h3 className="font-serif text-lg font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-3">
                  Billing Details
                </h3>
                <div className="text-sm text-[#2A1E17] leading-relaxed space-y-1">
                  <p className="font-bold text-base text-[#2E1D13]">
                    {selectedOrder.billingDetails.firstName} {selectedOrder.billingDetails.lastName}
                  </p>
                  <p className="text-xs text-[#2A1E17]/80">{selectedOrder.billingDetails.email}</p>
                  <p className="text-xs text-[#2A1E17]/80">{selectedOrder.billingDetails.phone}</p>
                  <div className="text-xs text-[#2A1E17]/60 uppercase tracking-wide font-semibold pt-2 border-t border-[#A47251]/5 mt-3">
                    Country: {selectedOrder.billingDetails.country}
                    {selectedOrder.billingDetails.zipCode ? ` | Zip: ${selectedOrder.billingDetails.zipCode}` : ""}
                  </div>
                </div>
              </div>
            )}

            {/* Delivery/Pickup Card */}
            <div className="rounded-2xl border border-[#A47251]/5 bg-white p-6 shadow-xs space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-3">
                Fulfillment Info
              </h3>
              {selectedOrder.fulfillment ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Type</span>
                    <span className="px-2.5 py-0.5 bg-[#DD9E59]/15 text-[#2A1E17] text-[10px] rounded-md font-bold uppercase tracking-wider">
                      {selectedOrder.fulfillment.type}
                    </span>
                  </div>

                  {selectedOrder.fulfillment.type === "pickup" && selectedOrder.fulfillment.pickupDetails && (
                    <div className="bg-amber-50/40 p-3.5 rounded-xl border border-amber-200/35 space-y-1.5 text-sm">
                      <p className="text-xs font-bold text-[#2A1E17]/60 uppercase tracking-wider">Pickup Branch:</p>
                      <p className="font-bold text-[#2A1E17]">{selectedOrder.fulfillment.pickupDetails.branch}</p>
                      <div className="flex justify-between items-center text-xs mt-3 border-t border-[#A47251]/5 pt-2">
                        <span>Date: <strong>{selectedOrder.fulfillment.pickupDetails.date}</strong></span>
                        <span>Time: <strong>{selectedOrder.fulfillment.pickupDetails.time}</strong></span>
                      </div>
                    </div>
                  )}

                  {selectedOrder.fulfillment.type === "delivery" && selectedOrder.fulfillment.deliveryDetails && (
                    <div className="bg-[#F0D8A1]/30 p-3.5 rounded-xl border border-[#A47251]/5 space-y-2 text-sm">
                      <p className="font-bold">
                        Recipient: {selectedOrder.fulfillment.deliveryDetails.firstName} {selectedOrder.fulfillment.deliveryDetails.lastName}
                      </p>
                      <p className="text-xs leading-relaxed">{selectedOrder.fulfillment.deliveryDetails.address}</p>
                      <p className="text-xs">City: {selectedOrder.fulfillment.deliveryDetails.city}</p>
                      <div className="text-xs mt-2 space-y-1 border-t border-[#A47251]/5 pt-2">
                        <p>Phone: <strong>{selectedOrder.fulfillment.deliveryDetails.phone}</strong></p>
                        <p>Recipient Phone: <strong>{selectedOrder.fulfillment.deliveryDetails.recipientPhone}</strong></p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback to original shippingAddress if fulfillment is not set (seeded orders) */
                <div className="text-sm text-[#2A1E17] leading-relaxed space-y-0.5">
                  <p className="font-bold">{selectedOrder.shippingAddress.street}</p>
                  <p>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p className="text-xs text-[#2A1E17]/70">{selectedOrder.shippingAddress.country}</p>
                </div>
              )}
            </div>

            {/* Payment Card */}
            <div className="rounded-2xl border border-[#A47251]/5 bg-white p-6 shadow-xs space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-3">
                Payment Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Method</span>
                  <span className="font-bold text-[#2A1E17]">
                    {selectedOrder.paymentDetails.method === "cod" ? "Cash on Delivery" :
                     selectedOrder.paymentDetails.method === "card" ? "Card Payment" :
                     selectedOrder.paymentDetails.method === "bank_deposit" ? "Bank Deposit" :
                     selectedOrder.paymentDetails.method.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Status</span>
                  <span className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    selectedOrder.paymentDetails.status === "paid"
                      ? "bg-[#DCF0C3] text-[#2A1E17] border border-[#DCF0C3]"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {selectedOrder.paymentDetails.status}
                  </span>
                </div>
                {selectedOrder.paymentDetails.deliverySlipUrl && (
                  <div className="pt-3 border-t border-[#A47251]/5 space-y-1.5">
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Delivery Fee Slip</span>
                    <a
                      href={selectedOrder.paymentDetails.deliverySlipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative h-36 w-full overflow-hidden rounded-none border border-[#A47251]/10 bg-white hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={selectedOrder.paymentDetails.deliverySlipUrl}
                        alt="Uploaded delivery fee slip"
                        className="h-full w-full object-cover"
                      />
                    </a>
                  </div>
                )}
                {selectedOrder.paymentDetails.bankSlipUrl && (
                  <div className="pt-3 border-t border-[#A47251]/5 space-y-1.5">
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Bank Deposit Slip</span>
                    <a
                      href={selectedOrder.paymentDetails.bankSlipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative h-36 w-full overflow-hidden rounded-none border border-[#A47251]/10 bg-white hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={selectedOrder.paymentDetails.bankSlipUrl}
                        alt="Uploaded bank deposit slip"
                        className="h-full w-full object-cover"
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Order Note Card */}
            {selectedOrder.orderNote && (
              <div className="rounded-2xl border border-[#A47251]/5 bg-white p-6 shadow-xs space-y-2">
                <h3 className="font-serif text-lg font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-3">
                  Order Note
                </h3>
                <div className="text-xs bg-yellow-55/20 text-[#2A1E17]/90 p-3.5 rounded-xl border border-yellow-200/25 italic leading-relaxed">
                  "{selectedOrder.orderNote}"
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[#A47251]/5 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#A47251]/5">
          <thead className="bg-[#F0D8A1]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Order</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Total</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#A47251]/5 bg-white">
            {orders.map((order) => {
              const formattedDate = order.createdAt
                ? new Date(order.createdAt as any).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : new Date().toLocaleDateString();

              return (
                <tr
                  key={order.id}
                  className="hover:bg-[#F0D8A1]/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  {/* Order ID */}
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-[#2A1E17]">
                    {order.id}
                  </td>
                  {/* Date */}
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#2A1E17]/80">
                    {formattedDate}
                  </td>
                  {/* Total Price */}
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-[#2A1E17]">
                    Rs. {order.total.toFixed(2)}
                  </td>
                  {/* Status Badge */}
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  {/* Actions Status Selector */}
                  <td
                    className="whitespace-nowrap px-6 py-4 text-right text-sm"
                    onClick={(e) => e.stopPropagation()} // Stop row click trigger
                  >
                    <div className="relative inline-block text-left">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as Order["status"])
                        }
                        className="bg-[#F0D8A1] border border-[#A47251]/10 rounded-lg py-1 pl-2.5 pr-8 text-xs font-semibold text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] cursor-pointer disabled:opacity-40"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
