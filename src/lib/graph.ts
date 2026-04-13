export interface PersonTraits {
  humor: number;       // 0-10
  empathy: number;     // 0-10
  energy: number;      // 0-10
  reliability: number; // 0-10
  openness: number;    // 0-10
}

export interface Person {
  id: string;
  name: string;
  isVip: boolean;
  avatar?: string;
  traits: PersonTraits;
}

export interface FriendSuggestion {
  person: Person;
  closenessScore: number;
  mutualFriends: Person[];
}

export interface SocialGraph {
  people: Map<string, Person>;
  adjacency: Map<string, Set<string>>;
}

export function createGraph(): SocialGraph {
  return { people: new Map(), adjacency: new Map() };
}

export function addPerson(graph: SocialGraph, person: Person): void {
  graph.people.set(person.id, person);
  if (!graph.adjacency.has(person.id)) {
    graph.adjacency.set(person.id, new Set());
  }
}

export function addFriendship(graph: SocialGraph, idA: string, idB: string): void {
  graph.adjacency.get(idA)?.add(idB);
  graph.adjacency.get(idB)?.add(idA);
}

export function removeFriendship(graph: SocialGraph, idA: string, idB: string): void {
  graph.adjacency.get(idA)?.delete(idB);
  graph.adjacency.get(idB)?.delete(idA);
}

export function getFriends(graph: SocialGraph, personId: string): Person[] {
  const friendIds = graph.adjacency.get(personId);
  if (!friendIds) return [];
  return Array.from(friendIds)
    .map((id) => graph.people.get(id))
    .filter(Boolean) as Person[];
}

export function getSuggestions(graph: SocialGraph, userId: string): FriendSuggestion[] {
  const directFriends = graph.adjacency.get(userId);
  if (!directFriends) return [];

  const suggestions = new Map<string, Person[]>();

  for (const friendId of directFriends) {
    const friendsOfFriend = graph.adjacency.get(friendId);
    if (!friendsOfFriend) continue;

    for (const candidateId of friendsOfFriend) {
      if (candidateId === userId || directFriends.has(candidateId)) continue;

      const mutualFriend = graph.people.get(friendId);
      if (!mutualFriend) continue;

      if (!suggestions.has(candidateId)) {
        suggestions.set(candidateId, []);
      }
      const existing = suggestions.get(candidateId)!;
      if (!existing.find((p) => p.id === friendId)) {
        existing.push(mutualFriend);
      }
    }
  }

  const results: FriendSuggestion[] = [];
  for (const [candidateId, mutualFriends] of suggestions) {
    const person = graph.people.get(candidateId);
    if (!person) continue;

    const closenessScore = mutualFriends.reduce(
      (sum, mf) => sum + (mf.isVip ? 5 : 1),
      0
    );

    results.push({ person, closenessScore, mutualFriends });
  }

  return results.sort((a, b) => b.closenessScore - a.closenessScore);
}

/** Find shortest path between two people using BFS */
export function findShortestPath(graph: SocialGraph, fromId: string, toId: string): string[] | null {
  if (fromId === toId) return [fromId];
  const visited = new Set<string>();
  const queue: string[][] = [[fromId]];
  visited.add(fromId);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];
    const neighbors = graph.adjacency.get(current);
    if (!neighbors) continue;

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;
      const newPath = [...path, neighbor];
      if (neighbor === toId) return newPath;
      visited.add(neighbor);
      queue.push(newPath);
    }
  }
  return null;
}

/** Calculate influence score: weighted degree centrality */
export function getInfluenceScore(graph: SocialGraph, personId: string): number {
  const friends = graph.adjacency.get(personId);
  if (!friends) return 0;
  let score = 0;
  for (const fId of friends) {
    const friend = graph.people.get(fId);
    const friendConnections = graph.adjacency.get(fId)?.size || 0;
    score += (friend?.isVip ? 3 : 1) * (1 + friendConnections * 0.2);
  }
  return Math.round(score * 10) / 10;
}

