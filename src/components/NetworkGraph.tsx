import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import {
  LoadingScreen,
} from "./network-graph/LoadingScreen";
import { ErrorScreen } from "./network-graph/ErrorScreen";
import { Controls } from "./network-graph/Controls";
import { SettingsPanel } from "./network-graph/SettingsPanel";
import { NodeDetails } from "./network-graph/NodeDetails";
import type { GraphData, GraphNode } from "./network-graph/types";

const NetworkGraph: React.FC = () => {
  const [rawData, setRawData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ForceGraph2D, setForceGraph2D] = useState<any>(null);

  // UI & Physics State
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [showPorts, setShowPorts] = useState(true);
  const [showNodeLabels, setShowNodeLabels] = useState(true);
  const [showPortLabels, setShowPortLabels] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [forceStrength, setForceStrength] = useState(-300);
  const [linkDistance, setLinkDistance] = useState(70);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 800,
    height: typeof window !== "undefined" ? window.innerHeight : 600,
  });

  const getID = (node: any) => (typeof node === "object" ? node.id : node);

  // 1. Cargar la librería solo en el cliente
  useEffect(() => {
    import("react-force-graph-2d")
      .then((mod) => {
        setForceGraph2D(() => mod.default);
      })
      .catch((err) => {
        console.error("Error cargando react-force-graph-2d:", err);
        setError("Error crítico: No se pudo cargar el motor gráfico");
      });

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    // Trigger initial resize
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Peticion al backend con logging
  useEffect(() => {
    const fetchData = async () => {
      const hostname = window.location.hostname;
      const apiUrl = `http://${hostname}:3000/api/v1/search/graph`;

      console.log(`📡 Iniciando petición al backend: ${apiUrl}`);
      try {
        const response = await axios.get(apiUrl, {
          headers: { "Cache-Control": "no-cache" },
        });
        console.log("✅ Datos recibidos con éxito:", response.data);

        if (response.data && Array.isArray(response.data.nodes)) {
          setRawData({
            nodes: response.data.nodes || [],
            edges: response.data.edges || [],
          });
        } else {
          console.error("❌ Formato de datos inválido:", response.data);
          setError("El backend devolvió un formato de datos inesperado");
        }
      } catch (err: any) {
        console.error("❌ Error en la petición:", err);
        setError(
          `Error de conexión: ${err.message || "Servidor no disponible"}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 4. Aplicar fuerzas de la simulación
  useEffect(() => {
    if (fgRef.current) {
      // Repulsión (Carga)
      fgRef.current.d3Force("charge").strength(forceStrength);

      // Distancia de los enlaces
      fgRef.current.d3Force("link").distance((link: any) => {
        return link.type === "internal" ? 30 : linkDistance;
      });

      // Re-calentar la simulación para que se muevan
      fgRef.current.d3ReheatSimulation();
    }
  }, [forceStrength, linkDistance, ForceGraph2D, rawData]);

  // 5. Lógica de procesamiento de datos (Filtros y Puertos)
  const processedData = useMemo(() => {
    if (!rawData) return { nodes: [], links: [] };

    // MODO AISLAMIENTO
    if (selectedNode) {
      const targetId = getID(selectedNode);
      const neighborIds = new Set([targetId]);
      rawData.edges.forEach((edge) => {
        const s = getID(edge.source);
        const t = getID(edge.target);
        if (s === targetId) neighborIds.add(t);
        if (t === targetId) neighborIds.add(s);
      });
      const nodes = rawData.nodes.filter((n) => neighborIds.has(n.id));
      const links = rawData.edges
        .filter(
          (e) =>
            neighborIds.has(getID(e.source)) && neighborIds.has(getID(e.target))
        )
        .map((e) => ({
          ...e,
          source: getID(e.source),
          target: getID(e.target),
          type: "cable",
        }));
      return { nodes, links };
    }

    // VISTA GENERAL
    let nodes: any[] = [...rawData.nodes];
    let links: any[] = [];
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const edges = rawData.edges || [];
    edges.forEach((edge) => {
      const sId = getID(edge.source);
      const tId = getID(edge.target);

      const sIface = edge.metadata?.sourceInterface;
      const tIface = edge.metadata?.targetInterface;

      if (showPorts && sIface && tIface) {
        const sPortLabel =
          typeof sIface === "object" ? sIface.ifDescr || sIface.ifName : sIface;
        const tPortLabel =
          typeof tIface === "object" ? tIface.ifDescr || tIface.ifName : tIface;
        const sPortIdx =
          typeof sIface === "object" ? sIface.ifIndex || sIface.ifName : sIface;
        const tPortIdx =
          typeof tIface === "object" ? tIface.ifIndex || tIface.ifName : tIface;

        const sPortId = `port-${sId}-${sPortIdx}`;
        const tPortId = `port-${tId}-${tPortIdx}`;

        if (!nodeMap.has(sPortId)) {
          const portNode = {
            id: sPortId,
            label: sPortLabel,
            type: "port",
            parentId: sId,
            details: typeof sIface === "object" ? sIface : null,
          };
          nodes.push(portNode);
          nodeMap.set(sPortId, portNode);
        }

        if (!nodeMap.has(tPortId)) {
          const portNode = {
            id: tPortId,
            label: tPortLabel,
            type: "port",
            parentId: tId,
            details: typeof tIface === "object" ? tIface : null,
          };
          nodes.push(portNode);
          nodeMap.set(tPortId, portNode);
        }

        links.push({ source: sId, target: sPortId, type: "internal" });
        links.push({ source: tId, target: tPortId, type: "internal" });
        links.push({
          ...edge,
          source: sPortId,
          target: tPortId,
          type: "cable",
        });
      } else {
        links.push({ ...edge, source: sId, target: tId, type: "cable" });
      }
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = nodes
        .filter((n) => {
          if (n.type === "port") return false;
          return (
            n.label?.toLowerCase().includes(q) ||
            n.ip?.toLowerCase().includes(q) ||
            n.details?.system?.sysDescr?.toLowerCase().includes(q) ||
            n.details?.system?.sysName?.toLowerCase().includes(q) ||
            n.details?.interfaces?.some(
              (i: any) =>
                i.ifName?.toLowerCase().includes(q) ||
                i.ifDescr?.toLowerCase().includes(q)
            )
          );
        })
        .map((n) => n.id);

      const visible = new Set(matches);
      nodes.forEach((n) => {
        if (n.parentId && matches.includes(n.parentId)) visible.add(n.id);
      });
      return {
        nodes: nodes.filter((n) => visible.has(n.id)),
        links: links.filter(
          (l) => visible.has(getID(l.source)) && visible.has(getID(l.target))
        ),
      };
    }

    return { nodes, links };
  }, [rawData, selectedNode, searchQuery, showPorts]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading || !ForceGraph2D) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col w-full h-screen overflow-hidden bg-black transition-all font-mono"
    >
      <Controls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        onResetZoom={() => {
          setSelectedNode(null);
          setSearchQuery("");
          fgRef.current.zoomToFit(400);
        }}
      />

      {showSettings && (
        <SettingsPanel
          showNodeLabels={showNodeLabels}
          setShowNodeLabels={setShowNodeLabels}
          showPortLabels={showPortLabels}
          setShowPortLabels={setShowPortLabels}
          showPorts={showPorts}
          setShowPorts={setShowPorts}
          showParticles={showParticles}
          setShowParticles={setShowParticles}
          forceStrength={forceStrength}
          setForceStrength={setForceStrength}
          linkDistance={linkDistance}
          setLinkDistance={setLinkDistance}
        />
      )}

      {selectedNode && (
        <NodeDetails
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* Graph Area */}
      <ForceGraph2D
        ref={fgRef}
        graphData={processedData}
        width={dimensions.width}
        height={dimensions.height}
        nodeRelSize={6}
        backgroundColor="#000000"
        onNodeClick={(node: any) => {
          if (node.type === "port") return;
          setSelectedNode(node);
        }}
        onNodeHover={setHoverNode}
        linkDirectionalParticles={showParticles ? 3 : 0}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={2}
        linkCurvature={0.1}
        linkColor={
          (l: any) =>
            hoverNode &&
            (getID(l.source) === getID(hoverNode) ||
              getID(l.target) === getID(hoverNode))
              ? "#ffffff" // Pure white on hover
              : "#1a1a1a" // Very dark grey for default links
        }
        nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
          if (!node || node.x === undefined || node.y === undefined) return;

          const isSelected = selectedNode && getID(selectedNode) === node.id;
          const isHovered =
            hoverNode &&
            (node.id === getID(hoverNode) ||
              node.parentId === getID(hoverNode));
          const isPort = node.type === "port";
          const size = isPort ? 3 : 6;
          const safeScale = Math.max(0.1, globalScale);

          // Colors
          const primaryColor = "#0ea5e9"; // Sky blue
          const portColor = "#10b981"; // Emerald
          const selectedColor = "#f43f5e"; // Rose
          const hoverColor = "#eab308"; // Yellow
          const baseColor = isSelected
            ? selectedColor
            : isHovered
            ? hoverColor
            : isPort
            ? portColor
            : primaryColor;

          ctx.save();

          // Glow effect for "Terminal" feel
          ctx.shadowColor = baseColor;
          ctx.shadowBlur = isSelected || isHovered ? 15 : 0;

          if (isPort) {
            ctx.translate(node.x, node.y);
            ctx.rotate(Math.PI / 4);

            // Port shape (Diamond)
            ctx.fillStyle = isHovered || isSelected ? "#ffffff" : "#1e293b"; // Dark center
            ctx.strokeStyle = baseColor;
            ctx.lineWidth = 1.5 / safeScale;

            ctx.beginPath();
            ctx.rect(-size, -size, size * 2, size * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            // Main Node Styling (Circle)
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);

            ctx.fillStyle = "#0f172a"; // Slate-900 background
            ctx.fill();

            ctx.strokeStyle = baseColor;
            ctx.lineWidth = 2 / safeScale;
            ctx.stroke();

            // Inner dot for "active" look
            ctx.beginPath();
            ctx.arc(node.x, node.y, size * 0.4, 0, 2 * Math.PI, false);
            ctx.fillStyle = baseColor;
            ctx.fill();

            // Outer ring selection
            if (isSelected || isHovered) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI, false);
              ctx.strokeStyle = baseColor;
              ctx.lineWidth = 1 / safeScale;
              ctx.setLineDash([2, 2]); // Dotted line
              ctx.stroke();
              ctx.setLineDash([]); // Reset
            }
          }
          ctx.restore();

          // Text Labels - Monospace Retro
          const shouldShowLabel = isPort ? showPortLabels : showNodeLabels;
          if (shouldShowLabel && (safeScale > 1.2 || isSelected || isHovered)) {
            const fontSize = (isPort ? 8 : 12) / safeScale;
            ctx.font = `${
              isSelected ? "bold " : ""
            }${fontSize}px 'Courier New', monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";

            // Text Background for readability
            const label = node.label || node.id || "N/A";
            const textWidth = ctx.measureText(label).width;

            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(
              node.x - textWidth / 2 - 2,
              node.y + size + 4,
              textWidth + 4,
              fontSize + 4
            );

            ctx.fillStyle = isSelected ? selectedColor : "#94a3b8"; // Slate-400 default text
            ctx.fillText(label, node.x, node.y + size + 6);
          }
        }}
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default NetworkGraph;
