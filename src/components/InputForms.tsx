import { useState } from "react";
import { useDiamond, CLASSES, EQUIPAMENTOS, Classe, Equipamento } from "@/lib/diamond-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil, Save, X } from "lucide-react";

function NumField({ label, value, onChange, suffix, disabled }: { label: string; value: number; onChange: (n: number) => void; suffix?: string; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}{suffix && <span className="ml-1 text-steel">({suffix})</span>}</Label>
      <Input type="number" disabled={disabled} value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="bg-input border-border disabled:opacity-60 disabled:cursor-not-allowed" />
    </div>
  );
}

export function InputForms() {
  const { massa, setMassa, recuperacao, setRecuperacao, perdas, setPerda, tecnico, setTecnico } = useDiamond();
  const [selEquip, setSelEquip] = useState<Equipamento>("Crivo 1");
  const [selClasse, setSelClasse] = useState<Classe>("A");
  const [editing, setEditing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(false);
    toast.success("Dados submetidos com sucesso!");
  };

  const handleCancel = () => {
    setEditing(false);
    toast.info("Edição cancelada.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        {!editing ? (
          <Button type="button" onClick={() => setEditing(true)}>
            <Pencil size={16} className="mr-1" /> Editar
          </Button>
        ) : (
          <>
            <Button type="submit">
              <Save size={16} className="mr-1" /> Submeter
            </Button>
            <Button type="button" variant="secondary" onClick={handleCancel}>
              <X size={16} className="mr-1" /> Cancelar
            </Button>
          </>
        )}
      </div>

      <Tabs defaultValue="massa" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card">
          <TabsTrigger value="massa">Massa & Operação</TabsTrigger>
          <TabsTrigger value="sortagem">Fecho Sortagem</TabsTrigger>
          <TabsTrigger value="perdas">Perdas (Matriz)</TabsTrigger>
          <TabsTrigger value="tecnico">Controlo Técnico</TabsTrigger>
        </TabsList>

        <TabsContent value="massa" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Dados de Massa</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NumField label="Toneladas Alimentadas" suffix="t" value={massa.tonAlimentadas} onChange={(n) => setMassa({ tonAlimentadas: n })} disabled={!editing} />
              <NumField label="Toneladas Tratadas" suffix="t" value={massa.tonTratadas} onChange={(n) => setMassa({ tonTratadas: n })} disabled={!editing} />
              <NumField label="Concentrado Produzido" suffix="t" value={massa.concentrado} onChange={(n) => setMassa({ concentrado: n })} disabled={!editing} />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <Card key={n}>
                <CardHeader><CardTitle className="text-base">Crivo Primário {n}</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-3 gap-3">
                  <NumField label="% +1 mm" value={(massa as any)[`crivo${n}Plus1`]} onChange={(v) => setMassa({ [`crivo${n}Plus1`]: v } as any)} disabled={!editing} />
                  <NumField label="% -1 mm" value={(massa as any)[`crivo${n}Minus1`]} onChange={(v) => setMassa({ [`crivo${n}Minus1`]: v } as any)} disabled={!editing} />
                  <NumField label="Eficiência %" value={(massa as any)[`crivo${n}Ef`]} onChange={(v) => setMassa({ [`crivo${n}Ef`]: v } as any)} disabled={!editing} />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <Card key={n}>
                <CardHeader><CardTitle className="text-base">DMS {n} - Granulometria</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-3 gap-3">
                  <NumField label="% +6 mm" value={(massa as any)[`dms${n}Plus6`]} onChange={(v) => setMassa({ [`dms${n}Plus6`]: v } as any)} disabled={!editing} />
                  <NumField label="% -6+1 mm" value={(massa as any)[`dms${n}Mid`]} onChange={(v) => setMassa({ [`dms${n}Mid`]: v } as any)} disabled={!editing} />
                  <NumField label="% -1 mm" value={(massa as any)[`dms${n}Minus1`]} onChange={(v) => setMassa({ [`dms${n}Minus1`]: v } as any)} disabled={!editing} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sortagem" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Fecho de Sortagem - Recuperação Consolidada</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {CLASSES.map((c) => (
                <div key={c} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-3 rounded-md bg-muted/40">
                  <div>
                    <div className="text-sm font-semibold text-primary">Classe {c}</div>
                    <div className="text-xs text-muted-foreground">{c === "A" ? "+4.75mm" : c === "B" ? "-4.75+3.15mm" : "-3.15+1.18mm"}</div>
                  </div>
                  <NumField label="Nº Diamantes" value={recuperacao[c].pedras} onChange={(v) => setRecuperacao(c, { pedras: v })} disabled={!editing} />
                  <NumField label="Quilates" suffix="ct" value={recuperacao[c].quilates} onChange={(v) => setRecuperacao(c, { quilates: v })} disabled={!editing} />
                  <NumField label="Valor" suffix="USD" value={recuperacao[c].valor} onChange={(v) => setRecuperacao(c, { valor: v })} disabled={!editing} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perdas" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Registo de Perdas - Equipamento × Classe</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Equipamento</Label>
                  <Select value={selEquip} onValueChange={(v) => setSelEquip(v as Equipamento)} disabled={!editing}>
                    <SelectTrigger className="disabled:opacity-60 disabled:cursor-not-allowed"><SelectValue /></SelectTrigger>
                    <SelectContent>{EQUIPAMENTOS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Classe</Label>
                  <Select value={selClasse} onValueChange={(v) => setSelClasse(v as Classe)} disabled={!editing}>
                    <SelectTrigger className="disabled:opacity-60 disabled:cursor-not-allowed"><SelectValue /></SelectTrigger>
                    <SelectContent>{CLASSES.map((c) => <SelectItem key={c} value={c}>Classe {c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NumField label="Pedras Perdidas" value={perdas[selEquip][selClasse].pedras} onChange={(v) => setPerda(selEquip, selClasse, { pedras: v })} disabled={!editing} />
                <NumField label="Quilates Perdidos" suffix="ct" value={perdas[selEquip][selClasse].quilates} onChange={(v) => setPerda(selEquip, selClasse, { quilates: v })} disabled={!editing} />
                <NumField label="Valor Perdido" suffix="USD" value={perdas[selEquip][selClasse].valor} onChange={(v) => setPerda(selEquip, selClasse, { valor: v })} disabled={!editing} />
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2">Equipamento</th>
                      {CLASSES.map((c) => <th key={c} className="text-right py-2">Classe {c} (USD)</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {EQUIPAMENTOS.map((e) => (
                      <tr key={e} className="border-b border-border/40">
                        <td className="py-2 font-medium">{e}</td>
                        {CLASSES.map((c) => (
                          <td key={c} className="text-right py-2 text-warning">${perdas[e][c].valor.toLocaleString()}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tecnico" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Controlo Técnico & Laboratório</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumField label="Nº Amostras Recolhidas" value={tecnico.recolhidas} onChange={(v) => setTecnico({ recolhidas: v })} disabled={!editing} />
              <NumField label="Nº Amostras Tratadas" value={tecnico.tratadas} onChange={(v) => setTecnico({ tratadas: v })} disabled={!editing} />
              <NumField label="Nº Amostras Pendentes" value={tecnico.pendentes} onChange={(v) => setTecnico({ pendentes: v })} disabled={!editing} />
              <NumField label="Tempo Médio Resposta" suffix="h" value={tecnico.tempoResposta} onChange={(v) => setTecnico({ tempoResposta: v })} disabled={!editing} />
              <NumField label="Perdas Identificadas" value={tecnico.identificadas} onChange={(v) => setTecnico({ identificadas: v })} disabled={!editing} />
              <NumField label="Perdas Confirmadas" value={tecnico.confirmadas} onChange={(v) => setTecnico({ confirmadas: v })} disabled={!editing} />
              <NumField label="Em Investigação" value={tecnico.investigacao} onChange={(v) => setTecnico({ investigacao: v })} disabled={!editing} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
