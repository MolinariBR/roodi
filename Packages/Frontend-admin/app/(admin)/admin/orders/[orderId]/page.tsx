import Link from "next/link";
import { getAdminOrderById } from "@modules/orders/application/admin-orders.service";
import { AdminOrderDetail } from "@modules/orders/presentation/admin-order-detail";

type AdminOrderDetailPageProps = {
  params: {
    orderId: string;
  };
};

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps): Promise<JSX.Element> {
  const result = await getAdminOrderById(params.orderId);

  return (
    <section className="space-y-4">
      <div>
        <Link
          href="/admin/orders"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Voltar para pedidos
        </Link>
      </div>

      {result.error ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-danger">
          {result.error}
        </p>
      ) : null}

      {result.data ? <AdminOrderDetail order={result.data} /> : null}
    </section>
  );
}
