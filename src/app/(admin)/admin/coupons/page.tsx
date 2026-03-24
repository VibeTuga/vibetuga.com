import { CouponManager } from "@/app/(dashboard)/dashboard/coupons/CouponManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cupões | Admin | VibeTuga",
};

export default function AdminCouponsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
          Cupões de Desconto
        </h1>
        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
          Todos os cupões de desconto na plataforma
        </p>
      </div>

      <CouponManager showSeller />
    </div>
  );
}
