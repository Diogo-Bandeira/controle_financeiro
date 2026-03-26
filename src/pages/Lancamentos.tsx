import { useFinanceData, formatCurrency, MESES, CATEGORIAS, type Lancamento } from "@/lib/finance-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

const catKeys = Object.keys(CATEGORIAS) as Lancamento["categoria"][];

export default function Lancamentos() {
  const { mesSelecionado, setMesSelecionado, lancamentosMes, entradas, totalSaidas, saldo, addLancamento, deleteLancamento, loading } = useFinanceData();
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<Lancamento["categoria"]>("entrada");

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await addLancamento({
      descricao: fd.get("descricao") as string,
      valor: Number(fd.get("valor")),
      categoria: cat,
      mes: mesSelecionado,
    });
    setOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">Lançamentos Mensais</h2>
          <p className="text-muted-foreground text-sm">{MESES[mesSelecionado]}</p>
        </div>
        <div className="flex gap-2">
          <Select value={String(mesSelecionado)} onValueChange={(v) => setMesSelecionado(Number(v))}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MESES.map((m, i) => (
                <SelectItem key={i} value={String(i)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Novo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Lançamento</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <Label>Descrição</Label>
                  <Input name="descricao" required />
                </div>
                <div>
                  <Label>Valor (R$)</Label>
                  <Input name="valor" type="number" step="0.01" required />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={cat} onValueChange={(v) => setCat(v as Lancamento["categoria"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {catKeys.map((k) => (
                        <SelectItem key={k} value={k}>{CATEGORIAS[k]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Adicionar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="finance-card text-center">
          <p className="stat-label">Entradas</p>
          <p className="text-lg font-bold text-success">{formatCurrency(entradas)}</p>
        </div>
        <div className="finance-card text-center">
          <p className="stat-label">Saídas</p>
          <p className="text-lg font-bold text-destructive">{formatCurrency(totalSaidas)}</p>
        </div>
        <div className="finance-card text-center">
          <p className="stat-label">Saldo</p>
          <p className={`text-lg font-bold ${saldo >= 0 ? "text-success" : "text-destructive"}`}>{formatCurrency(saldo)}</p>
        </div>
      </div>

      <Tabs defaultValue="entrada">
        <TabsList className="w-full flex flex-wrap h-auto gap-1">
          {catKeys.map((k) => (
            <TabsTrigger key={k} value={k} className="text-xs flex-1 min-w-[100px]">{CATEGORIAS[k]}</TabsTrigger>
          ))}
        </TabsList>
        {catKeys.map((k) => {
          const items = lancamentosMes.filter((l) => l.categoria === k);
          const total = items.reduce((s, l) => s + l.valor, 0);
          return (
            <TabsContent key={k} value={k}>
              <div className="finance-card">
                <div className="flex justify-between mb-3">
                  <h3 className="font-semibold">{CATEGORIAS[k]}</h3>
                  <span className="font-bold">{formatCurrency(total)}</span>
                </div>
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhum lançamento nesta categoria.</p>
                ) : (
                  <div className="divide-y">
                    {items.map((l) => (
                      <div key={l.id} className="flex items-center justify-between py-2.5">
                        <span className="text-sm">{l.descricao}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{formatCurrency(l.valor)}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteLancamento(l.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
