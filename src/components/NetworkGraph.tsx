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

  if (loading || !ForceGraph2D)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 text-[#0ea5e9] animate-pulse" />
          <div className="space-y-1 text-center font-mono">
            <h2 className="text-[#0ea5e9] font-bold tracking-[0.3em] text-xs uppercase">
              System.Initialize()
            </h2>
            <p className="text-[#0ea5e9]/40 text-[9px] uppercase tracking-tighter">
              Fetching topology from endpoint...
            </p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#050505]">
        <div className="bg-[#f43f5e]/5 p-8 border border-[#f43f5e]/20 flex flex-col items-center shadow-[0_0_30px_rgba(244,63,94,0.1)]">
          <AlertCircle className="w-10 h-10 text-[#f43f5e] mb-4" />
          <h2 className="text-[#f43f5e] font-bold text-sm uppercase tracking-widest mb-2 font-mono">
            CRITICAL_FAILURE
          </h2>
          <p className="text-[#f43f5e]/60 font-mono text-xs mb-6 text-center max-w-sm">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#f43f5e] text-black font-mono text-xs font-bold hover:bg-[#f43f5e]/80 transition-all uppercase tracking-tighter"
          >
            Reconnect.System()
          </button>
        </div>
      </div>
    );

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col w-full h-screen overflow-hidden bg-[#050505] transition-all font-mono"
    >
      {/* HUD Superior Overlay Title */}
      <div className="absolute top-6 left-6 z-40 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-1 h-4 bg-[#0ea5e9] shadow-[0_0_10px_#0ea5e9]" />
          <h1 className="text-xl font-bold text-[#0ea5e9] tracking-widest uppercase drop-shadow-[0_0_5px_rgba(14,165,233,0.5)]">
            Topology.View
          </h1>
        </div>
      </div>
      {/* HUD Superior Controls */}
      <div className="absolute top-6 inset-x-0 z-30 flex justify-center items-start pointer-events-none font-mono">
        <div className="flex flex-col gap-3 pointer-events-auto w-full max-w-2xl items-center">
          <div className="flex items-center gap-2 bg-[#050505]/90 border border-[#0ea5e9]/30 p-1.5 shadow-[0_0_15px_rgba(14,165,233,0.1)] w-full backdrop-blur-sm">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0ea5e9] text-xs font-bold leading-none">
                {">"}
              </span>
              <input
                type="text"
                placeholder="search_query..."
                className="w-full pl-8 pr-4 py-2 bg-transparent border-none rounded-none text-xs text-[#0ea5e9] placeholder:text-[#0ea5e9]/30 focus:ring-0 uppercase"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-[#0ea5e9]/10 text-[#0ea5e9]/60 hover:text-[#0ea5e9] transition-colors border-l border-[#0ea5e9]/20"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {showSettings && (
            <div className="bg-[#050505]/95 border border-[#0ea5e9]/30 p-4 shadow-[0_0_20px_rgba(14,165,233,0.15)] space-y-5 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-md fixed top-16 right-4">
              <div className="flex items-center justify-between border-b border-[#0ea5e9]/20 pb-2">
                <span className="text-[9px] font-bold text-[#0ea5e9]/50 uppercase tracking-[0.2em]">
                  sys.config
                </span>
                <Settings2 className="w-3 h-3 text-[#0ea5e9]" />
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-[400px] ">
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
                    <span className="text-[10px] text-[#0ea5e9]/60 group-hover:text-[#0ea5e9] transition-colors">
                      {cfg.label}
                    </span>
                    <div
                      className={`w-3 h-3 border border-[#0ea5e9]/40 transition-all ${
                        cfg.value
                          ? "bg-[#0ea5e9] shadow-[0_0_5px_#0ea5e9]"
                          : "bg-transparent"
                      }`}
                    ></div>
                    <input
                      type="checkbox"
                      className="hidden"
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
                      <span className="text-[#0ea5e9]/40">{slider.label}</span>
                      <span className="text-[#0ea5e9] font-bold">
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
                      className="w-full h-0.5 bg-[#0ea5e9]/20 appearance-none cursor-pointer accent-[#0ea5e9]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pointer-events-auto fixed top-4 right-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 border transition-all ${
              showSettings
                ? "bg-[#0ea5e9] text-black border-[#0ea5e9] shadow-[0_0_10px_#0ea5e9]"
                : "bg-black border-[#0ea5e9]/20 text-[#0ea5e9]/60 hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
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
            className="p-2 bg-black border border-[#0ea5e9]/20 text-[#0ea5e9]/60 hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Panel Lateral (Ahora Modal Centrada) */}
      {selectedNode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#050505]/95 border border-[#10b981]/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col font-mono text-[#e2e8f0] overflow-hidden">
            <div className="p-8 border-b border-[#10b981]/20 bg-[#10b981]/5">
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 border border-[#10b981]/40 text-[#10b981] text-[10px] font-bold uppercase tracking-[0.3em] shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  {selectedNode.type}
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-2 hover:bg-[#10b981]/10 text-[#10b981]/40 hover:text-[#10b981] transition-colors border border-[#10b981]/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-3xl font-bold text-[#10b981] leading-tight mb-2 truncate drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] tracking-tighter">
                {selectedNode.label}
              </h3>
              {selectedNode.ip && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                  <p className="text-xs text-[#10b981]/60 tracking-[0.4em] uppercase font-bold">
                    {selectedNode.ip}
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-black/20">
              {selectedNode.details?.system && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-[#10b981]/50 uppercase tracking-[0.4em] flex items-center gap-3">
                    <div className="w-1.5 h-4 bg-[#10b981]" />{" "}
                    system_information
                  </h4>
                  <div className="bg-[#10b981]/5 p-6 border border-[#10b981]/10 space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                      <Shield className="w-20 h-20 text-[#10b981]" />
                    </div>
                    <p className="text-[13px] text-[#10b981]/80 leading-relaxed font-medium italic relative z-10">
                      "{selectedNode.details.system.sysDescr}"
                    </p>
                    <div className="flex flex-wrap gap-6 items-center pt-2 relative z-10">
                      <div className="flex items-center gap-3 text-[#10b981]/60 text-xs">
                        <MapPin className="w-4 h-4" />
                        <span className="uppercase tracking-widest border-b border-[#10b981]/20">
                          {selectedNode.details.system.sysLocation ||
                            "NOT_DEFINED"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[#10b981]/60 text-xs">
                        <User className="w-4 h-4" />
                        <span className="uppercase tracking-widest border-b border-[#10b981]/20">
                          {selectedNode.details.system.sysContact ||
                            "UNKNOWN_ADMIN"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedNode.details?.interfaces && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#10b981]/10 pb-2">
                    <h4 className="text-[10px] font-bold text-[#10b981]/50 uppercase tracking-[0.4em] flex items-center gap-3">
                      <div className="w-1.5 h-4 bg-[#10b981]" />{" "}
                      interface_matrix
                    </h4>
                    <span className="text-[10px] text-[#10b981]/40 tracking-widest font-bold">
                      COUNT: {selectedNode.details.interfaces.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedNode.details.interfaces.map(
                      (iface: any, i: number) => (
                        <div
                          key={i}
                          className="p-4 border border-[#10b981]/10 bg-black/40 hover:bg-[#10b981]/5 hover:border-[#10b981]/30 transition-all group flex items-start justify-between"
                        >
                          <div className="flex flex-col gap-1 pr-4 min-w-0">
                            <span className="text-xs font-bold text-[#10b981] group-hover:drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">
                              {iface.ifName}
                            </span>
                            <span className="text-[9px] text-[#10b981]/40 truncate uppercase tracking-tighter">
                              {iface.ifDescr}
                            </span>
                            {iface.ifSpeed && (
                              <span className="text-[8px] text-[#10b981]/30 mt-1 font-bold">
                                SPEED: {(iface.ifSpeed / 1000000).toFixed(1)}{" "}
                                Mbps
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div
                              className={`px-1.5 py-0.5 text-[8px] font-bold border ${
                                iface.ifAdminStatus === 1
                                  ? "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]"
                                  : "bg-[#f43f5e]/10 border-[#f43f5e]/30 text-[#f43f5e]"
                              }`}
                            >
                              {iface.ifAdminStatus === 1 ? "ACTIVE" : "DOWN"}
                            </div>
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                iface.ifAdminStatus === 1
                                  ? "bg-[#10b981] shadow-[0_0_8px_#10b981]"
                                  : "bg-[#f43f5e] opacity-30"
                              }`}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
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
        linkColor={
          (l) =>
            hoverNode &&
            (getID(l.source) === getID(hoverNode) ||
              getID(l.target) === getID(hoverNode))
              ? "#22d3ee" // Cyan glowing link on hover
              : "#1e293b" // Dark slate for default links
        }
        nodeCanvasObject={(node: any, ctx, globalScale) => {
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
