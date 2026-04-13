import { SocialGraph, getInfluenceScore } from "@/lib/graph";
import { useMemo } from "react";
import { Trophy, Crown } from "lucide-react";

interface InfluenceLeaderboardProps {
  graph: SocialGraph;
}

const InfluenceLeaderboard = ({ graph }: InfluenceLeaderboardProps) => {
  const rankings = useMemo(() => {
    const scores: { id: string; name: string; score: number; isVip: boolean }[] = [];
    graph.people.forEach((person) => {
      scores.push({
        id: person.id,
        name: person.name,
        score: getInfluenceScore(graph, person.id),
        isVip: person.isVip,
      });
    });
    return scores.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [graph]);

  const maxScore = rankings[0]?.score || 1;

  const medalColors = ["text-vip", "text-muted-foreground", "text-score"];

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <h3 className="font-semibold text-card-foreground flex items-center gap-2">
        <Trophy className="h-5 w-5 text-vip" />
        Influence Leaderboard
      </h3>
      <p className="text-xs text-muted-foreground">
        Ranked by weighted degree centrality — connections × their reach.
      </p>

      <div className="space-y-1.5">
        {rankings.map((r, i) => (
          <div key={r.id} className="flex items-center gap-2 text-sm">
            <span className={`w-5 text-center font-bold ${i < 3 ? medalColors[i] : "text-muted-foreground"}`}>
              {i < 3 ? ["🥇", "🥈", "🥉"][i] : `${i + 1}`}
            </span>
            <span className="flex-1 text-card-foreground truncate">
              {r.name}
              {r.isVip && <Crown className="inline ml-1 h-3 w-3 text-vip" />}
            </span>
            <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(r.score / maxScore) * 100}%` }}
              />
            </div>
            <span className="w-10 text-right font-mono text-xs text-muted-foreground">
              {r.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfluenceLeaderboard;