/** Detect cliques (groups where everyone knows everyone) - finds triangles and larger */
export function detectCliques(graph: SocialGraph): string[][] {
  const cliques: string[][] = [];
  const people = Array.from(graph.people.keys());

  // Find all triangles
  for (let i = 0; i < people.length; i++) {
    for (let j = i + 1; j < people.length; j++) {
      if (!graph.adjacency.get(people[i])?.has(people[j])) continue;
      for (let k = j + 1; k < people.length; k++) {
        if (
          graph.adjacency.get(people[i])?.has(people[k]) &&
          graph.adjacency.get(people[j])?.has(people[k])
        ) {
          cliques.push([people[i], people[j], people[k]]);
        }
      }
    }
  }
  return cliques;
}

/** Social DNA: distribution of connection types */
export function getSocialDNA(graph: SocialGraph, userId: string): {
  vipRatio: number;
  avgFriendConnections: number;
  networkReach: number;
  clusterCoeff: number;
} {
  const friends = graph.adjacency.get(userId);
  if (!friends || friends.size === 0) {
    return { vipRatio: 0, avgFriendConnections: 0, networkReach: 0, clusterCoeff: 0 };
  }

  const friendArr = Array.from(friends);
  const vipCount = friendArr.filter((id) => graph.people.get(id)?.isVip).length;
  const vipRatio = vipCount / friendArr.length;

  const avgFriendConnections =
    friendArr.reduce((sum, id) => sum + (graph.adjacency.get(id)?.size || 0), 0) / friendArr.length;

  // Network reach: unique people within 2 hops
  const reached = new Set<string>();
  for (const fId of friends) {
    reached.add(fId);
    const fof = graph.adjacency.get(fId);
    if (fof) fof.forEach((id) => { if (id !== userId) reached.add(id); });
  }
  const networkReach = reached.size;

  // Clustering coefficient
  let triangles = 0;
  let possibleTriangles = 0;
  for (let i = 0; i < friendArr.length; i++) {
    for (let j = i + 1; j < friendArr.length; j++) {
      possibleTriangles++;
      if (graph.adjacency.get(friendArr[i])?.has(friendArr[j])) {
        triangles++;
      }
    }
  }
  const clusterCoeff = possibleTriangles > 0 ? triangles / possibleTriangles : 0;

  return { vipRatio, avgFriendConnections, networkReach, clusterCoeff };
}

export interface LikeabilityResult {
  score: number; // 0-100
  breakdown: { trait: string; label: string; yourAvg: number; friendAvg: number; impact: number }[];
  tips: { priority: "high" | "medium" | "low"; trait: string; message: string }[];
  archetype: string;
}

const TRAIT_LABELS: Record<keyof PersonTraits, string> = {
  humor: "Humor",
  empathy: "Empathy",
  energy: "Energy",
  reliability: "Reliability",
  openness: "Openness",
};

