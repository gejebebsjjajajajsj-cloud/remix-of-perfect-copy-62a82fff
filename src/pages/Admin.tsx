import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, TrendingUp, MousePointer, MessageCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "admin123"; // Change this to a secure password

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState({
    visits: 0,
    clicksPlan: 0,
    clicksWhatsApp: 0,
    payments: 0,
    revenue: 540,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      toast.success("Autenticado com sucesso!");
    } else {
      toast.error("Senha incorreta");
    }
  };

  useEffect(() => {
    if (!authenticated) return;

    const fetchStats = async () => {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("event_type");

      if (error) {
        console.error("Error fetching stats:", error);
      }

      // Dados fake para combinar com o faturamento de R$ 540,00
      // Você pode ajustar esses números depois se quiser.
      const fakeVisits = 120;
      const fakeClicksPlan = 36; // por exemplo, 36 cliques gerando R$ 540,00
      const fakeClicksWhatsApp = 12;

      setStats({
        visits: fakeVisits,
        clicksPlan: fakeClicksPlan,
        clicksWhatsApp: fakeClicksWhatsApp,
        payments: 0, // Will be updated quando você integrar a API de pagamentos real
        revenue: 540, // Dado fake para mostrar faturamento
      });
    };

    fetchStats();

    const channel = supabase
      .channel("analytics-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "analytics_events",
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md space-y-6 p-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Painel Admin</h1>
            <p className="text-sm text-muted-foreground">Digite a senha para acessar</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <Button variant="outline" onClick={() => setAuthenticated(false)}>
            Sair
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Visitas</p>
                <p className="text-2xl font-bold">{stats.visits}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <MousePointer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliques no Plano</p>
                <p className="text-2xl font-bold">{stats.clicksPlan}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/10 p-3">
                <MessageCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliques no WhatsApp</p>
                <p className="text-2xl font-bold">{stats.clicksWhatsApp}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-500/10 p-3">
                <DollarSign className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faturamento (fake)</p>
                <p className="text-2xl font-bold">
                  R$ {stats.revenue.toFixed(2).replace(".", ",")}
                </p>
                <p className="text-xs text-muted-foreground">Simulação de lucro total em vendas</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
