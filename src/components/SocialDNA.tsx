import { getSocialDNA, SocialGraph } from "@/lib/graph";
import { Dna, Zap, Globe, Triangle } from "lucide-react";

interface SocialDNAProps {
  graph: SocialGraph;
  userId: string;
}

const SocialDNA = ({ graph, userId }: SocialDNAProps) => {
  const dna = getSocialDNA(graph, userId);

  const metrics = [
    {
      icon: <Dna className="h-4 w-4" />,
      label: "VIP Ratio",
      value: `${Math.round(dna.vipRatio * 100)}%`,
      description: "Percentage of VIP connections",
      bar: dna.vipRatio,
      color: "bg-vip",
    },
    {
      icon: <Zap className="h-4 w-4" />,
      label: "Avg Friend Connections",
      value: dna.avgFriendConnections.toFixed(1),
      description: "How connected your friends are",
      bar: Math.min(dna.avgFriendConnections / 8, 1),
      color: "bg-primary",
    },
    {
      icon: <Globe className="h-4 w-4" />,
      label: "Network Reach",
      value: `${dna.networkReach} people`,
      description: "People within 2 hops",
      bar: Math.min(dna.networkReach / 20, 1),
      color: "bg-accent",
    },
    {
      icon: <Triangle className="h-4 w-4" />,
      label: "Clustering",
      value: `${Math.round(dna.clusterCoeff * 100)}%`,
      description: "How much your friends know each other",
      bar: dna.clusterCoeff,
      color: "bg-score-high",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="font-semibold text-card-foreground flex items-center gap-2">
        <Dna className="h-5 w-5 text-primary" />
        Your Social DNA
      </h3>
      <p className="text-xs text-muted-foreground">
        A fingerprint of your network's structure and composition.
      </p>

      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                {m.icon} {m.label}
              </span>
              <span className="font-semibold text-card-foreground">{m.value}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${m.color}`}
                style={{ width: `${Math.max(m.bar * 100, 4)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">{m.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialDNA;
