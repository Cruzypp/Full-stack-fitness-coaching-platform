'use client';

import { useEffect, useState } from "react";
import { ArrowLeft, MoreVertical, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { useAuthStore } from "@/app/store/useAuthStore";
import { supabase } from "@/app/lib/connection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PERCENTAGES = [50, 60, 70, 75, 80, 85, 90, 95, 100];

interface PrRecord {
  id: string;
  exercise: string;
  weight_kg: number;
  reps: number | null;
  sensation: string | null;
  recorded_at: string;
}

export default function MisCargas() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuthStore();
  const [records, setRecords] = useState<PrRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Record<string, number | null>>({});

  const toggleRow = (recordId: string, pct: number) => {
    setSelectedRows((prev) => {
      const current = prev[recordId];
      return {
        ...prev,
        [recordId]: current === pct ? null : pct,
      };
    });
  };

  useEffect(() => {
    if (!user) return;

    supabase
      .from("pr_records")
      .select("*")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("[mis-cargas] Error querying pr_records:", error);
        // Quedarse solo con el PR más reciente por ejercicio
        const rows = (data || []) as PrRecord[];
        const latest = Object.values(
          rows.reduce((acc, r) => {
            if (!acc[r.exercise]) acc[r.exercise] = r;
            return acc;
          }, {} as Record<string, PrRecord>)
        );
        setRecords(latest);
        setLoadingData(false);
      });
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.user_metadata?.role === "admin";
  const hasRecords = records.length > 0;

  return (
    <div className="min-h-screen bg-[#050505] pb-24 md:pb-0">

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center justify-between px-6 md:px-12 py-5 border-b border-border">
        <Link href="/pricing" className="font-bebas text-xl tracking-wide text-foreground hover:opacity-80 transition-opacity">
          THE ON3 P3RCENT
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/mis-cargas" className="font-label text-xs uppercase tracking-[0.15em] text-foreground">
            Mis Cargas
          </Link>
          <Link href="/pricing" className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          {isAdmin && (
            <Link href="/admin" className="font-label text-xs uppercase tracking-[0.15em] text-primary hover:text-primary/80 transition-colors">
              Dashboard
            </Link>
          )}
          <button
            onClick={signOut}
            className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/pricing")} className="text-foreground">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-bold uppercase tracking-wide text-foreground">Mis Cargas</h1>
        </div>
        <button className="text-muted-foreground">
          <MoreVertical size={20} />
        </button>
      </header>

      <div className="px-4 md:px-12 py-6">
        {/* Subtitle */}
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
            Rendimiento Actual
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tus máximos y porcentajes de trabajo actualizados basados en tu última sesión.
          </p>
        </div>

        {/* Estado: cargando */}
        {loadingData ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : !hasRecords ? (
          /* Estado: sin datos */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <ClipboardList size={28} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Aún falta información
            </p>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Todavía no has completado el formulario de PR inicial. Tu coach te enviará el link por WhatsApp para registrar tus cargas.
            </p>
          </motion.div>
        ) : (
          /* Estado: con datos */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {records.map((record) => (
              <div key={record.id} className="rounded-2xl border border-border overflow-hidden">
                {/* Exercise header */}
                <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                  <p className="text-sm font-bold uppercase tracking-wide text-foreground">{record.exercise}</p>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">{record.weight_kg} kg</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {record.reps ? `${record.reps}RM` : "1RM"}
                    </p>
                  </div>
                </div>

                {/* Percentages table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] uppercase tracking-widest text-center w-20">%</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-widest text-center">Peso (kg)</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-widest text-center hidden md:table-cell">Referencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PERCENTAGES.map((pct) => {
                      const weight = Math.round(record.weight_kg * (pct / 100));
                      const isSelected = selectedRows[record.id] === pct;
                      return (
                        <TableRow
                          key={pct}
                          onClick={() => toggleRow(record.id, pct)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-green-500/15 hover:bg-green-500/20"
                              : "hover:bg-muted/30"
                          }`}
                        >
                          <TableCell className="text-xs text-white text-center">{pct}%</TableCell>
                          <TableCell className={`text-sm text-center font-semibold ${isSelected ? "text-green-400" : ""}`}>
                            {weight} kg
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-center">
                            <div className="w-full max-w-48 h-1.5 rounded-full bg-muted overflow-hidden mx-auto">
                              <div
                                className={`h-full rounded-full transition-colors ${isSelected ? "bg-green-500" : "bg-foreground"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <BottomNav activeTab="cargas" />
    </div>
  );
}
