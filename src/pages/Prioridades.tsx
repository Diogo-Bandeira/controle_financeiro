import { useFinanceData, formatCurrency, genId, type Prioridade } from "@/lib/finance-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ShoppingBag } from "lucide-react";
import { useState } from "react";

const prioridadeLabels = { alta: "Alta", media: "Média", baixa: "Baixa" };
const prioridadeColors = {
  alta: "bg-destructive/10 text-destructive border-destructive/20",
  media: "bg-warning/10 text-warning-foreground border-warning/20",
  baixa: "bg-muted text-muted-foreground border-border",
};

export default function Prioridades() {
  const { data, update } = useFinanceData();
  const [open, setOpen] = useState(false);
  const [prio, setPrio] = useState<Prioridade["prioridade"]>("media");

  const addPrioridade = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p: Prioridade = {
      id: genId(),
      descricao: fd.get("descricao") as string,
      valor: Number(fd.get("valor")),
      prioridade: prio,
      concluida: false,
    };
    update((d) => ({ ...d, prioridades: [...d.prioridades, p] }));
    setOpen(false);
  };

  const toggleConcluida = (id: string) => {
    update((d) => ({
      ...d,
      prioridades: d.prioridades.map((p) => (p.id === id ? { ...p, concluida: !p.concluida } : p)),
    }));
  };

  const removePrioridade = (id: string) => {
    update((d) => ({ ...d, prioridades: d.prioridades.filter((p) => p.id !== id) }));
  };

  const sorted = [...data.prioridades].sort((a, b) => {
    const order = { alta: 0, media: 1, baixa: 2 };
    if (a.concluida !== b.concluida) return a.concluida ? 1 : -1;
    return order[a.prioridade] - order[b.prioridade];
  });

  const totalPendente = data.prioridades.filter((p) => !p.concluida).reduce((s, p) => s + p.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Prioridades de Compra</h2>
          <p className="text-muted-foreground text-sm">Total pendente: {formatCurrency(totalPendente)}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Novo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Prioridade</DialogTitle></DialogHeader>
            <form onSubmit={addPrioridade} className="space-y-4">
              <div><Label>Descrição</Label><Input name="descricao" required /></div>
              <div><Label>Valor Estimado (R$)</Label><Input name="valor" type="number" step="0.01" required /></div>
              <div>
                <Label>Prioridade</Label>
                <Select value={prio} onValueChange={(v) => setPrio(v as Prioridade["prioridade"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Adicionar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {sorted.map((p) => (
          <div key={p.id} className={`finance-card flex items-center gap-3 ${p.concluida ? "opacity-50" : ""}`}>
            <Checkbox checked={p.concluida} onCheckedChange={() => toggleConcluida(p.id)} />
            <ShoppingBag className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm ${p.concluida ? "line-through" : ""}`}>{p.descricao}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(p.valor)}</p>
            </div>
            <Badge variant="outline" className={prioridadeColors[p.prioridade]}>
              {prioridadeLabels[p.prioridade]}
            </Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removePrioridade(p.id)}>
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        ))}
        {data.prioridades.length === 0 && (
          <div className="finance-card text-center py-8">
            <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Nenhuma prioridade cadastrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
