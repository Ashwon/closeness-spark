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

  const friends = useMemo(() => getFriends(graph, userId), [graph, userId]);
  const suggestions = useMemo(() => getSuggestions(graph, userId), [graph, userId]);
  const allPeople = useMemo(() => Array.from(graph.people.values()).filter((p) => p.id !== userId), [graph, userId]);

  const addNewPerson = useCallback(
    (name: string, isVip: boolean, connectTo: string[]) => {
      const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
      const person: Person = {
        id, name, isVip,
        traits: { humor: 5, empathy: 5, energy: 5, reliability: 5, openness: 5 },
      };
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

  return { graph, friends, suggestions, allPeople, addNewPerson, toggleVip, addFriend, removeFriend };
}
