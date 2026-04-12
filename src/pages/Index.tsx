import { useState } from "react";
import { useSocialGraph } from "@/hooks/useSocialGraph";

const Index = () => {
  const { friends, suggestions, allPeople, addNewPerson, toggleVip, addFriend, removeFriend, adjacencyJson } =
    useSocialGraph("you");

  const [name, setName] = useState("");
  const [isVip, setIsVip] = useState(false);
  const [connectTo, setConnectTo] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addNewPerson(name.trim(), isVip, connectTo);
    setName("");
    setIsVip(false);
    setConnectTo([]);
  };

  const toggleConnection = (id: string) => {
    setConnectTo((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <h1 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>Social Circle</h1>
      <p style={{ fontSize: 12, color: "#666", marginBottom: 20 }}>Friend suggester — BFS on adjacency list</p>

      {/* Add Connection Form */}
      <div style={{ border: "1px solid #bbb", padding: 16, marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: "bold", marginBottom: 12 }}>Add Connection</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, display: "block", marginBottom: 2 }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ border: "1px solid #bbb", padding: "4px 8px", fontSize: 13, width: "100%", boxSizing: "border-box" as const }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={isVip} onChange={(e) => setIsVip(e.target.checked)} />{" "}
              VIP (5x closeness weight)
            </label>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Connect to:</label>
            <div style={{ maxHeight: 100, overflowY: "auto" as const, border: "1px solid #ddd", padding: 4 }}>
              {allPeople.map((p) => (
                <label key={p.id} style={{ display: "block", fontSize: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={connectTo.includes(p.id)}
                    onChange={() => toggleConnection(p.id)}
                  />{" "}
                  {p.name}{p.isVip ? " [VIP]" : ""}
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            style={{ border: "1px solid #bbb", background: "#000", color: "#fff", padding: "4px 16px", fontSize: 12, cursor: "pointer" }}
          >
            Add to Graph
          </button>
        </form>
      </div>

      {/* Your Friends */}
      <div style={{ border: "1px solid #bbb", padding: 16, marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>Your Friends ({friends.length})</h2>
        {friends.length === 0 && <p style={{ fontSize: 12, color: "#999" }}>None</p>}
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" as const }}>
          <tbody>
            {friends.map((f) => (
              <tr key={f.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "4px 0" }}>
                  {f.name}{f.isVip ? " [VIP]" : ""}
                </td>
                <td style={{ textAlign: "right" as const, padding: "4px 0" }}>
                  <button onClick={() => toggleVip(f.id)} style={{ border: "1px solid #bbb", fontSize: 11, padding: "1px 6px", marginRight: 4, cursor: "pointer", background: "#fff" }}>
                    {f.isVip ? "- VIP" : "+ VIP"}
                  </button>
                  <button onClick={() => removeFriend(f.id)} style={{ border: "1px solid #bbb", fontSize: 11, padding: "1px 6px", cursor: "pointer", background: "#fff" }}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Suggestions */}
      <div style={{ border: "1px solid #bbb", padding: 16, marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: "bold", marginBottom: 4 }}>Suggested ({suggestions.length})</h2>
        <p style={{ fontSize: 11, color: "#999", marginBottom: 8 }}>VIP mutual = 5 pts, regular = 1 pt</p>
        {suggestions.length === 0 && <p style={{ fontSize: 12, color: "#999" }}>No suggestions</p>}
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" as const }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #bbb", textAlign: "left" as const }}>
              <th style={{ padding: "4px 0", fontWeight: "bold" }}>Name</th>
              <th style={{ padding: "4px 0", fontWeight: "bold" }}>Score</th>
              <th style={{ padding: "4px 0", fontWeight: "bold" }}>Mutuals</th>
              <th style={{ padding: "4px 0" }}></th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((s) => (
              <tr key={s.person.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "4px 0" }}>
                  {s.person.name}{s.person.isVip ? " [VIP]" : ""}
                </td>
                <td style={{ padding: "4px 0" }}>{s.closenessScore}</td>
                <td style={{ padding: "4px 0" }}>
                  {s.mutualFriends.map((m) => m.name + (m.isVip ? "*" : "")).join(", ")}
                </td>
                <td style={{ padding: "4px 0", textAlign: "right" as const }}>
                  <button onClick={() => addFriend(s.person.id)} style={{ border: "1px solid #bbb", fontSize: 11, padding: "1px 6px", cursor: "pointer", background: "#fff" }}>
                    Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Developer View */}
      <div style={{ border: "1px solid #bbb", padding: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>Developer View — Adjacency List</h2>
        <pre style={{ fontSize: 11, background: "#f5f5f5", border: "1px solid #ddd", padding: 12, overflow: "auto", maxHeight: 300, whiteSpace: "pre-wrap" as const }}>
          {adjacencyJson}
        </pre>
      </div>
    </div>
  );
};

export default Index;
