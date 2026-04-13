import { useMemo } from "react";
import { SocialGraph, getLikeability } from "@/lib/graph";
import { Heart, TrendingUp, AlertTriangle, Lightbulb, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LikeabilityCoachProps {
  graph: SocialGraph;
  userId: string;
}

const LikeabilityCoach = ({ graph, userId }: LikeabilityCoachProps) => {
  const result = useMemo(() => getLikeability(graph, userId), [graph, userId]);

  const scoreColor =
    result.score >= 75
      ? "text-accent"
      : result.score >= 50
      ? "text-vip"
      : "text-destructive";

  const scoreLabel =
    result.score >= 85
      ? "Outstanding"
      : result.score >= 70
      ? "Very Likeable"
      : result.score >= 55
      ? "Average"
      : result.score >= 40
      ? "Needs Work"
      : "Low";

  const priorityColors = {
    high: "border-destructive/30 bg-destructive/5",
    medium: "border-vip/30 bg-vip/5",
    low: "border-border bg-muted/30",
  };

  const priorityIcons = {
    high: <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />,
    medium: <TrendingUp className="h-4 w-4 text-vip shrink-0" />,
    low: <Lightbulb className="h-4 w-4 text-muted-foreground shrink-0" />,
  };

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-card-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            Likeability Score
          </h3>
          <Badge variant="outline" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            {result.archetype}
          </Badge>
        </div>

        <div className="flex items-end gap-3 mb-2">
          <span className={`text-5xl font-bold ${scoreColor}`}>{result.score}</span>
          <span className="text-muted-foreground text-sm mb-1.5">/ 100 — {scoreLabel}</span>
        </div>

        <div className="h-3 rounded-full bg-muted overflow-hidden mb-1">
          <div
            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-destructive via-vip to-accent"
            style={{ width: `${result.score}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          Calculated from your traits weighted by your friends' influence (70% you + 30% circle).
        </p>
      </div>

      {/* Trait Breakdown */}
      {result.breakdown.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h4 className="font-semibold text-card-foreground text-sm">Trait Breakdown</h4>
          <p className="text-xs text-muted-foreground -mt-1">
            How your base traits combine with your friends' influence.
          </p>

          <div className="space-y-3">
            {result.breakdown.map((b) => (
              <div key={b.trait} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-card-foreground font-medium">{b.label}</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>You: <strong className="text-card-foreground">{b.yourAvg}</strong></span>
                    <span>Friends avg: <strong className="text-card-foreground">{b.friendAvg}</strong></span>
                    <span className="font-semibold text-primary">→ {b.impact}</span>
                  </div>
                </div>
                <div className="flex gap-1 h-2">
                  <div className="flex-1 rounded-full bg-muted overflow-hidden" title="Your base">
                    <div
                      className="h-full rounded-full bg-primary/60"
                      style={{ width: `${b.yourAvg * 10}%` }}
                    />
                  </div>
                  <div className="flex-1 rounded-full bg-muted overflow-hidden" title="Friend influence">
                    <div
                      className="h-full rounded-full bg-accent/60"
                      style={{ width: `${b.friendAvg * 10}%` }}
                    />
                  </div>
                </div>
                <div className="flex text-[10px] text-muted-foreground gap-1">
                  <span className="flex-1">Your base</span>
                  <span className="flex-1">Friend influence</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coaching Tips */}
      {result.tips.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h4 className="font-semibold text-card-foreground text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-vip" />
            How to Improve
          </h4>
          <p className="text-xs text-muted-foreground -mt-1">
            Personalized tips based on your network analysis.
          </p>

          <div className="space-y-2">
            {result.tips.map((tip, i) => (
              <div
                key={i}
                className={`flex gap-3 rounded-lg border p-3 ${priorityColors[tip.priority]}`}
              >
                {priorityIcons[tip.priority]}
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-card-foreground">{tip.trait}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {tip.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LikeabilityCoach;
