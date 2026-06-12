import { createContext, useContext, useState, ReactNode } from "react";

export type Role = "direcao" | "operacional" | "tecnico" | "admin";

export const ROLES: Record<Role, { label: string; access: string[] }> = {
  direcao: { label: "Nível 1 - Direção", access: ["exec", "consolidado"] },
  operacional: { label: "Nível 2 - Gestão Operacional", access: ["exec", "consolidado", "eficiencia", "perdas", "granulometria"] },
  tecnico: { label: "Nível 3 - Controlo Técnico", access: ["inputs", "exec", "eficiencia", "tecnico", "granulometria"] },
  admin: { label: "Nível 4 - Administração", access: ["inputs", "exec", "consolidado", "eficiencia", "perdas", "granulometria", "tecnico"] },
};

export type Classe = "A" | "B" | "C";
export type Equipamento = "Crivo 1" | "Crivo 2" | "DMS 1" | "DMS 2";
export const CLASSES: Classe[] = ["A", "B", "C"];
export const EQUIPAMENTOS: Equipamento[] = ["Crivo 1", "Crivo 2", "DMS 1", "DMS 2"];

export interface MassaData {
  tonAlimentadas: number;
  tonTratadas: number;
  concentrado: number;
  crivo1Plus1: number; crivo1Minus1: number; crivo1Ef: number;
  crivo2Plus1: number; crivo2Minus1: number; crivo2Ef: number;
  dms1Plus6: number; dms1Mid: number; dms1Minus1: number;
  dms2Plus6: number; dms2Mid: number; dms2Minus1: number;
}
export interface Recuperacao { pedras: number; quilates: number; valor: number; }
export interface Perda { pedras: number; quilates: number; valor: number; }
export interface TecnicoData {
  recolhidas: number; tratadas: number; pendentes: number; tempoResposta: number;
  identificadas: number; confirmadas: number; investigacao: number;
}

interface State {
  massa: MassaData;
  recuperacao: Record<Classe, Recuperacao>;
  perdas: Record<Equipamento, Record<Classe, Perda>>;
  tecnico: TecnicoData;
  setMassa: (m: Partial<MassaData>) => void;
  setRecuperacao: (c: Classe, r: Partial<Recuperacao>) => void;
  setPerda: (e: Equipamento, c: Classe, p: Partial<Perda>) => void;
  setTecnico: (t: Partial<TecnicoData>) => void;
  role: Role;
  setRole: (r: Role) => void;
}

const Ctx = createContext<State | null>(null);

const defaultMassa: MassaData = {
  tonAlimentadas: 0, tonTratadas: 0, concentrado: 0,
  crivo1Plus1: 0, crivo1Minus1: 0, crivo1Ef: 0,
  crivo2Plus1: 0, crivo2Minus1: 0, crivo2Ef: 0,
  dms1Plus6: 0, dms1Mid: 0, dms1Minus1: 0,
  dms2Plus6: 0, dms2Mid: 0, dms2Minus1: 0,
};
const defRec = (): Record<Classe, Recuperacao> => ({
  A: { pedras: 0, quilates: 0, valor: 0 },
  B: { pedras: 0, quilates: 0, valor: 0 },
  C: { pedras: 0, quilates: 0, valor: 0 },
});
const defPerdas = (): Record<Equipamento, Record<Classe, Perda>> => {
  const make = (): Record<Classe, Perda> => ({
    A: { pedras: 0, quilates: 0, valor: 0 },
    B: { pedras: 0, quilates: 0, valor: 0 },
    C: { pedras: 0, quilates: 0, valor: 0 },
  });
  return { "Crivo 1": make(), "Crivo 2": make(), "DMS 1": make(), "DMS 2": make() };
};
const defTec: TecnicoData = {
  recolhidas: 0, tratadas: 0, pendentes: 0, tempoResposta: 0,
  identificadas: 0, confirmadas: 0, investigacao: 0,
};

export function DiamondProvider({ children }: { children: ReactNode }) {
  const [massa, setMassaState] = useState<MassaData>(defaultMassa);
  const [recuperacao, setRecState] = useState(defRec());
  const [perdas, setPerdasState] = useState(defPerdas());
  const [tecnico, setTecState] = useState<TecnicoData>(defTec);
  const [role, setRole] = useState<Role>("admin");

  const value: State = {
    massa, recuperacao, perdas, tecnico, role, setRole,
    setMassa: (m) => setMassaState((s) => ({ ...s, ...m })),
    setRecuperacao: (c, r) => setRecState((s) => ({ ...s, [c]: { ...s[c], ...r } })),
    setPerda: (e, c, p) => setPerdasState((s) => ({ ...s, [e]: { ...s[e], [c]: { ...s[e][c], ...p } } })),
    setTecnico: (t) => setTecState((s) => ({ ...s, ...t })),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDiamond() {
  const c = useContext(Ctx);
  if (!c) throw new Error("DiamondProvider missing");
  return c;
}

export function totalsRecuperacao(rec: Record<Classe, Recuperacao>) {
  return CLASSES.reduce((acc, c) => ({
    pedras: acc.pedras + rec[c].pedras,
    quilates: acc.quilates + rec[c].quilates,
    valor: acc.valor + rec[c].valor,
  }), { pedras: 0, quilates: 0, valor: 0 });
}

export function totalsPerdas(p: Record<Equipamento, Record<Classe, Perda>>) {
  let pedras = 0, quilates = 0, valor = 0;
  EQUIPAMENTOS.forEach((e) => CLASSES.forEach((c) => {
    pedras += p[e][c].pedras; quilates += p[e][c].quilates; valor += p[e][c].valor;
  }));
  return { pedras, quilates, valor };
}

export function perdasByEquip(p: Record<Equipamento, Record<Classe, Perda>>) {
  return EQUIPAMENTOS.map((e) => {
    const t = CLASSES.reduce((a, c) => ({
      pedras: a.pedras + p[e][c].pedras,
      quilates: a.quilates + p[e][c].quilates,
      valor: a.valor + p[e][c].valor,
    }), { pedras: 0, quilates: 0, valor: 0 });
    return { equipamento: e, ...t };
  });
}
