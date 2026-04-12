import { useState } from "react";

// ============================================================
// DSA LAB: Social Circle — Friend Suggester using BFS
// ============================================================

// -- The VIP list. Connections through these nodes score 5x --
const DEFAULT_VIPS = ["alice", "charlie"];

// -- Seed data: adjacency list as a plain object --
function createInitialGraph(): Record<string, string[]> {
  return {
    you: ["alice", "bob"],
    alice: ["you", "charlie", "diana"],
    bob: ["you", "eve"],
    charlie: ["alice", "frank"],
    diana: ["alice"],
    eve: ["bob", "frank"],
    frank: ["charlie", "eve"],
  };
}

// -- BFS to find 2nd-degree connections and score them --
function findSuggestions(
  graph: Record<string, string[]>,
  vips: string[],
  startNode: string
) {
  const directFriends = new Set(graph[startNode] || []);
  const scores: Record<string, { score: number; mutuals: string[] }> = {};

  console.log("--- BFS START from:", startNode, "---");

  // Walk each direct friend (1st degree)
  for (const friend of directFriends) {
    console.log("Visiting", friend);
    const neighbors = graph[friend] || [];

    // Check each neighbor of the friend (2nd degree)
    for (const candidate of neighbors) {
      // Skip self and already-friends
      if (candidate === startNode || directFriends.has(candidate)) continue;

      console.log("Calculating score for", candidate, "via mutual", friend);

      // Check if friend is a VIP
      const points = vips.includes(friend) ? 5 : 1;

      if (!scores[candidate]) {
        scores[candidate] = { score: 0, mutuals: [] };
      }
      scores[candidate].score += points;
      scores[candidate].mutuals.push(friend + (vips.includes(friend) ? "*" : ""));
    }
  }

  // Sort results by highest score
  const results = Object.entries(scores)
    .map(([name, data]) => ({ name, score: data.score, mutuals: data.mutuals }))
    .sort((a, b) => b.score - a.score);

  console.log("--- BFS RESULTS:", results, "---");
  return results;
}

// ============================================================
// React Component — Single file, simple state
// ============================================================

