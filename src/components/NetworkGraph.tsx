import { useRef, useEffect, useState, useCallback } from "react";
import { SocialGraph } from "@/lib/graph";

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isVip: boolean;
  isUser: boolean;
  isFriend: boolean;
  radius: number;
}

interface Edge {
  source: string;
  target: string;
}

interface NetworkGraphProps {
  graph: SocialGraph;
  userId: string;
  highlightPath?: string[];
  onNodeClick?: (id: string) => void;
}

const COLORS = {
  user: "hsl(250, 70%, 55%)",
  vip: "hsl(45, 95%, 55%)",
  friend: "hsl(170, 60%, 45%)",
  normal: "hsl(220, 15%, 70%)",
  edge: "hsl(220, 15%, 82%)",
  edgeHighlight: "hsl(250, 70%, 55%)",
  pathEdge: "hsl(350, 80%, 55%)",
  text: "hsl(220, 30%, 15%)",
  bg: "hsl(220, 20%, 97%)",
};

const NetworkGraph = ({ graph, userId, highlightPath, onNodeClick }: NetworkGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const dragRef = useRef<{ node: Node | null; offsetX: number; offsetY: number }>({
    node: null, offsetX: 0, offsetY: 0,
  });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Initialize nodes and edges from graph
  useEffect(() => {
    const friends = graph.adjacency.get(userId) || new Set();
    const nodes: Node[] = [];
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    graph.people.forEach((person) => {
      const isUser = person.id === userId;
      const isFriend = friends.has(person.id);
      const existing = nodesRef.current.find((n) => n.id === person.id);

      nodes.push({
        id: person.id,
        name: person.name,
        x: existing?.x ?? cx + (Math.random() - 0.5) * 300,
        y: existing?.y ?? cy + (Math.random() - 0.5) * 300,
        vx: 0,
        vy: 0,
        isVip: person.isVip,
        isUser,
        isFriend,
        radius: isUser ? 24 : person.isVip ? 18 : 14,
      });
    });

    const edges: Edge[] = [];
    graph.adjacency.forEach((neighbors, id) => {
      neighbors.forEach((nId) => {
        if (id < nId) edges.push({ source: id, target: nId });
      });
    });

    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [graph, userId, dimensions]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: Math.floor(width), height: Math.floor(Math.max(height, 400)) });
    });
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  // Force simulation + render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const pathSet = new Set<string>();
    if (highlightPath) {
      for (let i = 0; i < highlightPath.length - 1; i++) {
        const a = highlightPath[i], b = highlightPath[i + 1];
        pathSet.add(a < b ? `${a}-${b}` : `${b}-${a}`);
      }
    }

    let running = true;
    const tick = () => {
      if (!running) return;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2;

      // Force simulation
      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = 3000 / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }

      // Attraction along edges
      for (const edge of edges) {
        const s = nodes.find((n) => n.id === edge.source);
        const t = nodes.find((n) => n.id === edge.target);
        if (!s || !t) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = (dist - 120) * 0.01;
        const fx = (dx / Math.max(dist, 1)) * force;
        const fy = (dy / Math.max(dist, 1)) * force;
        s.vx += fx;
        s.vy += fy;
        t.vx -= fx;
        t.vy -= fy;
      }

      // Center gravity
      for (const node of nodes) {
        node.vx += (cx - node.x) * 0.002;
        node.vy += (cy - node.y) * 0.002;
      }

      // Apply velocity with damping
      for (const node of nodes) {
        if (dragRef.current.node?.id === node.id) continue;
        node.vx *= 0.85;
        node.vy *= 0.85;
        node.x += node.vx;
        node.y += node.vy;
        // Bounds
        node.x = Math.max(node.radius, Math.min(dimensions.width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(dimensions.height - node.radius, node.y));
      }

      // Render
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw edges
      for (const edge of edges) {
        const s = nodes.find((n) => n.id === edge.source);
        const t = nodes.find((n) => n.id === edge.target);
        if (!s || !t) continue;

        const key = edge.source < edge.target ? `${edge.source}-${edge.target}` : `${edge.target}-${edge.source}`;
        const isPath = pathSet.has(key);
        const isHovered = hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = isPath ? COLORS.pathEdge : isHovered ? COLORS.edgeHighlight : COLORS.edge;
        ctx.lineWidth = isPath ? 3.5 : isHovered ? 2 : 1;
        if (isPath) {
          ctx.setLineDash([8, 4]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw nodes
      for (const node of nodes) {
        const isHovered = hoveredNode === node.id;
        const isInPath = highlightPath?.includes(node.id);

        // Glow for hovered/path nodes
        if (isHovered || isInPath) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = isInPath
            ? "hsla(350, 80%, 55%, 0.2)"
            : "hsla(250, 70%, 55%, 0.15)";
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        const color = node.isUser
          ? COLORS.user
          : node.isVip
          ? COLORS.vip
          : node.isFriend
          ? COLORS.friend
          : COLORS.normal;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Initials
        const initials = node.name
          .split(" ")
          .map((w) => w[0])
          .join("");
        ctx.fillStyle = "white";
        ctx.font = `bold ${node.radius * 0.7}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(initials, node.x, node.y);

        // Name label
        if (isHovered || node.isUser) {
          ctx.fillStyle = COLORS.text;
          ctx.font = "12px sans-serif";
          ctx.fillText(node.name, node.x, node.y + node.radius + 14);
        }
      }

      // Legend
      const legend = [
        { color: COLORS.user, label: "You" },
        { color: COLORS.friend, label: "Friend" },
        { color: COLORS.vip, label: "VIP" },
        { color: COLORS.normal, label: "Other" },
      ];
      ctx.font = "11px sans-serif";
      legend.forEach((item, i) => {
        const lx = 16;
        const ly = 20 + i * 20;
        ctx.beginPath();
        ctx.arc(lx, ly, 6, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.fillStyle = COLORS.text;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(item.label, lx + 12, ly);
      });

      animRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [dimensions, hoveredNode, highlightPath]);

  // Mouse interactions
  const getNodeAt = useCallback(
    (x: number, y: number) => {
      return nodesRef.current.find((n) => {
        const dx = n.x - x;
        const dy = n.y - y;
        return dx * dx + dy * dy <= (n.radius + 4) * (n.radius + 4);
      });
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const node = getNodeAt(x, y);
      if (node) {
        dragRef.current = { node, offsetX: x - node.x, offsetY: y - node.y };
      }
    },
    [getNodeAt]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (dragRef.current.node) {
        dragRef.current.node.x = x - dragRef.current.offsetX;
        dragRef.current.node.y = y - dragRef.current.offsetY;
        dragRef.current.node.vx = 0;
        dragRef.current.node.vy = 0;
      }

      const node = getNodeAt(x, y);
      setHoveredNode(node?.id || null);
    },
    [getNodeAt]
  );

  const handleMouseUp = useCallback(() => {
    if (dragRef.current.node && onNodeClick) {
      onNodeClick(dragRef.current.node.id);
    }
    dragRef.current = { node: null, offsetX: 0, offsetY: 0 };
  }, [onNodeClick]);

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height }}
        className="rounded-xl border border-border bg-card cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          dragRef.current = { node: null, offsetX: 0, offsetY: 0 };
          setHoveredNode(null);
        }}
      />
    </div>
  );
};

export default NetworkGraph;
