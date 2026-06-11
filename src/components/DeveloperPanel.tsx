import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAdminUsers, inviteAdminUser, deleteAdminUser } from "@/lib/admin-users.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Trash2, UserPlus, ShieldAlert } from "lucide-react";

export function DeveloperPanel() {
  const list = useServerFn(listAdminUsers);
  const invite = useServerFn(inviteAdminUser);
  const remove = useServerFn(deleteAdminUser);
  const qc = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => list(),
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const inviteMut = useMutation({
    mutationFn: () => invite({ data: { email, first_name: firstName, last_name: lastName, phone } }),
    onSuccess: () => {
      toast.success("Convite enviado por email.");
      setFirstName(""); setLastName(""); setEmail(""); setPhone("");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao convidar"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Utilizador eliminado.");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao eliminar"),
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldAlert /> Acesso negado</CardTitle>
          <CardDescription>{(error as Error).message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Painel do Desenvolvedor — Gestão de Contas</CardTitle>
          <CardDescription>Acesso restrito. Apenas o administrador pode criar ou excluir contas.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><UserPlus size={18}/> Criar Novo Utilizador</CardTitle></CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => { e.preventDefault(); inviteMut.mutate(); }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <div><Label>Nome</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
            <div><Label>Apelido</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} required /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div><Label>Telemóvel</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={inviteMut.isPending}>
                {inviteMut.isPending ? "A enviar..." : "Criar e Enviar Convite"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Utilizadores Registados</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">A carregar...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telemóvel</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.first_name} {u.last_name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleteMut.isPending}
                        onClick={() => {
                          if (confirm(`Eliminar ${u.email}?`)) deleteMut.mutate(u.id);
                        }}
                      >
                        <Trash2 size={14} className="mr-1" /> Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sem utilizadores.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
