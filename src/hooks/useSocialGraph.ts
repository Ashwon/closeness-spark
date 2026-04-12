import { useState, useCallback, useMemo } from "react";
import {
  SocialGraph,
  Person,
  createSeededGraph,
  addPerson,
  addFriendship,
  removeFriendship,
  getFriends,
  getSuggestions,
} from "@/lib/graph";

export function useSocialGraph(userId = "you") {
  const [graph, setGraph] = useState<SocialGraph>(() => createSeededGraph());
  const [, setTick] = useState(0);
  const rerender = () => setTick((t) => t + 1);

  const friends = useMemo(() => getFriends(graph, userId), [graph, userId]);
  const suggestions = useMemo(() => getSuggestions(graph, userId), [graph, userId]);
  const allPeople = useMemo(() => Array.from(graph.people.values()).filter((p) => p.id !== userId), [graph, userId]);

  const addNewPerson = useCallback(
    (name: string, isVip: boolean, connectTo: string[]) => {
      const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
      const person: Person = { id, name, isVip };
      addPerson(graph, person);
      connectTo.forEach((friendId) => addFriendship(graph, id, friendId));
      setGraph({ ...graph });
    },
    [graph]
  );

  const toggleVip = useCallback(
    (personId: string) => {
      const person = graph.people.get(personId);
      if (person) {
        person.isVip = !person.isVip;
        setGraph({ ...graph });
      }
    },
    [graph]
  );

  const addFriend = useCallback(
    (personId: string) => {
      addFriendship(graph, userId, personId);
      setGraph({ ...graph });
    },
    [graph, userId]
  );

  const removeFriend = useCallback(
    (personId: string) => {
      removeFriendship(graph, userId, personId);
      setGraph({ ...graph });
    },
    [graph, userId]
  );

  // Build adjacency JSON for developer view
  const adjacencyJson = useMemo(() => {
    const obj: Record<string, string[]> = {};
    for (const [id, neighbors] of graph.adjacency) {
      const person = graph.people.get(id);
      const label = person ? `${person.name}${person.isVip ? " [VIP]" : ""}` : id;
      obj[label] = Array.from(neighbors).map((nId) => {
        const np = graph.people.get(nId);
        return np ? np.name : nId;
      });
    }
    return JSON.stringify(obj, null, 2);
  }, [graph]);

  return { friends, suggestions, allPeople, addNewPerson, toggleVip, addFriend, removeFriend, adjacencyJson };
}
