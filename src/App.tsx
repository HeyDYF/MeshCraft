import { Suspense, lazy } from "react";

const AppShell = lazy(async () => {
  const module = await import("./app/AppShell");
  return { default: module.AppShell };
});

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0d1117] font-mono text-xs uppercase tracking-[0.3em] text-cyan-300">
          Booting MeshCraft
        </div>
      }
    >
      <AppShell />
    </Suspense>
  );
}
