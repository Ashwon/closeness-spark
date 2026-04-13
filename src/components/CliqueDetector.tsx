import { detectCliques, SocialGraph } from "@/lib/graph";
import { useMemo } from "react";
import { Network } from "lucide-react";

interface CliqueDetectorProps {
  graph: SocialGraph;
}

const CliqueDetector = ({ graph }: CliqueDetectorProps) => {
  const cliques = useMemo(() => detectCliques(graph), [graph]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <h3 className="font-semibold text-card-foreground flex items-center gap-2">
        <Network className="h-5 w-5 text-accent" />
        Inner Circles (Cliques)
      </h3>
      <p className="text-xs text-muted-foreground">
        Groups where everyone knows everyone — detected automatically via triangle enumeration.
      </p>

      {cliques.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No cliques detected yet.</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {cliques.map((clique, i) => {
            const names = clique
              .map((id) => graph.people.get(id))
              .filter(Boolean)
              .map((p) => p!.name);
            const hasVip = clique.some((id) => graph.people.get(id)?.isVip);

            return (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  hasVip
                    ? "bg-vip/10 border border-vip/20"
                    : "bg-muted/50 border border-border"
                }`}
              >
                <span className="font-mono text-xs text-muted-foreground w-5">#{i + 1}</span>
                <span className="text-card-foreground">{names.join(" · ")}</span>
                {hasVip && (
                  <span className="ml-auto text-[10px] font-medium text-vip">★ VIP</span>
                )}
              </div>
            );
          })}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">
        Found {cliques.length} triangle{cliques.length !== 1 ? "s" : ""} in the graph.
      </p>
    </div>
  );
};

export default CliqueDetector;
