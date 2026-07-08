import { getAllOrders } from "@/lib/orders";
import OrdersTable from "./OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2A1E17] tracking-tight">Order Management</h1>
        <p className="mt-1 text-sm text-[#3A2E2B]/70">
          Track customer purchases, manage baking queues, and dispatch deliveries.
        </p>
      </div>

      <OrdersTable initialOrders={orders} />
    </div>
  );
}
