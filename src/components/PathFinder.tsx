import { useState } from "react";
import { SocialGraph, findShortestPath } from "@/lib/graph";
import { Button } from "@/components/ui/button";
import { Route, ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PathFinderProps {
  graph: SocialGraph;
  userId: string;
  onPathFound: (path: string[]) => void;
}

const PathFinder = ({ graph, userId, onPathFound }: PathFinderProps) => {
  const [from, setFrom] = useState(userId);
  const [to, setTo] = useState("");
  const [result, setResult] = useState<string[] | null | undefined>(undefined);

  const people = Array.from(graph.people.values());

  const handleFind = () => {
    if (!from || !to) return;
    const path = findShortestPath(graph, from, to);
    setResult(path);
    if (path) onPathFound(path);
  };

  const handleClear = () => {
    setResult(undefined);
    onPathFound([]);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <h3 className="font-semibold text-card-foreground flex items-center gap-2">
        <Route className="h-5 w-5 text-primary" />
        Path Finder
      </h3>
      <p className="text-xs text-muted-foreground">
        Find the shortest connection between any two people.
      </p>

      <div className="flex gap-2 items-end flex-wrap">
        <div className="flex-1 min-w-[120px]">
          <label className="text-xs text-muted-foreground mb-1 block">From</label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {people.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mb-2.5" />

        <div className="flex-1 min-w-[120px]">
          <label className="text-xs text-muted-foreground mb-1 block">To</label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {people.filter((p) => p.id !== from).map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button size="sm" onClick={handleFind} disabled={!to} className="mb-0.5">
          Find
        </Button>
        {result !== undefined && (
          <Button size="sm" variant="ghost" onClick={handleClear} className="mb-0.5">
            Clear
          </Button>
        )}
      </div>

      {result !== undefined && (
        <div className="text-sm pt-1">
          {result === null ? (
            <p className="text-destructive">No path found — they're in separate networks.</p>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-muted-foreground">Path ({result.length - 1} hop{result.length - 1 !== 1 ? "s" : ""}):</span>
              {result.map((id, i) => {
                const person = graph.people.get(id);
                return (
                  <span key={id} className="flex items-center gap-1">
                    <span className="font-medium text-card-foreground">{person?.name || id}</span>
                    {i < result.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PathFinder;
