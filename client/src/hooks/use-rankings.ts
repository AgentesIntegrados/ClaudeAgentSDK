
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRankings, createRanking, deleteRanking } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export function useRankings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: rankings = [], isLoading } = useQuery({
    queryKey: ["rankings"],
    queryFn: fetchRankings,
  });

  const createRankingMutation = useMutation({
    mutationFn: createRanking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rankings"] });
      toast({ title: "Salvo!", description: "Expert adicionado ao ranking" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const deleteRankingMutation = useMutation({
    mutationFn: deleteRanking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rankings"] });
      toast({ title: "Removido", description: "Expert removido do ranking" });
    },
  });

  const isInRanking = useCallback((handle: string) => {
    const normalized = handle.replace('@', '').trim().toLowerCase();
    return rankings.some(r => r.instagramHandle.replace('@', '').trim().toLowerCase() === normalized);
  }, [rankings]);

  const qualifiedRankings = rankings.filter(r => r.score >= 70);
  const disqualifiedRankings = rankings.filter(r => r.score < 70);

  return {
    rankings,
    qualifiedRankings,
    disqualifiedRankings,
    isLoading,
    createRankingMutation,
    deleteRankingMutation,
    isInRanking,
  };
}
