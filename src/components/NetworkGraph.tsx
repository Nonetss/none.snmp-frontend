import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import {
  Search,
  RotateCcw,
  Settings2,
  Zap,
  Sliders,
  Maximize2,
  Minimize2,
  Activity,
  Shield,
  Cpu,
  Share2,
  X,
  MapPin,
  User,
  Info,
  List,
  AlertCircle,
} from "lucide-react";

const NetworkGraph: React.FC = () => {
  const [rawData, setRawData] = useState<{ nodes: any[]; edges: any[] } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ForceGraph2D, setForceGraph2D] = useState<any>(null);

  // UI State
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoverNode, setHoverNode] = useState<any | null>(null);
  const [showPorts, setShowPorts] = useState(true);
  const [forceStrength, setForceStrength] = useState(-300);
  const [linkDistance, setLinkDistance] = useState(70);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>();

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

  // 3. Lógica de procesamiento de datos (Filtros y Puertos)
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

      if (
        showPorts &&
        edge.metadata?.sourceInterface &&
        edge.metadata?.targetInterface
      ) {
        const sPortId = `port-${sId}-${edge.metadata.sourceInterface}`;
        const tPortId = `port-${tId}-${edge.metadata.targetInterface}`;

        if (!nodeMap.has(sPortId)) {
          const portNode = {
            id: sPortId,
            label: edge.metadata.sourceInterface,
            type: "port",
            parentId: sId,
          };
          nodes.push(portNode);
          nodeMap.set(sPortId, portNode);
        }

        if (!nodeMap.has(tPortId)) {
          const portNode = {
            id: tPortId,
            label: edge.metadata.targetInterface,
            type: "port",
            parentId: tId,
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

  if (loading || !ForceGraph2D)
    return (
      <div className="flex flex-col items-center justify-center h-[800px] bg-slate-950 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <Activity className="w-12 h-12 text-blue-500 animate-spin mb-6" />
        <h2 className="text-white font-bold tracking-widest text-lg uppercase">
          Sincronizando Sistema
        </h2>
        <p className="text-slate-500 font-mono text-[10px] uppercase mt-2 animate-pulse tracking-tighter">
          Consultando API de topología física...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-[800px] bg-slate-950 rounded-[2.5rem] border border-red-900/30">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-red-500 font-black text-xl uppercase tracking-tighter">
          Fallo de Comunicación
        </h2>
        <p className="text-slate-400 font-mono text-sm mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-bold text-xs hover:bg-red-500 hover:text-white transition-all"
        >
          Reintentar Conexión
        </button>
      </div>
    );

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col w-full overflow-hidden bg-slate-950 transition-all ${
        isFullscreen
          ? "h-screen"
          : "h-[850px] rounded-[2.5rem] border border-slate-800 shadow-2xl ring-1 ring-white/5"
      }`}
    >
      {/* HUD Superior */}
      <div className="absolute top-8 left-8 right-8 z-30 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-4 pointer-events-auto w-full max-w-lg">
          <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl shadow-2xl ring-1 ring-white/5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por Nombre, IP, Descripción, Interfaz..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border-none rounded-xl text-sm text-slate-200 focus:ring-1 focus:ring-blue-500/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-3 hover:bg-white/10 rounded-xl text-slate-400 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>

          {showSettings && (
            <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl shadow-2xl space-y-6 animate-in slide-in-from-top-4 ring-1 ring-white/5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Ajustes de Motor
                </span>
                <Settings2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Atracción
                    </span>
                    <span className="text-xs font-mono text-blue-400">
                      {forceStrength}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-1000"
                    max="-50"
                    step="50"
                    value={forceStrength}
                    onChange={(e) => setForceStrength(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Distancia
                    </span>
                    <span className="text-xs font-mono text-blue-400">
                      {linkDistance}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="10"
                    value={linkDistance}
                    onChange={(e) => setLinkDistance(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowPorts(!showPorts)}
                  className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    showPorts
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-500 border border-white/5"
                  }`}
                >
                  {showPorts ? "Ocultar Puertos" : "Mostrar Puertos"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pointer-events-auto">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-4 rounded-2xl border transition-all ${
              showSettings
                ? "bg-blue-600 border-blue-400 text-white"
                : "bg-slate-900/90 border-white/10 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Settings2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setSelectedNode(null);
              setSearchQuery("");
              fgRef.current.zoomToFit(400);
            }}
            className="p-4 bg-slate-900/90 border border-white/10 backdrop-blur-xl text-slate-400 hover:bg-slate-800 rounded-2xl transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info Panel Lateral */}
      {selectedNode && (
        <div className="absolute right-8 top-28 bottom-8 z-30 w-96 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right-12 duration-500 ring-1 ring-white/10">
          <div className="p-8 border-b border-white/5 bg-blue-500/5">
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-black uppercase tracking-wider">
                {selectedNode.type}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-2 hover:bg-white/10 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-2xl font-black text-white leading-none mb-2">
              {selectedNode.label}
            </h3>
            {selectedNode.ip && (
              <p className="text-xs font-mono text-blue-500/80 tracking-widest">
                {selectedNode.ip}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {selectedNode.details?.system && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Especificaciones
                </h4>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    "{selectedNode.details.system.sysDescr}"
                  </p>
                  <div className="flex items-center gap-3 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs">
                      {selectedNode.details.system.sysLocation || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {selectedNode.details?.interfaces && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Puertos Detectados ({selectedNode.details.interfaces.length})
                </h4>
                <div className="space-y-2">
                  {selectedNode.details.interfaces
                    .slice(0, 8)
                    .map((iface: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">
                            {iface.ifName}
                          </span>
                          <span className="text-[9px] text-slate-500 truncate max-w-[150px]">
                            {iface.ifDescr}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Graph Area */}
      <ForceGraph2D
        ref={fgRef}
        graphData={processedData}
        nodeRelSize={7}
        backgroundColor="#020617"
        onNodeClick={setSelectedNode}
        onNodeHover={setHoverNode}
        linkDirectionalParticles={4}
        linkDirectionalParticleSpeed={0.006}
        linkCurvature={0.15}
        linkColor={(l) =>
          hoverNode &&
          (getID(l.source) === getID(hoverNode) ||
            getID(l.target) === getID(hoverNode))
            ? "#3b82f6"
            : "#1e293b"
        }
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          if (!node || node.x === undefined || node.y === undefined) return;

          const isSelected = selectedNode && getID(selectedNode) === node.id;
          const isHovered =
            hoverNode &&
            (node.id === getID(hoverNode) ||
              node.parentId === getID(hoverNode));
          const isPort = node.type === "port";
          const size = isPort ? 3.5 : 7.5;
          const safeScale = Math.max(0.1, globalScale);

          ctx.save();
          if (isPort) {
            ctx.translate(node.x, node.y);
            ctx.rotate(Math.PI / 4);
            ctx.fillStyle = isHovered ? "#f59e0b" : "#fbbf24";
            ctx.fillRect(-size, -size, size * 2, size * 2);
          } else {
            if (isSelected || isHovered) {
              ctx.shadowColor = "#3b82f6";
              ctx.shadowBlur = Math.min(100, 30 / safeScale);
            }
            const grad = ctx.createRadialGradient(
              node.x,
              node.y,
              0,
              node.x,
              node.y,
              size
            );
            grad.addColorStop(
              0,
              node.type === "managed" ? "#60a5fa" : "#94a3b8"
            );
            grad.addColorStop(
              0.8,
              node.type === "managed" ? "#2563eb" : "#475569"
            );
            grad.addColorStop(1, "#020617");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
            ctx.fill();
            if (isSelected) {
              ctx.strokeStyle = "#fff";
              ctx.lineWidth = 3 / safeScale;
              ctx.stroke();
            }
          }
          ctx.restore();

          if (safeScale > 1.2 || isSelected) {
            const fontSize = 11 / safeScale;
            ctx.font = `${
              isSelected ? "900 " : "500 "
            }${fontSize}px 'Inter', sans-serif`;
            ctx.textAlign = "center";
            ctx.fillStyle = isSelected ? "#fff" : "#94a3b8";
            const label = node.label || node.id || "N/A";
            ctx.fillText(label, node.x, node.y + size + fontSize + 4);
          }
        }}
      />
    </div>
  );
};

export default NetworkGraph;
