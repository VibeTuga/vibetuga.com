import { HeaderServer } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderServer />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </>
  );
}
