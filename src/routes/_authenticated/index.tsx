import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DiamondProvider, useDiamond, ROLES, Role } from "@/lib/diamond-store";
import { InputForms } from "@/components/InputForms";
import { Dashboards } from "@/components/Dashboards";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Gem, LayoutDashboard, ClipboardEdit, Shield, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Diamantes - Central de Tratamento | Monitorização Técnica" },
      { name: "description", content: "Sistema integrado de monitorização técnica e operacional para central de tratamento de diamantes." },
    ],
  }),
  component: () => (
    <DiamondProvider>
      <App />
      <Toaster theme="dark" />
    </DiamondProvider>
  ),
});

function App() {
  const { role, setRole } = useDiamond();
  const access = ROLES[role].access;
  const canInput = access.includes("inputs");
  const [view, setView] = useState<"dash" | "input">(canInput ? "input" : "dash");
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão terminada");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-primary to-steel flex items-center justify-center">
              <Gem className="text-primary-foreground" size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Central de Tratamento de Diamantes</h1>
              <p className="text-xs text-muted-foreground">Monitorização Técnica & Operacional</p>
            </div>
          </div>

          <nav className="flex gap-1 ml-2">
            {canInput && (
              <Button variant={view === "input" ? "default" : "ghost"} size="sm" onClick={() => setView("input")}>
                <ClipboardEdit size={16} className="mr-1" /> Input
              </Button>
            )}
            <Button variant={view === "dash" ? "default" : "ghost"} size="sm" onClick={() => setView("dash")}>
              <LayoutDashboard size={16} className="mr-1" /> Dashboards
            </Button>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Shield size={16} className="text-steel" />
            <Select value={role} onValueChange={(v) => { const r = v as Role; setRole(r); if (!ROLES[r].access.includes("inputs")) setView("dash"); }}>
              <SelectTrigger className="w-[260px] bg-input"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLES) as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>{ROLES[r].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={handleSignOut} title="Terminar sessão">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {view === "input" && canInput ? <InputForms /> : <Dashboards />}
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Fluxo: Crivo 1 → DMS 1 + Crivo 2 → DMS 2 → Recuperação Final Consolidada
      </footer>
    </div>
  );
}
