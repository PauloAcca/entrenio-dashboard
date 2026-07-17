import Navigation from "@/components/layout/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-dvh print:h-auto w-full overflow-hidden print:overflow-visible">
      <Navigation />
      <main className="flex-1 overflow-y-auto print:overflow-visible">
        {children}
      </main>
    </div>
  );
}
