import { useState, useEffect, useCallback } from "react";

// Types
export interface Meta {
  id: string;
  nome: string;
  valorMeta: number;
  valorAtual: number;
  rendimento: number;
}

export interface Lancamento {
  id: string;
  descricao: string;
  valor: number;
  categoria: "entrada" | "dizimo" | "conta_fixa" | "cartao" | "variavel";
  mes: number; // 0-11
}

export interface Parcelamento {
  id: string;
  descricao: string;
  valorTotal: number;
  parcelas: number;
  parcelasPagas: number;
  valorParcela: number;
}

export interface Prioridade {
  id: string;
  descricao: string;
  valor: number;
  prioridade: "alta" | "media" | "baixa";
  concluida: boolean;
}

export interface FinanceData {
  metas: Meta[];
  lancamentos: Lancamento[];
  parcelamentos: Parcelamento[];
  prioridades: Prioridade[];
  mesSelecionado: number;
}

const STORAGE_KEY = "iepe-financas-data";

const defaultData: FinanceData = {
  metas: [
    { id: "1", nome: "Reserva de Emergência", valorMeta: 50000, valorAtual: 12500, rendimento: 350 },
    { id: "2", nome: "Viagem em Família", valorMeta: 15000, valorAtual: 4200, rendimento: 80 },
    { id: "3", nome: "Novo Veículo", valorMeta: 80000, valorAtual: 22000, rendimento: 520 },
    { id: "4", nome: "Reforma da Casa", valorMeta: 30000, valorAtual: 8700, rendimento: 190 },
    { id: "5", nome: "Fundo Educacional", valorMeta: 20000, valorAtual: 6300, rendimento: 140 },
  ],
  lancamentos: [
    { id: "l1", descricao: "Salário", valor: 8500, categoria: "entrada", mes: new Date().getMonth() },
    { id: "l2", descricao: "Freelance", valor: 2000, categoria: "entrada", mes: new Date().getMonth() },
    { id: "l3", descricao: "Dízimo", valor: 1050, categoria: "dizimo", mes: new Date().getMonth() },
    { id: "l4", descricao: "Aluguel", valor: 2200, categoria: "conta_fixa", mes: new Date().getMonth() },
    { id: "l5", descricao: "Energia", valor: 280, categoria: "conta_fixa", mes: new Date().getMonth() },
    { id: "l6", descricao: "Internet", valor: 120, categoria: "conta_fixa", mes: new Date().getMonth() },
    { id: "l7", descricao: "Cartão Visa", valor: 1800, categoria: "cartao", mes: new Date().getMonth() },
    { id: "l8", descricao: "Supermercado", valor: 950, categoria: "variavel", mes: new Date().getMonth() },
    { id: "l9", descricao: "Combustível", valor: 400, categoria: "variavel", mes: new Date().getMonth() },
  ],
  parcelamentos: [
    { id: "p1", descricao: "Notebook", valorTotal: 4800, parcelas: 12, parcelasPagas: 5, valorParcela: 400 },
    { id: "p2", descricao: "Celular", valorTotal: 3600, parcelas: 10, parcelasPagas: 3, valorParcela: 360 },
  ],
  prioridades: [
    { id: "pr1", descricao: "Air Fryer", valor: 450, prioridade: "alta", concluida: false },
    { id: "pr2", descricao: "Tênis de corrida", valor: 600, prioridade: "media", concluida: false },
    { id: "pr3", descricao: "Fone Bluetooth", valor: 350, prioridade: "baixa", concluida: false },
  ],
  mesSelecionado: new Date().getMonth(),
};

function loadData(): FinanceData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultData;
}

function saveData(data: FinanceData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useFinanceData() {
  const [data, setData] = useState<FinanceData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const update = useCallback((updater: (prev: FinanceData) => FinanceData) => {
    setData((prev) => {
      const next = updater(prev);
      return next;
    });
  }, []);

  // Computed values for selected month
  const lancamentosMes = data.lancamentos.filter((l) => l.mes === data.mesSelecionado);
  const entradas = lancamentosMes.filter((l) => l.categoria === "entrada").reduce((s, l) => s + l.valor, 0);
  const dizimos = lancamentosMes.filter((l) => l.categoria === "dizimo").reduce((s, l) => s + l.valor, 0);
  const contasFixas = lancamentosMes.filter((l) => l.categoria === "conta_fixa").reduce((s, l) => s + l.valor, 0);
  const cartoes = lancamentosMes.filter((l) => l.categoria === "cartao").reduce((s, l) => s + l.valor, 0);
  const variaveis = lancamentosMes.filter((l) => l.categoria === "variavel").reduce((s, l) => s + l.valor, 0);
  const totalSaidas = dizimos + contasFixas + cartoes + variaveis;
  const saldo = entradas - totalSaidas;

  return {
    data,
    update,
    lancamentosMes,
    entradas,
    dizimos,
    contasFixas,
    cartoes,
    variaveis,
    totalSaidas,
    saldo,
  };
}

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const CATEGORIAS: Record<string, string> = {
  entrada: "Entradas",
  dizimo: "Dízimos",
  conta_fixa: "Contas Fixas",
  cartao: "Cartões de Crédito",
  variavel: "Variáveis",
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function genId(): string {
  return Math.random().toString(36).substring(2, 10);
}
