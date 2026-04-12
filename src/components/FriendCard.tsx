import { Person } from "@/lib/graph";
import { Crown, UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FriendCardProps {
  person: Person;
  onToggleVip: (id: string) => void;
  onRemove: (id: string) => void;
}

const FriendCard = ({ person, onToggleVip, onRemove }: FriendCardProps) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {person.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="font-medium text-card-foreground">{person.name}</p>
          {person.isVip && (
            <Badge className="mt-1 bg-vip text-vip-foreground text-xs">
              <Crown className="mr-1 h-3 w-3" /> VIP
            </Badge>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleVip(person.id)}
          className={person.isVip ? "text-vip" : "text-muted-foreground"}
          title={person.isVip ? "Remove VIP" : "Make VIP"}
        >
          <Crown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(person.id)}
          className="text-destructive/70 hover:text-destructive"
        >
          <UserMinus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FriendCard;
