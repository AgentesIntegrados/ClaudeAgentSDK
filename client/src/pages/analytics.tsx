
import Layout from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { fetchRankings } from "@/lib/api";
import { BarChart3, TrendingUp, Users, Award, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell, Legend, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const { data: rankings = [], isLoading } = useQuery({
    queryKey: ["rankings"],
    queryFn: fetchRankings,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Carregando dados...</div>
        </div>
      </Layout>
    );
  }

  // Metrics calculations
  const totalExperts = rankings.length;
  const qualifiedExperts = rankings.filter(r => r.score >= 70).length;
  const qualificationRate = totalExperts > 0 ? (qualifiedExperts / totalExperts * 100).toFixed(1) : 0;
  const avgScore = totalExperts > 0 
    ? (rankings.reduce((sum, r) => sum + r.score, 0) / totalExperts).toFixed(1) 
    : 0;

  // Score distribution (0-29, 30-49, 50-69, 70-89, 90-100)
  const scoreDistribution = [
    { range: "0-29", count: rankings.filter(r => r.score < 30).length, color: "#ef4444" },
    { range: "30-49", count: rankings.filter(r => r.score >= 30 && r.score < 50).length, color: "#f97316" },
    { range: "50-69", count: rankings.filter(r => r.score >= 50 && r.score < 70).length, color: "#eab308" },
    { range: "70-89", count: rankings.filter(r => r.score >= 70 && r.score < 90).length, color: "#22c55e" },
    { range: "90-100", count: rankings.filter(r => r.score >= 90).length, color: "#10b981" },
  ];

  // Qualification pie chart
  const qualificationData = [
    { name: "Qualificados", value: qualifiedExperts, color: "#22c55e" },
    { name: "Desqualificados", value: totalExperts - qualifiedExperts, color: "#ef4444" },
  ];

  // Top 5 experts by score
  const topExperts = [...rankings]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(r => ({
      handle: r.instagramHandle,
      score: r.score,
    }));

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Handle", "Nome", "Nicho", "Score", "Seguidores", "Qualificado"];
    const rows = rankings.map(r => [
      r.instagramHandle,
      r.nome || "N/A",
      r.nicho || "N/A",
      r.score,
      r.seguidores || 0,
      r.score >= 70 ? "SIM" : "NÃO",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `experts-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Métricas consolidadas dos experts analisados</p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={totalExperts === 0}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Experts</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExperts}</div>
              <p className="text-xs text-muted-foreground mt-1">Analisados até agora</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Qualificação</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qualificationRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {qualifiedExperts} de {totalExperts} experts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScore}/100</div>
              <p className="text-xs text-muted-foreground mt-1">Média geral</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Experts Qualificados</CardTitle>
              <Award className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{qualifiedExperts}</div>
              <p className="text-xs text-muted-foreground mt-1">Score ≥ 70</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Score</CardTitle>
              <CardDescription>Quantidade de experts por faixa de pontuação</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: { label: "Experts", color: "hsl(var(--chart-1))" }
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution}>
                    <XAxis dataKey="range" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Qualification Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Status de Qualificação</CardTitle>
              <CardDescription>Proporção de experts qualificados vs. desqualificados</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  qualified: { label: "Qualificados", color: "#22c55e" },
                  unqualified: { label: "Desqualificados", color: "#ef4444" }
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={qualificationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {qualificationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top 5 Experts */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Experts</CardTitle>
            <CardDescription>Experts com melhor pontuação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topExperts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum expert analisado ainda
                </p>
              ) : (
                topExperts.map((expert, index) => (
                  <div
                    key={expert.handle}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        #{index + 1}
                      </div>
                      <span className="font-medium">{expert.handle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        expert.score >= 90 ? "bg-green-500/20 text-green-400" :
                        expert.score >= 70 ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {expert.score}/100
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