const App = () => {
  const [graph, setGraph] = useState<Record<string, string[]>>(createInitialGraph);
  const [vips, setVips] = useState<string[]>(DEFAULT_VIPS);

  // Form state
  const [newName, setNewName] = useState("");
  const [newIsVip, setNewIsVip] = useState(false);
  const [connectTo, setConnectTo] = useState<string[]>([]);

  // Derive suggestions on every render (simple, no memoization)
  const myFriends = graph["you"] || [];
  const suggestions = findSuggestions(graph, vips, "you");
  const allNodes = Object.keys(graph).filter((n) => n !== "you");

  // -- Add a new person to the graph --
  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const id = newName.trim().toLowerCase();
    if (!id || graph[id]) return;

    const next = { ...graph };
    next[id] = [];

    // Wire up connections both ways
    for (const target of connectTo) {
      next[id] = [...(next[id] || []), target];
      next[target] = [...(next[target] || []), id];
    }

    setGraph(next);
    if (newIsVip) setVips([...vips, id]);

    // Reset form
    setNewName("");
    setNewIsVip(false);
    setConnectTo([]);
  }

  // -- Toggle VIP status --
  function toggleVip(name: string) {
    if (vips.includes(name)) {
      setVips(vips.filter((v) => v !== name));
    } else {
      setVips([...vips, name]);
    }
  }

  // -- Add a suggested person as a direct friend --
  function addFriend(name: string) {
    const next = { ...graph };
    next["you"] = [...(next["you"] || []), name];
    next[name] = [...(next[name] || []), "you"];
    setGraph(next);
  }

  // -- Remove a friend --
  function removeFriend(name: string) {
    const next = { ...graph };
    next["you"] = (next["you"] || []).filter((n) => n !== name);
    next[name] = (next[name] || []).filter((n) => n !== "you");
    setGraph(next);
  }

  // -- Toggle checkbox for "connect to" --
  function toggleConnect(id: string) {
    setConnectTo((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // -- Inline styles (no Tailwind in this file, pure minimal) --
  const S = {
    page: { maxWidth: 640, margin: "0 auto", padding: 20, fontFamily: "Arial, Helvetica, sans-serif" } as const,
    h1: { fontSize: 20, fontWeight: "bold" as const, marginBottom: 4 },
    sub: { fontSize: 12, color: "#666", marginBottom: 20 },
    section: { border: "1px solid #bbb", padding: 16, marginBottom: 20 },
    h2: { fontSize: 14, fontWeight: "bold" as const, marginBottom: 8 },
    label: { fontSize: 12, display: "block" as const, marginBottom: 2 },
    input: { border: "1px solid #bbb", padding: "4px 8px", fontSize: 13, width: "100%", boxSizing: "border-box" as const },
    btn: { border: "1px solid #bbb", background: "#000", color: "#fff", padding: "4px 16px", fontSize: 12, cursor: "pointer" },
    btnSmall: { border: "1px solid #bbb", fontSize: 11, padding: "1px 6px", cursor: "pointer", background: "#fff" },
    table: { width: "100%", fontSize: 12, borderCollapse: "collapse" as const },
    td: { padding: "4px 0", borderBottom: "1px solid #eee" },
    pre: { fontSize: 11, background: "#f5f5f5", border: "1px solid #ddd", padding: 12, overflow: "auto" as const, maxHeight: 300, whiteSpace: "pre-wrap" as const },
  };

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Social Circle — DSA Lab</h1>
      <p style={S.sub}>Friend suggester using BFS on an adjacency list</p>

      {/* ---- ADD CONNECTION FORM ---- */}
      <div style={S.section}>
        <h2 style={S.h2}>Add Connection</h2>
        <form onSubmit={handleAdd}>
          <div style={{ marginBottom: 8 }}>
            <label style={S.label}>Name</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} style={S.input} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={newIsVip} onChange={(e) => setNewIsVip(e.target.checked)} />{" "}
              VIP (5x closeness weight)
            </label>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Connect to:</label>
            <div style={{ maxHeight: 100, overflowY: "auto", border: "1px solid #ddd", padding: 4 }}>
              {allNodes.map((n) => (
                <label key={n} style={{ display: "block", fontSize: 12, cursor: "pointer" }}>
                  <input type="checkbox" checked={connectTo.includes(n)} onChange={() => toggleConnect(n)} />{" "}
                  {n}{vips.includes(n) ? " [VIP]" : ""}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" disabled={!newName.trim()} style={S.btn}>Add to Graph</button>
        </form>
      </div>

      {/* ---- YOUR FRIENDS ---- */}
      <div style={S.section}>
        <h2 style={S.h2}>Your Friends ({myFriends.length})</h2>
        {myFriends.length === 0 && <p style={{ fontSize: 12, color: "#999" }}>None yet</p>}
        <table style={S.table}>
          <tbody>
            {myFriends.map((f) => (
              <tr key={f}>
                <td style={S.td}>{f}{vips.includes(f) ? " [VIP]" : ""}</td>
                <td style={{ ...S.td, textAlign: "right" }}>
                  <button onClick={() => toggleVip(f)} style={S.btnSmall}>{vips.includes(f) ? "- VIP" : "+ VIP"}</button>{" "}
                  <button onClick={() => removeFriend(f)} style={S.btnSmall}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- SUGGESTIONS (BFS results) ---- */}
      <div style={S.section}>
        <h2 style={{ ...S.h2, marginBottom: 4 }}>Suggested ({suggestions.length})</h2>
        <p style={{ fontSize: 11, color: "#999", marginBottom: 8 }}>VIP mutual = 5 pts, regular = 1 pt</p>
        {suggestions.length === 0 && <p style={{ fontSize: 12, color: "#999" }}>No suggestions</p>}
        <table style={S.table}>
          <thead>
            <tr style={{ borderBottom: "1px solid #bbb", textAlign: "left" }}>
              <th style={{ padding: "4px 0", fontWeight: "bold" }}>Name</th>
              <th style={{ padding: "4px 0", fontWeight: "bold" }}>Score</th>
              <th style={{ padding: "4px 0", fontWeight: "bold" }}>Mutuals</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((s) => (
              <tr key={s.name} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "4px 0" }}>{s.name}{vips.includes(s.name) ? " [VIP]" : ""}</td>
                <td style={{ padding: "4px 0" }}>{s.score}</td>
                <td style={{ padding: "4px 0" }}>{s.mutuals.join(", ")}</td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  <button onClick={() => addFriend(s.name)} style={S.btnSmall}>Add</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- DEVELOPER VIEW: raw adjacency list ---- */}
      <div style={S.section}>
        <h2 style={S.h2}>INTERNAL GRAPH DATA — Adjacency List</h2>
        <pre style={S.pre}>{JSON.stringify(graph, null, 2)}</pre>
        <h2 style={{ ...S.h2, marginTop: 12 }}>VIP List</h2>
        <pre style={S.pre}>{JSON.stringify(vips)}</pre>
      </div>
    </div>
  );
};

export default App;
