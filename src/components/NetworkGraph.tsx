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

  // UI & Physics State
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoverNode, setHoverNode] = useState<any | null>(null);
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

  if (loading || !ForceGraph2D)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 text-white animate-pulse" />
          <div className="space-y-1 text-center font-mono">
            <h2 className="text-white font-bold tracking-[0.3em] text-xs uppercase">
              System.Initialize()
            </h2>
            <p className="text-white/40 text-[9px] uppercase tracking-tighter">
              Fetching topology from endpoint...
            </p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="bg-white/5 p-8 border border-white/10 flex flex-col items-center">
          <AlertCircle className="w-10 h-10 text-white mb-4" />
          <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-2 font-mono">
            CRITICAL_FAILURE
          </h2>
          <p className="text-white/60 font-mono text-xs mb-6 text-center max-w-sm">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-black font-mono text-xs font-bold hover:bg-white/80 transition-all uppercase tracking-tighter"
          >
            Reconnect.System()
          </button>
        </div>
      </div>
    );

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col w-full h-screen overflow-hidden bg-black transition-all font-mono"
    >
      {/* HUD Superior Overlay Title */}
      <div className="absolute top-6 left-6 z-40 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-1 h-4 bg-white" />
          <h1 className="text-xl font-bold text-white tracking-widest uppercase">
            Topology.View
          </h1>
        </div>
        <div className="flex items-center gap-2 pl-4">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
          </span>
          <span className="text-white/30 text-[9px] uppercase tracking-[0.3em]">
            SNMP_V3_MONITOR // SINC_OK
          </span>
        </div>
      </div>
      {/* HUD Superior Controls */}
      <div className="absolute top-6 right-6 left-6 z-30 flex justify-end items-start pointer-events-none font-mono">
        <div className="flex flex-col gap-3 pointer-events-auto w-full max-w-md items-end">
          <div className="flex items-center gap-2 bg-black border border-white/20 p-1.5 shadow-xl w-full">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs font-bold leading-none">
                {">"}
              </span>
              <input
                type="text"
                placeholder="search_query..."
                className="w-full pl-8 pr-4 py-2 bg-transparent border-none rounded-none text-xs text-white placeholder:text-white/20 focus:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 text-white/60 transition-colors border-l border-white/10"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {showSettings && (
            <div className="bg-black border border-white/20 p-4 shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em]">
                  sys.config
                </span>
                <Settings2 className="w-3 h-3 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {[
                  {
                    label: "Labels.Node",
                    value: showNodeLabels,
                    set: setShowNodeLabels,
                  },
                  {
                    label: "Labels.Port",
                    value: showPortLabels,
                    set: setShowPortLabels,
                  },
                  {
                    label: "Visual.Ports",
                    value: showPorts,
                    set: setShowPorts,
                  },
                  {
                    label: "Visual.Flow",
                    value: showParticles,
                    set: setShowParticles,
                  },
                ].map((cfg) => (
                  <label
                    key={cfg.label}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <span className="text-[10px] text-white/60 group-hover:text-white transition-colors">
                      {cfg.label}
                    </span>
                    <input
                      type="checkbox"
                      className="appearance-none w-3 h-3 border border-white/40 checked:bg-white transition-all cursor-pointer"
                      checked={cfg.value}
                      onChange={() => cfg.set(!cfg.value)}
                    />
                  </label>
                ))}
              </div>

              <div className="space-y-4 pt-2">
                {[
                  {
                    label: "Phys.Repulsion",
                    value: forceStrength,
                    min: -1000,
                    max: -50,
                    step: 50,
                    set: (v: string) => setForceStrength(parseInt(v)),
                  },
                  {
                    label: "Phys.Distance",
                    value: linkDistance,
                    min: 30,
                    max: 350,
                    step: 10,
                    set: (v: string) => setLinkDistance(parseInt(v)),
                  },
                ].map((slider) => (
                  <div key={slider.label} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] uppercase">
                      <span className="text-white/40">{slider.label}</span>
                      <span className="text-white font-bold">
                        {slider.value}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={slider.min}
                      max={slider.max}
                      step={slider.step}
                      value={slider.value}
                      onChange={(e) => slider.set(e.target.value)}
                      className="w-full h-0.5 bg-white/10 appearance-none cursor-pointer accent-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 border transition-all ${
              showSettings
                ? "bg-white text-black border-white"
                : "bg-black border-white/20 text-white/60 hover:border-white hover:text-white"
            }`}
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedNode(null);
              setSearchQuery("");
              fgRef.current.zoomToFit(400);
            }}
            className="p-2 bg-black border border-white/20 text-white/60 hover:border-white hover:text-white transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Panel Lateral */}
      {selectedNode && (
        <div className="absolute right-6 top-6 bottom-6 z-30 w-[400px] bg-black border border-white/20 shadow-2xl flex flex-col animate-in slide-in-from-right-4 duration-300 font-mono text-white">
          <div className="p-6 border-b border-white/10">
            <div className="flex justify-between items-start mb-6">
              <span className="px-2 py-0.5 border border-white/40 text-white/60 text-[8px] font-bold uppercase tracking-widest">
                {selectedNode.type}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-white leading-tight mb-1 truncate">
              {selectedNode.label}
            </h3>
            {selectedNode.ip && (
              <p className="text-[10px] text-white/40 tracking-widest uppercase">
                {selectedNode.ip}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {selectedNode.details?.system && (
              <div className="space-y-3">
                <h4 className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1 h-3 bg-white" /> system_desc
                </h4>
                <div className="bg-white/[0.02] p-4 border border-white/5 space-y-3">
                  <p className="text-[11px] text-white/70 leading-relaxed italic">
                    "{selectedNode.details.system.sysDescr}"
                  </p>
                  <div className="flex items-center gap-3 text-white/50 text-[10px]">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {selectedNode.details.system.sysLocation || "NOT_DEFINED"}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {selectedNode.details?.interfaces && (
              <div className="space-y-4">
                <h4 className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1 h-3 bg-white" /> if_table (
                  {selectedNode.details.interfaces.length})
                </h4>
                <div className="divide-y divide-white/5 border-t border-white/5">
                  {selectedNode.details.interfaces.map(
                    (iface: any, i: number) => (
                      <div
                        key={i}
                        className="py-3 flex items-center justify-between group hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-white/80 group-hover:text-white">
                            {iface.ifName}
                          </span>
                          <span className="text-[9px] text-white/30 truncate max-w-[250px]">
                            {iface.ifDescr}
                          </span>
                        </div>
                        <div
                          className={`w-1 h-1 ${
                            iface.ifAdminStatus === 1
                              ? "bg-white"
                              : "bg-white/10"
                          }`}
                        />
                      </div>
                    )
                  )}
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
        nodeRelSize={6}
        backgroundColor="#000000"
        onNodeClick={setSelectedNode}
        onNodeHover={setHoverNode}
        linkDirectionalParticles={showParticles ? 3 : 0}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={2}
        linkCurvature={0.1}
        linkColor={(l) =>
          hoverNode &&
          (getID(l.source) === getID(hoverNode) ||
            getID(l.target) === getID(hoverNode))
            ? "#ffffff"
            : "#222222"
        }
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          if (!node || node.x === undefined || node.y === undefined) return;

          const isSelected = selectedNode && getID(selectedNode) === node.id;
          const isHovered =
            hoverNode &&
            (node.id === getID(hoverNode) ||
              node.parentId === getID(hoverNode));
          const isPort = node.type === "port";
          const size = isPort ? 2.5 : 5.5;
          const safeScale = Math.max(0.1, globalScale);

          ctx.save();
          if (isPort) {
            ctx.translate(node.x, node.y);
            ctx.rotate(Math.PI / 4);
            ctx.fillStyle = isHovered || isSelected ? "#ffffff" : "#444444";
            ctx.fillRect(-size, -size, size * 2, size * 2);
            if (isHovered || isSelected) {
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 1 / safeScale;
              ctx.strokeRect(
                -size - 1,
                -size - 1,
                (size + 1) * 2,
                (size + 1) * 2
              );
            }
          } else {
            // Main Node Styling
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);

            if (node.type === "managed") {
              ctx.fillStyle = isSelected || isHovered ? "#ffffff" : "#cccccc";
            } else {
              ctx.fillStyle = "#000000";
              ctx.strokeStyle = isSelected || isHovered ? "#ffffff" : "#666666";
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
            ctx.fill();

            if (isSelected || isHovered) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI, false);
              ctx.strokeStyle = "rgba(255,255,255,0.2)";
              ctx.lineWidth = 1 / safeScale;
              ctx.stroke();
            }
          }
          ctx.restore();

          // Lógica de Etiquetas (Labels) Monospaced
          const shouldShowLabel = isPort ? showPortLabels : showNodeLabels;
          if (shouldShowLabel && (safeScale > 1.2 || isSelected)) {
            const fontSize = 10 / safeScale;
            ctx.font = `${isSelected ? "bold " : ""}${fontSize}px 'monospace'`;
            ctx.textAlign = "center";
            ctx.fillStyle = isSelected || isHovered ? "#ffffff" : "#666666";
            const label = node.label || node.id || "N/A";
            ctx.fillText(label, node.x, node.y + size + fontSize + 4);
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
