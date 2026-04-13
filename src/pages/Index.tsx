import { useState } from "react";
import { useSocialGraph } from "@/hooks/useSocialGraph";
import FriendCard from "@/components/FriendCard";
import SuggestionCard from "@/components/SuggestionCard";
import AddPersonForm from "@/components/AddPersonForm";
import NetworkGraph from "@/components/NetworkGraph";
import SocialDNA from "@/components/SocialDNA";
import PathFinder from "@/components/PathFinder";
import CliqueDetector from "@/components/CliqueDetector";
import InfluenceLeaderboard from "@/components/InfluenceLeaderboard";
import { Users, Sparkles, Crown, LayoutGrid, Network } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { graph, friends, suggestions, allPeople, addNewPerson, toggleVip, addFriend, removeFriend } =
    useSocialGraph("you");
  const [highlightPath, setHighlightPath] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-card-foreground">Social Circle</h1>
              <p className="text-xs text-muted-foreground">Friend Suggester & Network Analyzer</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {friends.length} friends
            </span>
            <span className="flex items-center gap-1">
              <Crown className="h-4 w-4 text-vip" />{" "}
              {allPeople.filter((p) => p.isVip).length} VIPs
            </span>
            <span className="flex items-center gap-1">
              <Network className="h-4 w-4" /> {graph.people.size} nodes
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5">
              <LayoutGrid className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="graph" className="flex items-center gap-1.5">
              <Network className="h-4 w-4" /> Network Graph
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Insights
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid gap-8 lg:grid-cols-5">
              {/* Left: Friends */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Your Friends
                  </h2>
                  <span className="text-sm text-muted-foreground">{friends.length}</span>
                </div>

                <div className="space-y-2">
                  {friends.map((friend) => (
                    <FriendCard
                      key={friend.id}
                      person={friend}
                      onToggleVip={toggleVip}
                      onRemove={removeFriend}
                    />
                  ))}
                  {friends.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No friends yet. Add people and connect!
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <AddPersonForm allPeople={allPeople} onAdd={addNewPerson} />
                </div>
              </div>

              {/* Right: Suggestions */}
              <div className="lg:col-span-3 space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-score-high" />
                  Suggested for You
                </h2>
                <p className="text-sm text-muted-foreground -mt-2">
                  Based on mutual friends. <Crown className="inline h-3.5 w-3.5 text-vip" /> VIP mutuals = 5 pts, regular = 1 pt.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {suggestions.map((s) => (
                    <SuggestionCard key={s.person.id} suggestion={s} onAdd={addFriend} />
                  ))}
                  {suggestions.length === 0 && (
                    <p className="col-span-2 text-center text-sm text-muted-foreground py-8">
                      No suggestions available. Add more people to the graph!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Graph Tab */}
          <TabsContent value="graph" className="space-y-4">
            <PathFinder graph={graph} userId="you" onPathFound={setHighlightPath} />
            <div className="h-[500px]">
              <NetworkGraph
                graph={graph}
                userId="you"
                highlightPath={highlightPath}
              />
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="grid gap-6 lg:grid-cols-2">
              <SocialDNA graph={graph} userId="you" />
              <InfluenceLeaderboard graph={graph} />
              <div className="lg:col-span-2">
                <CliqueDetector graph={graph} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
