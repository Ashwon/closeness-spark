export interface Person {
  id: string;
  name: string;
  isVip: boolean;
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

/**
 * BFS to find 2nd-degree connections.
 * Closeness score: each mutual friend = 1 point, VIP mutual = 5 points.
 */
export function getSuggestions(graph: SocialGraph, userId: string): FriendSuggestion[] {
  const directFriends = graph.adjacency.get(userId);
  if (!directFriends) return [];

  const suggestions = new Map<string, Person[]>(); // candidateId -> mutualFriends[]

  // BFS depth-2: iterate each direct friend, then their friends
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

// Seed data
export function createSeededGraph(): SocialGraph {
  const graph = createGraph();

  const people: Person[] = [
    { id: "you", name: "You", isVip: false },
    { id: "alice", name: "Alice Chen", isVip: true },
    { id: "bob", name: "Bob Martinez", isVip: false },
    { id: "carol", name: "Carol Kim", isVip: false },
    { id: "dave", name: "Dave Wilson", isVip: true },
    { id: "eve", name: "Eve Johnson", isVip: false },
    { id: "frank", name: "Frank Lee", isVip: false },
    { id: "grace", name: "Grace Patel", isVip: false },
    { id: "hank", name: "Hank Brown", isVip: true },
    { id: "ivy", name: "Ivy Zhang", isVip: false },
  ];

  people.forEach((p) => addPerson(graph, p));

  // Your direct friends
  addFriendship(graph, "you", "alice");
  addFriendship(graph, "you", "bob");
  addFriendship(graph, "you", "carol");

  // 2nd-degree connections
  addFriendship(graph, "alice", "dave");
  addFriendship(graph, "alice", "eve");
  addFriendship(graph, "bob", "dave");
  addFriendship(graph, "bob", "frank");
  addFriendship(graph, "carol", "eve");
  addFriendship(graph, "carol", "grace");
  addFriendship(graph, "dave", "hank");
  addFriendship(graph, "eve", "ivy");
  addFriendship(graph, "frank", "grace");

  return graph;
}
