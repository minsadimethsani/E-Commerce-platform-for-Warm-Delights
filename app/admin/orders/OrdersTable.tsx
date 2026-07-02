"use client";

import { useState } from "react";
import { Order } from "@/types/database";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Update order status directly in Firestore
  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    setUpdatingId(orderId);
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
    }
  };

  const getStatusBadgeClass = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
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

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Table Container (Left Column) */}
      <div className="flex-1 w-full overflow-hidden rounded-2xl border border-[#2D1E18]/5 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#2D1E18]/5">
            <thead className="bg-[#FAF5F0]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Order</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D1E18]/5 bg-white">
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
                    className={`hover:bg-[#FAF5F0]/30 transition-colors cursor-pointer ${
                      selectedOrder?.id === order.id ? "bg-[#FAF5F0]/40" : ""
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    {/* Order ID */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-[#2D1E18]">
                      {order.id}
                    </td>
                    {/* Date */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[#55433C]/80">
                      {formattedDate}
                    </td>
                    {/* Total Price */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-[#2D1E18]">
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
                          className="bg-[#FAF5F0] border border-[#2D1E18]/10 rounded-lg py-1 pl-2.5 pr-8 text-xs font-semibold text-[#2D1E18] focus:outline-none focus:border-[#C2957C] cursor-pointer disabled:opacity-40"
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

      {/* Details Side Panel (Right Column, visible when order selected) */}
      {selectedOrder && (
        <aside className="w-full lg:w-96 rounded-2xl border border-[#2D1E18]/5 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#2D1E18]/5 pb-4">
            <h3 className="font-serif text-lg font-bold text-[#2D1E18]">
              Details: {selectedOrder.id}
            </h3>
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-xs font-bold text-[#55433C]/60 hover:text-[#2D1E18]"
            >
              Close
            </button>
          </div>

          {/* Customer Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Shipping Address</h4>
            <div className="text-sm text-[#2D1E18] font-medium leading-relaxed">
              <p className="font-bold">{selectedOrder.shippingAddress.street}</p>
              <p>
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
              </p>
              <p>{selectedOrder.shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="space-y-2 pt-4 border-t border-[#2D1E18]/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Payment</h4>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium uppercase text-[#55433C]">
                Method: {selectedOrder.paymentDetails.method}
              </span>
              <span className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                selectedOrder.paymentDetails.status === "paid"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {selectedOrder.paymentDetails.status}
              </span>
            </div>
          </div>

          {/* Items Summary */}
          <div className="space-y-3 pt-4 border-t border-[#2D1E18]/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Order Items</h4>
            <div className="space-y-3">
              {selectedOrder.items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="relative h-8 w-8 overflow-hidden rounded bg-[#2D1E18]/5 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <span className="font-bold text-[#2D1E18] line-clamp-1">{item.name}</span>
                      <span className="text-[#55433C]/60">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#2D1E18]">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Calculations */}
          <div className="pt-4 border-t border-[#2D1E18]/5 space-y-1.5 text-xs text-[#55433C]/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs. {selectedOrder.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%)</span>
              <span>Rs. {selectedOrder.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Rs. {selectedOrder.shippingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#2D1E18] pt-2 border-t border-dashed border-[#2D1E18]/5">
              <span>Total</span>
              <span>Rs. {selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>

        </aside>
      )}

    </div>
  );
}
