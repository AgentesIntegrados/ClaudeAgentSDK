
import { memo } from "react";
import { motion } from "framer-motion";
import { Trophy, Check, X as XIcon, Trash2 } from "lucide-react";
import type { ExpertRanking } from "@shared/schema";

interface RankingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  rankings: ExpertRanking[];
  qualifiedRankings: ExpertRanking[];
  disqualifiedRankings: ExpertRanking[];
  onDelete: (id: string) => void;
}

export const RankingSidebar = memo(({ 
  isOpen, 
  onClose, 
  rankings,
  qualifiedRankings,
  disqualifiedRankings,
  onDelete 
}: RankingSidebarProps) => {
  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        exit={{ x: -320 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-50 flex flex-col"
      >
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="font-bold text-lg">Ranking de Experts</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded"
            data-testid="button-close-menu"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {rankings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum expert salvo ainda. Experts são salvos automaticamente após análise.
            </p>
          ) : (
            <>
              {qualifiedRankings.length > 0 && (
                <RankingSection
                  title="QUALIFICADOS"
                  count={qualifiedRankings.length}
                  experts={qualifiedRankings}
                  onDelete={onDelete}
                  variant="qualified"
                />
              )}
              
              {disqualifiedRankings.length > 0 && (
                <RankingSection
                  title="DESQUALIFICADOS"
                  count={disqualifiedRankings.length}
                  experts={disqualifiedRankings}
                  onDelete={onDelete}
                  variant="disqualified"
                />
              )}
            </>
          )}
        </div>
        
        <div className="p-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            {rankings.length} expert{rankings.length !== 1 ? "s" : ""} | 
            <span className="text-green-400"> {qualifiedRankings.length} qualificado{qualifiedRankings.length !== 1 ? "s" : ""}</span> |
            <span className="text-red-400"> {disqualifiedRankings.length} desqualificado{disqualifiedRankings.length !== 1 ? "s" : ""}</span>
          </p>
        </div>
      </motion.div>
    </>
  );
});

const RankingSection = memo(({ 
  title, 
  count, 
  experts, 
  onDelete, 
  variant 
}: {
  title: string;
  count: number;
  experts: ExpertRanking[];
  onDelete: (id: string) => void;
  variant: "qualified" | "disqualified";
}) => {
  const isQualified = variant === "qualified";
  const Icon = isQualified ? Check : XIcon;
  const colorClass = isQualified ? "green" : "red";

  return (
    <div className="space-y-2">
      <h3 className={`text-xs font-bold text-${colorClass}-400 flex items-center gap-2`}>
        <Icon className="w-3 h-3" />
        {title} ({count})
      </h3>
      {experts
        .sort((a, b) => b.score - a.score)
        .map((expert, index) => (
          <div 
            key={expert.id} 
            className={`p-3 rounded-lg border border-${colorClass}-500/30 bg-${colorClass}-500/5 ${!isQualified && 'opacity-75'}`}
            data-testid={`ranking-item-${expert.id}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {isQualified && (
                  <span className={`text-lg font-bold text-${colorClass}-400`}>#{index + 1}</span>
                )}
                <div>
                  <p className="font-semibold text-sm">{expert.instagramHandle}</p>
                  <p className="text-xs text-muted-foreground">{expert.nicho || "Nicho não identificado"}</p>
                </div>
              </div>
              <button 
                onClick={() => onDelete(expert.id)}
                className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive"
                data-testid={`button-delete-ranking-${expert.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className={`text-xs font-bold px-2 py-0.5 rounded bg-${colorClass}-500/20 text-${colorClass}-400`}>
                {expert.score}/100
              </div>
              <span className={`text-xs text-${colorClass}-400`}>
                {isQualified ? "QUALIFICADO" : "NÃO QUALIFICADO"}
              </span>
            </div>
            {expert.seguidores && (
              <p className="text-xs text-muted-foreground mt-1">
                {expert.seguidores.toLocaleString()} seguidores
              </p>
            )}
          </div>
        ))}
    </div>
  );
});

RankingSidebar.displayName = "RankingSidebar";
RankingSection.displayName = "RankingSection";