/** Estimate likeability based on your traits influenced by your friends' traits */
export function getLikeability(graph: SocialGraph, userId: string): LikeabilityResult {
  const user = graph.people.get(userId);
  if (!user) return { score: 50, breakdown: [], tips: [], archetype: "Unknown" };

  const friends = getFriends(graph, userId);
  if (friends.length === 0) {
    return { score: 30, breakdown: [], tips: [{ priority: "high", trait: "connections", message: "Start by making friends! Likeability grows through connections." }], archetype: "The Newcomer" };
  }

  const traitKeys: (keyof PersonTraits)[] = ["humor", "empathy", "energy", "reliability", "openness"];

  // Your effective traits = your base + 30% influence from friends' average
  const friendAvgs: Record<string, number> = {};
  const effectiveTraits: Record<string, number> = {};
  const breakdown: LikeabilityResult["breakdown"] = [];

  for (const key of traitKeys) {
    const friendAvg = friends.reduce((s, f) => s + f.traits[key], 0) / friends.length;
    friendAvgs[key] = friendAvg;
    const effective = user.traits[key] * 0.7 + friendAvg * 0.3;
    effectiveTraits[key] = effective;

    const impact = Math.round(effective * 10) / 10;
    breakdown.push({
      trait: key,
      label: TRAIT_LABELS[key],
      yourAvg: user.traits[key],
      friendAvg: Math.round(friendAvg * 10) / 10,
      impact,
    });
  }

  // Score: weighted sum (empathy and reliability matter most)
  const weights = { humor: 1, empathy: 1.4, energy: 0.8, reliability: 1.3, openness: 1 };
  const maxPossible = traitKeys.reduce((s, k) => s + 10 * weights[k], 0);
  const rawScore = traitKeys.reduce((s, k) => s + effectiveTraits[k] * weights[k], 0);
  const score = Math.round((rawScore / maxPossible) * 100);

  // Generate coaching tips
  const tips: LikeabilityResult["tips"] = [];

  // Find weakest traits
  const sorted = [...breakdown].sort((a, b) => a.impact - b.impact);

  for (const item of sorted.slice(0, 2)) {
    if (item.impact < 6) {
      const friendDiff = item.friendAvg - item.yourAvg;
      if (friendDiff < -1) {
        tips.push({
          priority: "high",
          trait: item.label,
          message: `Your ${item.label.toLowerCase()} is low (${item.yourAvg}/10) and your friends don't compensate (avg ${item.friendAvg}). Befriend people high in ${item.label.toLowerCase()} to boost your social perception.`,
        });
      } else {
        tips.push({
          priority: "medium",
          trait: item.label,
          message: `Your ${item.label.toLowerCase()} could improve (${item.yourAvg}/10). Your friends help a bit (avg ${item.friendAvg}), but working on this yourself will have the biggest impact.`,
        });
      }
    }
  }

  // Check friend diversity
  const traitVariance = traitKeys.reduce((s, k) => {
    const vals = friends.map((f) => f.traits[k]);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return s + vals.reduce((a, v) => a + (v - avg) ** 2, 0) / vals.length;
  }, 0) / traitKeys.length;

  if (traitVariance < 2) {
    tips.push({
      priority: "medium",
      trait: "Diversity",
      message: "Your friends are very similar to each other. Diversifying your circle with different personality types would make you more adaptable and well-rounded.",
    });
  }

  // VIP friend suggestion
  const vipFriends = friends.filter((f) => f.isVip);
  if (vipFriends.length === 0) {
    tips.push({
      priority: "low",
      trait: "Status",
      message: "You have no VIP connections. VIPs tend to have stronger trait profiles — befriending one could elevate your network quality.",
    });
  }

  // Check balance
  const highTraits = breakdown.filter((b) => b.impact >= 7);
  const lowTraits = breakdown.filter((b) => b.impact < 5);
  if (highTraits.length > 0 && lowTraits.length > 0) {
    tips.push({
      priority: "low",
      trait: "Balance",
      message: `You excel in ${highTraits.map((t) => t.label.toLowerCase()).join(", ")} but lag in ${lowTraits.map((t) => t.label.toLowerCase()).join(", ")}. Balance creates lasting impressions.`,
    });
  }

  // Archetype
  const top = [...breakdown].sort((a, b) => b.impact - a.impact)[0];
  const archetypes: Record<string, string> = {
    humor: "The Entertainer 🎭",
    empathy: "The Empath 💗",
    energy: "The Energizer ⚡",
    reliability: "The Rock 🪨",
    openness: "The Explorer 🌍",
  };
  const archetype = archetypes[top.trait] || "The Balanced One ⚖️";

  return { score, breakdown, tips, archetype };
}

