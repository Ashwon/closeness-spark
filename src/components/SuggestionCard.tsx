import { FriendSuggestion } from "@/lib/graph";
import { Crown, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SuggestionCardProps {
  suggestion: FriendSuggestion;
  onAdd: (id: string) => void;
}

const SuggestionCard = ({ suggestion, onAdd }: SuggestionCardProps) => {
  const { person, closenessScore, mutualFriends } = suggestion;
  const isHighScore = closenessScore >= 5;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg">
      {/* Score badge */}
      <div className="absolute right-3 top-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
            isHighScore
              ? "bg-score-high/15 text-score-high"
              : "bg-score/15 text-score"
          }`}
        >
          {closenessScore}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
          {person.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="font-semibold text-card-foreground">{person.name}</p>
          {person.isVip && (
            <Badge className="mt-1 bg-vip text-vip-foreground text-xs">
              <Crown className="mr-1 h-3 w-3" /> VIP
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        <span>
          {mutualFriends.map((mf) => (
            <span key={mf.id}>
              {mf.name}
              {mf.isVip && <Crown className="ml-0.5 inline h-3 w-3 text-vip" />}
              {mutualFriends.indexOf(mf) < mutualFriends.length - 1 ? ", " : ""}
            </span>
          ))}
        </span>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Closeness: {closenessScore} pts ({mutualFriends.length} mutual{mutualFriends.length !== 1 ? "s" : ""})
      </p>

      <Button
        size="sm"
        className="mt-4 w-full bg-primary text-primary-foreground"
        onClick={() => onAdd(person.id)}
      >
        <UserPlus className="mr-2 h-4 w-4" /> Add Friend
      </Button>
    </div>
  );
};

export default SuggestionCard;
