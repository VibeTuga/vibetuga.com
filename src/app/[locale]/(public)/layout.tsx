import dynamic from "next/dynamic";
import { HeaderServer } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";

const PageFadeIn = dynamic(() =>
  import("@/components/shared/PageFadeIn").then((m) => m.PageFadeIn),
);

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderServer />
      <main className="flex-1 pt-20">
        <PageFadeIn>{children}</PageFadeIn>
      </main>
      <Footer />
    </>
  );
}
