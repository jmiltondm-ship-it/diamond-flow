import { useDiamond, CLASSES, EQUIPAMENTOS, totalsRecuperacao, totalsPerdas, perdasByEquip } from "@/lib/diamond-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Gem, Scale, DollarSign, Factory, Activity, FlaskConical } from "lucide-react";
import type { ReactNode } from "react";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const fmt = (n: number) => n.toLocaleString("pt-PT", { maximumFractionDigits: 1 });
const fmtMoney = (n: number) => "$" + n.toLocaleString("pt-PT", { maximumFractionDigits: 0 });

function KPI({ icon, label, value, hint, tone = "default" }: { icon: ReactNode; label: string; value: string; hint?: string; tone?: "default" | "warn" | "ok" | "danger" }) {
  const toneClass = tone === "warn" ? "text-warning" : tone === "ok" ? "text-success" : tone === "danger" ? "text-destructive" : "text-foreground";
  return (
    <Card className="border-l-4" style={{ borderLeftColor: tone === "warn" ? "var(--warning)" : tone === "ok" ? "var(--success)" : tone === "danger" ? "var(--destructive)" : "var(--primary)" }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="text-steel">{icon}</div>
        </div>
        <div className={`text-2xl font-bold mt-1 ${toneClass}`}>{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function chartTheme() {
  return { stroke: "var(--border)", text: "var(--muted-foreground)" };
}

const tooltipStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)" };

export function Dashboards() {
  const { massa, recuperacao, perdas, tecnico, role } = useDiamond();
  const access = (() => {
    const map: Record<string, string[]> = {
      direcao: ["exec", "consolidado"],
      operacional: ["exec", "eficiencia", "perdas", "granulometria"],
      tecnico: ["exec", "eficiencia", "tecnico", "granulometria"],
      admin: ["exec", "eficiencia", "perdas", "granulometria", "tecnico"],
    };
    return map[role];
  })();

  const totRec = totalsRecuperacao(recuperacao);
  const totPerd = totalsPerdas(perdas);
  const taxaRec = totRec.valor / (totRec.valor + totPerd.valor || 1);
  const taxaPerd = 1 - taxaRec;
  const efCrivos = (massa.crivo1Ef + massa.crivo2Ef) / 2;
  const efDms = ((massa.dms1Mid + massa.dms2Mid) / 2);

  return (
    <Tabs defaultValue={access[0]} className="w-full">
      <TabsList className="bg-card">
        {access.includes("exec") && <TabsTrigger value="exec">Executivo</TabsTrigger>}
        {access.includes("eficiencia") && <TabsTrigger value="eficiencia">Eficiência & Granul.</TabsTrigger>}
        {access.includes("perdas") && <TabsTrigger value="perdas">Perdas & Recuperação</TabsTrigger>}
        {access.includes("granulometria") && <TabsTrigger value="granulometria">Matriz Granulométrica</TabsTrigger>}
        {access.includes("tecnico") && <TabsTrigger value="tecnico">Controlo Técnico</TabsTrigger>}
      </TabsList>

      {/* Executivo */}
      <TabsContent value="exec" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI icon={<Factory size={18} />} label="Ton. Alimentadas" value={fmt(massa.tonAlimentadas) + " t"} hint={`Tratadas: ${fmt(massa.tonTratadas)} t`} />
          <KPI icon={<Activity size={18} />} label="Concentrado" value={fmt(massa.concentrado) + " t"} />
          <KPI icon={<Gem size={18} />} label="Diamantes Recup." value={fmt(totRec.pedras)} hint={`${fmt(totRec.quilates)} ct`} tone="ok" />
          <KPI icon={<DollarSign size={18} />} label="Valor Recuperado" value={fmtMoney(totRec.valor)} tone="ok" />
          <KPI icon={<AlertTriangle size={18} />} label="Pedras Perdidas" value={fmt(totPerd.pedras)} tone="warn" />
          <KPI icon={<Scale size={18} />} label="Quilates Perdidos" value={fmt(totPerd.quilates) + " ct"} tone="warn" />
          <KPI icon={<TrendingDown size={18} />} label="Valor Perdido" value={fmtMoney(totPerd.valor)} tone="danger" />
          <KPI icon={<TrendingUp size={18} />} label="Ef. Média Crivos / DMS" value={`${fmt(efCrivos)}% / ${fmt(efDms)}%`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Recuperação por Classe (USD)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={CLASSES.map((c) => ({ classe: `Classe ${c}`, valor: recuperacao[c].valor, perda: EQUIPAMENTOS.reduce((s, e) => s + perdas[e][c].valor, 0) }))}>
                  <CartesianGrid stroke={chartTheme().stroke} strokeDasharray="3 3" />
                  <XAxis dataKey="classe" stroke={chartTheme().text} />
                  <YAxis stroke={chartTheme().text} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="valor" fill="var(--chart-3)" name="Recuperado" />
                  <Bar dataKey="perda" fill="var(--chart-4)" name="Perdido" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Taxas Globais</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={[{ name: "Recuperação", value: taxaRec * 100 }, { name: "Perda", value: taxaPerd * 100 }]} dataKey="value" innerRadius={60} outerRadius={90} label={(e) => `${e.name}: ${e.value.toFixed(1)}%`}>
                    <Cell fill="var(--chart-3)" />
                    <Cell fill="var(--chart-4)" />
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Eficiência */}
      <TabsContent value="eficiencia" className="space-y-4 mt-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Eficiência de Peneiração - Crivos</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={[
                { name: "Crivo 1", "+1mm": massa.crivo1Plus1, "-1mm": massa.crivo1Minus1, "Eficiência": massa.crivo1Ef },
                { name: "Crivo 2", "+1mm": massa.crivo2Plus1, "-1mm": massa.crivo2Minus1, "Eficiência": massa.crivo2Ef },
              ]}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="+1mm" fill="var(--chart-2)" />
                <Bar dataKey="-1mm" fill="var(--chart-4)" />
                <Bar dataKey="Eficiência" fill="var(--chart-3)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((n) => {
            const plus6 = (massa as any)[`dms${n}Plus6`];
            const mid = (massa as any)[`dms${n}Mid`];
            const minus1 = (massa as any)[`dms${n}Minus1`];
            const ok = mid >= 80;
            return (
              <Card key={n}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">DMS {n} - Distribuição</CardTitle>
                  <Badge className={ok ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                    {ok ? "Alimentação Correta" : "Fora de Faixa"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={[
                        { name: "+6mm (desvio)", value: plus6 },
                        { name: "-6+1mm (ideal)", value: mid },
                        { name: "-1mm (desvio)", value: minus1 },
                      ]} dataKey="value" outerRadius={80} label={(e) => `${e.value}%`}>
                        <Cell fill="var(--chart-4)" />
                        <Cell fill="var(--chart-3)" />
                        <Cell fill="var(--chart-2)" />
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>

      {/* Perdas */}
      <TabsContent value="perdas" className="space-y-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <KPI icon={<TrendingUp size={18} />} label="Taxa Global Recuperação" value={(taxaRec * 100).toFixed(1) + "%"} tone="ok" />
          <KPI icon={<TrendingDown size={18} />} label="Taxa Global Perda" value={(taxaPerd * 100).toFixed(1) + "%"} tone="danger" />
          <KPI icon={<AlertTriangle size={18} />} label="Valor Total Perdido" value={fmtMoney(totPerd.valor)} tone="warn" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Ranking - Perdas por Equipamento (USD)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={perdasByEquip(perdas).sort((a, b) => b.valor - a.valor)} layout="vertical">
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis type="number" stroke="var(--muted-foreground)" />
                  <YAxis type="category" dataKey="equipamento" stroke="var(--muted-foreground)" width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="valor" fill="var(--chart-4)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Distribuição de Perdas por Equipamento</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={perdasByEquip(perdas)} dataKey="valor" nameKey="equipamento" innerRadius={50} outerRadius={100} label={(e) => `${e.equipamento}`}>
                    {perdasByEquip(perdas).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Granulometria - heatmap */}
      <TabsContent value="granulometria" className="space-y-4 mt-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Recuperação vs Perda por Classe</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={CLASSES.map((c) => ({
                classe: `Classe ${c}`,
                "Quilates Recup.": recuperacao[c].quilates,
                "Quilates Perd.": EQUIPAMENTOS.reduce((s, e) => s + perdas[e][c].quilates, 0),
              }))}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="classe" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="Quilates Recup." fill="var(--chart-3)" />
                <Bar dataKey="Quilates Perd." fill="var(--chart-4)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Heatmap - Valor Perdido (Equipamento × Classe)</CardTitle></CardHeader>
          <CardContent>
            {(() => {
              const maxVal = Math.max(...EQUIPAMENTOS.flatMap((e) => CLASSES.map((c) => perdas[e][c].valor)));
              return (
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-2 text-muted-foreground"></th>
                      {CLASSES.map((c) => <th key={c} className="text-center py-2 text-muted-foreground">Classe {c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {EQUIPAMENTOS.map((e) => (
                      <tr key={e}>
                        <td className="py-2 font-medium pr-3">{e}</td>
                        {CLASSES.map((c) => {
                          const v = perdas[e][c].valor;
                          const intensity = v / maxVal;
                          return (
                            <td key={c} className="p-2">
                              <div className="rounded-md p-3 text-center font-semibold" style={{
                                background: `color-mix(in oklab, var(--destructive) ${intensity * 80}%, var(--card))`,
                                color: intensity > 0.5 ? "white" : "var(--foreground)",
                              }}>
                                {fmtMoney(v)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Técnico */}
      <TabsContent value="tecnico" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI icon={<FlaskConical size={18} />} label="Recolhidas" value={String(tecnico.recolhidas)} />
          <KPI icon={<FlaskConical size={18} />} label="Tratadas" value={String(tecnico.tratadas)} tone="ok" />
          <KPI icon={<FlaskConical size={18} />} label="Pendentes" value={String(tecnico.pendentes)} tone="warn" />
          <KPI icon={<Activity size={18} />} label="Tempo Resposta" value={tecnico.tempoResposta + " h"} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <KPI icon={<AlertTriangle size={18} />} label="Identificadas" value={String(tecnico.identificadas)} />
          <KPI icon={<AlertTriangle size={18} />} label="Confirmadas" value={String(tecnico.confirmadas)} tone="danger" />
          <KPI icon={<AlertTriangle size={18} />} label="Em Investigação" value={String(tecnico.investigacao)} tone="warn" />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Histórico de Tendências - 7 Dias (Simulado)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={Array.from({ length: 7 }, (_, i) => {
                const factor = 0.85 + Math.sin(i) * 0.1 + i * 0.02;
                return {
                  dia: `D-${6 - i}`,
                  "Recuperação (k$)": Math.round(totRec.valor * factor / 1000),
                  "Perdas (k$)": Math.round(totPerd.valor * (1.2 - factor * 0.3) / 1000),
                  "Ef. Crivos %": Math.round(efCrivos * (0.95 + Math.sin(i) * 0.05)),
                  "Ef. DMS %": Math.round(efDms * (0.95 + Math.cos(i) * 0.05)),
                };
              })}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="dia" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="Recuperação (k$)" stroke="var(--chart-3)" strokeWidth={2} />
                <Line type="monotone" dataKey="Perdas (k$)" stroke="var(--chart-4)" strokeWidth={2} />
                <Line type="monotone" dataKey="Ef. Crivos %" stroke="var(--chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="Ef. DMS %" stroke="var(--chart-2)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