// Seed data - expanded
export function createSeededGraph(): SocialGraph {
  const graph = createGraph();

  const people: Person[] = [
    { id: "you", name: "You", isVip: false, traits: { humor: 6, empathy: 5, energy: 6, reliability: 7, openness: 6 } },
    { id: "alice", name: "Alice Chen", isVip: true, traits: { humor: 8, empathy: 9, energy: 7, reliability: 9, openness: 8 } },
    { id: "bob", name: "Bob Martinez", isVip: false, traits: { humor: 9, empathy: 5, energy: 9, reliability: 6, openness: 7 } },
    { id: "carol", name: "Carol Kim", isVip: false, traits: { humor: 6, empathy: 8, energy: 5, reliability: 8, openness: 9 } },
    { id: "dave", name: "Dave Wilson", isVip: true, traits: { humor: 7, empathy: 6, energy: 8, reliability: 7, openness: 5 } },
    { id: "eve", name: "Eve Johnson", isVip: false, traits: { humor: 5, empathy: 9, energy: 4, reliability: 9, openness: 7 } },
    { id: "frank", name: "Frank Lee", isVip: false, traits: { humor: 8, empathy: 4, energy: 8, reliability: 5, openness: 6 } },
    { id: "grace", name: "Grace Patel", isVip: false, traits: { humor: 6, empathy: 7, energy: 6, reliability: 8, openness: 10 } },
    { id: "hank", name: "Hank Brown", isVip: true, traits: { humor: 4, empathy: 6, energy: 5, reliability: 10, openness: 4 } },
    { id: "ivy", name: "Ivy Zhang", isVip: false, traits: { humor: 7, empathy: 8, energy: 7, reliability: 7, openness: 8 } },
    { id: "jack", name: "Jack Rivera", isVip: false, traits: { humor: 9, empathy: 6, energy: 10, reliability: 5, openness: 7 } },
    { id: "kate", name: "Kate Murphy", isVip: true, traits: { humor: 7, empathy: 8, energy: 6, reliability: 9, openness: 6 } },
    { id: "leo", name: "Leo Thompson", isVip: false, traits: { humor: 6, empathy: 5, energy: 7, reliability: 6, openness: 8 } },
    { id: "mia", name: "Mia Garcia", isVip: false, traits: { humor: 8, empathy: 9, energy: 6, reliability: 7, openness: 9 } },
    { id: "noah", name: "Noah Davis", isVip: false, traits: { humor: 5, empathy: 7, energy: 5, reliability: 8, openness: 5 } },
    { id: "olivia", name: "Olivia Scott", isVip: true, traits: { humor: 7, empathy: 7, energy: 8, reliability: 8, openness: 7 } },
    { id: "pete", name: "Pete Adams", isVip: false, traits: { humor: 9, empathy: 4, energy: 9, reliability: 4, openness: 6 } },
    { id: "quinn", name: "Quinn Taylor", isVip: false, traits: { humor: 6, empathy: 8, energy: 5, reliability: 7, openness: 9 } },
  ];

  people.forEach((p) => addPerson(graph, p));

  // Your direct friends
  addFriendship(graph, "you", "alice");
  addFriendship(graph, "you", "bob");
  addFriendship(graph, "you", "carol");
  addFriendship(graph, "you", "jack");

  // 2nd-degree connections
  addFriendship(graph, "alice", "dave");
  addFriendship(graph, "alice", "eve");
  addFriendship(graph, "alice", "kate");
  addFriendship(graph, "bob", "dave");
  addFriendship(graph, "bob", "frank");
  addFriendship(graph, "bob", "leo");
  addFriendship(graph, "carol", "eve");
  addFriendship(graph, "carol", "grace");
  addFriendship(graph, "carol", "mia");
  addFriendship(graph, "jack", "kate");
  addFriendship(graph, "jack", "noah");

  // 3rd-degree and deeper connections
  addFriendship(graph, "dave", "hank");
  addFriendship(graph, "dave", "olivia");
  addFriendship(graph, "eve", "ivy");
  addFriendship(graph, "eve", "mia");
  addFriendship(graph, "frank", "grace");
  addFriendship(graph, "frank", "pete");
  addFriendship(graph, "grace", "quinn");
  addFriendship(graph, "hank", "olivia");
  addFriendship(graph, "kate", "olivia");
  addFriendship(graph, "leo", "noah");
  addFriendship(graph, "leo", "pete");
  addFriendship(graph, "mia", "quinn");
  addFriendship(graph, "noah", "quinn");

  // Some cross-connections for interesting cliques
  addFriendship(graph, "alice", "bob"); // triangle with you
  addFriendship(graph, "dave", "kate");
  addFriendship(graph, "frank", "leo");

  return graph;
}
