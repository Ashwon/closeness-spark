import { useState } from "react";
import { Person } from "@/lib/graph";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Crown, X } from "lucide-react";

interface AddPersonFormProps {
  allPeople: Person[];
  onAdd: (name: string, isVip: boolean, connectTo: string[]) => void;
}

const AddPersonForm = ({ allPeople, onAdd }: AddPersonFormProps) => {
  const [name, setName] = useState("");
  const [isVip, setIsVip] = useState(false);
  const [connectTo, setConnectTo] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), isVip, connectTo);
    setName("");
    setIsVip(false);
    setConnectTo([]);
    setOpen(false);
  };

  const toggleConnection = (id: string) => {
    setConnectTo((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground">
        <UserPlus className="mr-2 h-4 w-4" /> Add New Person
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-card-foreground">Add New Person</h3>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Input
        placeholder="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-background"
        autoFocus
      />

      <label className="flex items-center gap-2 text-sm text-card-foreground cursor-pointer">
        <Checkbox
          checked={isVip}
          onCheckedChange={(v) => setIsVip(v === true)}
        />
        <Crown className="h-4 w-4 text-vip" />
        Mark as VIP (5x closeness weight)
      </label>

      <div>
        <p className="text-sm font-medium text-card-foreground mb-2">Connect to:</p>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {allPeople.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <Checkbox
                checked={connectTo.includes(p.id)}
                onCheckedChange={() => toggleConnection(p.id)}
              />
              {p.name}
              {p.isVip && <Crown className="h-3 w-3 text-vip" />}
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={!name.trim()} className="w-full bg-primary text-primary-foreground">
        <UserPlus className="mr-2 h-4 w-4" /> Add to Graph
      </Button>
    </form>
  );
};

export default AddPersonForm;
