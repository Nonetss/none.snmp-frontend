import React, { useEffect, useState, useRef, useMemo } from 'react'
import axios from 'axios'
import { LoadingScreen } from '@/features/graph/components/LoadingScreen'
import { ErrorScreen } from '@/features/graph/components/ErrorScreen'
import { Controls } from '@/features/graph/components/Controls'
import { SettingsPanel } from '@/features/graph/components/SettingsPanel'
import { NodeDetails } from '@/features/graph/components/NodeDetails'
import type { GraphData, GraphNode } from '@/features/graph/components/types'
import { Info, Activity, Share2, Box } from 'lucide-react'

const NetworkGraph: React.FC = () => {
  const [rawData, setRawData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ForceGraph2D, setForceGraph2D] = useState<any>(null)

  // UI & Physics State
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null)
  const [showPorts, setShowPorts] = useState(true)
  const [showNodeLabels, setShowNodeLabels] = useState(true)
  const [showPortLabels, setShowPortLabels] = useState(true)
  const [showParticles, setShowParticles] = useState(true)
  const [forceStrength, setForceStrength] = useState(-300)
  const [linkDistance, setLinkDistance] = useState(70)
  const [showSettings, setShowSettings] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const fgRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  })

  const getID = (node: any) => (typeof node === 'object' ? node.id : node)

  // 1. Cargar la librería solo en el cliente
  useEffect(() => {
    import('react-force-graph-2d')
      .then((mod) => {
        setForceGraph2D(() => mod.default)
      })
      .catch((err) => {
        console.error('Error cargando react-force-graph-2d:', err)
        setError('Error crítico: No se pudo cargar el motor gráfico')
      })

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])

  // 2. Peticion al backend
  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = `/api/v0/search/graph`

      try {
        const response = await axios.get(apiUrl, {
          headers: { 'Cache-Control': 'no-cache' },
        })

        if (response.data && Array.isArray(response.data.nodes)) {
          setRawData({
            nodes: response.data.nodes || [],
            edges: response.data.edges || [],
          })
        } else {
          setError('El backend devolvió un formato de datos inesperado')
        }
      } catch (err: any) {
        setError(`Error de conexión: ${err.message || 'Servidor no disponible'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 4. Aplicar fuerzas
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(forceStrength)
      fgRef.current.d3Force('link').distance((link: any) => {
        return link.type === 'internal' ? 30 : linkDistance
      })
      fgRef.current.d3ReheatSimulation()
    }
  }, [forceStrength, linkDistance, ForceGraph2D, rawData])

  // 5. Procesamiento de datos
  const processedData = useMemo(() => {
    if (!rawData) return { nodes: [], links: [] }

    const result = (() => {
      // MODO AISLAMIENTO
      if (selectedNode) {
        const targetId = getID(selectedNode)
        const neighborIds = new Set([targetId])
        rawData.edges.forEach((edge) => {
          const s = getID(edge.source)
          const t = getID(edge.target)
          if (s === targetId) neighborIds.add(t)
          if (t === targetId) neighborIds.add(s)
        })
        const nodes = rawData.nodes.filter((n) => neighborIds.has(n.id))
        const links = rawData.edges
          .filter((e) => neighborIds.has(getID(e.source)) && neighborIds.has(getID(e.target)))
          .map((e) => ({
            ...e,
            source: getID(e.source),
            target: getID(e.target),
            type: 'cable',
          }))
        return { nodes, links }
      }

      // VISTA GENERAL
      let nodes: any[] = [...rawData.nodes]
      let links: any[] = []
      const nodeMap = new Map(nodes.map((n) => [n.id, n]))

      const edges = rawData.edges || []
      edges.forEach((edge) => {
        const sId = getID(edge.source)
        const tId = getID(edge.target)

        const sIface = edge.metadata?.sourceInterface
        const tIface = edge.metadata?.targetInterface

        if (showPorts && sIface && tIface) {
          const sPortLabel = typeof sIface === 'object' ? sIface.ifDescr || sIface.ifName : sIface
          const tPortLabel = typeof tIface === 'object' ? tIface.ifDescr || tIface.ifName : tIface
          const sPortIdx = typeof sIface === 'object' ? sIface.ifIndex || sIface.ifName : sIface
          const tPortIdx = typeof tIface === 'object' ? tIface.ifIndex || tIface.ifName : tIface

          const sPortId = `port-${sId}-${sPortIdx}`
          const tPortId = `port-${tId}-${tPortIdx}`

          if (!nodeMap.has(sPortId)) {
            const portNode = {
              id: sPortId,
              label: sPortLabel,
              type: 'port',
              parentId: sId,
              details: typeof sIface === 'object' ? sIface : null,
            }
            nodes.push(portNode)
            nodeMap.set(sPortId, portNode)
          }

          if (!nodeMap.has(tPortId)) {
            const portNode = {
              id: tPortId,
              label: tPortLabel,
              type: 'port',
              parentId: tId,
              details: typeof tIface === 'object' ? tIface : null,
            }
            nodes.push(portNode)
            nodeMap.set(tPortId, portNode)
          }

          links.push({ source: sId, target: sPortId, type: 'internal' })
          links.push({ source: tId, target: tPortId, type: 'internal' })
          links.push({
            ...edge,
            source: sPortId,
            target: tPortId,
            type: 'cable',
          })
        } else {
          links.push({ ...edge, source: sId, target: tId, type: 'cable' })
        }
      })

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matches = nodes
          .filter((n) => {
            if (n.type === 'port') return false
            return (
              n.label?.toLowerCase().includes(q) ||
              n.ip?.toLowerCase().includes(q) ||
              n.details?.system?.sysDescr?.toLowerCase().includes(q) ||
              n.details?.system?.sysName?.toLowerCase().includes(q)
            )
          })
          .map((n) => n.id)

        const visible = new Set(matches)
        nodes.forEach((n) => {
          if (n.parentId && matches.includes(n.parentId)) visible.add(n.id)
        })
        return {
          nodes: nodes.filter((n) => visible.has(n.id)),
          links: links.filter((l) => visible.has(getID(l.source)) && visible.has(getID(l.target))),
        }
      }

      return { nodes, links }
    })()

    // CALCULO DE MÉTRICAS OPTIMIZADO (O(N+L))
    const adjacency = new Map<string, string[]>()
    const degrees = new Map<string, number>()

    result.links.forEach((l) => {
      const s = getID(l.source)
      const t = getID(l.target)

      degrees.set(s, (degrees.get(s) || 0) + 1)
      degrees.set(t, (degrees.get(t) || 0) + 1)

      if (!adjacency.has(s)) adjacency.set(s, [])
      if (!adjacency.has(t)) adjacency.set(t, [])
      adjacency.get(s)!.push(t)
      adjacency.get(t)!.push(s)
    })

    const finalNodes = result.nodes.map((node) => {
      const degree = degrees.get(node.id) || 0
      const neighbors = adjacency.get(node.id) || []
      const neighborSum = neighbors.reduce(
        (acc, neighborId) => acc + (degrees.get(neighborId) || 0),
        0
      )

      return {
        ...node,
        degree,
        connectivityScore: degree + neighborSum * 0.5,
      }
    })

    return { nodes: finalNodes, links: result.links }
  }, [rawData, selectedNode, searchQuery, showPorts])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (loading || !ForceGraph2D) return <LoadingScreen />
  if (error) return <ErrorScreen error={error} />

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col w-full h-screen overflow-hidden bg-black transition-all font-mono selection:bg-white selection:text-black"
    >
      {/* HUD: Controls */}
      <Controls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        onResetZoom={() => {
          setSelectedNode(null)
          setSearchQuery('')
          fgRef.current.zoomToFit(400)
        }}
      />

      {/* HUD: Legend */}
      <div className="absolute bottom-20 left-4 md:left-8 z-50 hidden md:flex flex-col gap-3 bg-black/60 backdrop-blur-md border border-white/10 p-4 pointer-events-none">
        <div className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-1">
          Topology_Legend
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full border border-blue-500/50 bg-blue-500/20" />
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            Standard Node
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full border border-amber-500/50 bg-amber-500/20" />
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            Active Hub
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full border border-rose-500/50 bg-rose-500/20" />
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            Critical Core
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500/50 rotate-45" />
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            Access Port
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-0.5 bg-neutral-800" />
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            Physical Link
          </span>
        </div>
      </div>

      {/* HUD: Status Bar */}
      <div className="absolute bottom-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-t border-white/10 p-3 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              Engine: Active
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-500 shrink-0">
            <Box className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Nodes: {processedData.nodes.length}
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-500 shrink-0">
            <Share2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Edges: {processedData.links.length}
            </span>
          </div>
        </div>
        <div className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest italic hidden lg:block">
          Resolution: D3-Force Realtime Simulation
        </div>
      </div>

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

      {selectedNode && <NodeDetails node={selectedNode} onClose={() => setSelectedNode(null)} />}

      {/* Graph Area */}
      <ForceGraph2D
        ref={fgRef}
        graphData={processedData}
        width={dimensions.width}
        height={dimensions.height}
        nodeRelSize={6}
        backgroundColor="#000000"
        onNodeClick={(node: any) => {
          if (node.type === 'port') return
          setSelectedNode(node)
        }}
        onNodeHover={setHoverNode}
        linkWidth={(link: any) => {
          if (link.type === 'internal') return 1
          const s = link.source
          const t = link.target
          // Usar el score de conectividad de ambos nodos para determinar el grosor
          const sScore = s.connectivityScore || 0
          const tScore = t.connectivityScore || 0
          const avgScore = (sScore + tScore) / 2
          return Math.max(1, Math.min(avgScore / 4, 6)) // Grosor entre 1 y 6
        }}
        nodePointerAreaPaint={(node: any, color: string, ctx: any) => {
          if (!node || node.x === undefined || node.y === undefined) return
          const isPort = node.type === 'port'
          const baseSize = isPort ? 3 : 5
          const score = node.connectivityScore || 0
          const size = isPort ? baseSize : baseSize + Math.min(Math.sqrt(score) * 2, 15)

          ctx.fillStyle = color
          if (isPort) {
            ctx.save()
            ctx.translate(node.x, node.y)
            ctx.rotate(Math.PI / 4)
            ctx.beginPath()
            ctx.rect(-size, -size, size * 2, size * 2)
            ctx.fill()
            ctx.restore()
          } else {
            ctx.beginPath()
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false)
            ctx.fill()
          }
        }}
        linkDirectionalParticles={showParticles ? 3 : 0}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={2}
        linkCurvature={0.1}
        nodeLabel={(node: any) => {
          const type = node.type === 'port' ? 'PORT' : 'DEVICE'
          return `
              <div class="bg-black/90 border border-white/20 p-2 text-[10px] font-mono leading-tight shadow-2xl">
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-1 bg-white/10 text-neutral-400 text-[8px] font-black uppercase tracking-tighter">${type}</span>
                  <span class="text-white font-black uppercase">${node.label || node.id}</span>
                </div>
                ${node.ip ? `<div class="text-neutral-500">ADDR: ${node.ip}</div>` : ''}
                <div class="text-blue-400 text-[8px] mt-1 font-bold">CONNECTIVITY_INDEX: ${Math.round(node.connectivityScore || 0)}</div>
              </div>
            `
        }}
        linkColor={(l: any) =>
          hoverNode &&
          (getID(l.source) === getID(hoverNode) || getID(l.target) === getID(hoverNode))
            ? '#ffffff'
            : '#1a1a1a'
        }
        nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
          if (!node || node.x === undefined || node.y === undefined) return

          const isSelected = selectedNode && getID(selectedNode) === node.id
          const isHovered =
            hoverNode && (node.id === getID(hoverNode) || node.parentId === getID(hoverNode))
          const isPort = node.type === 'port'

          // DINAMIC SIZE BASED ON CONNECTIVITY
          const baseSize = isPort ? 3 : 5
          const score = node.connectivityScore || 0
          const dynamicSize = isPort ? baseSize : baseSize + Math.min(Math.sqrt(score) * 2, 15)
          const size = isSelected || isHovered ? dynamicSize * 1.1 : dynamicSize

          const safeScale = Math.max(0.1, globalScale)

          // DINAMIC COLOR BASED ON CONNECTIVITY
          let primaryColor = '#0ea5e9' // Default Cyan
          if (!isPort) {
            if (score > 20)
              primaryColor = '#f43f5e' // Rose/Red
            else if (score > 10)
              primaryColor = '#f59e0b' // Amber
            else if (score > 5) primaryColor = '#a855f7' // Purple
          }

          const portColor = '#10b981'
          const selectedColor = '#ffffff'
          const hoverColor = '#ffffff'
          const baseColor = isSelected
            ? selectedColor
            : isHovered
              ? hoverColor
              : isPort
                ? portColor
                : primaryColor

          ctx.save()
          ctx.shadowColor = baseColor
          ctx.shadowBlur = isSelected || isHovered ? 15 : score > 10 ? 8 : 0

          if (isPort) {
            ctx.translate(node.x, node.y)
            ctx.rotate(Math.PI / 4)
            ctx.fillStyle = isHovered || isSelected ? '#ffffff' : '#1e293b'
            ctx.strokeStyle = baseColor
            ctx.lineWidth = 1.5 / safeScale
            ctx.beginPath()
            ctx.rect(-size, -size, size * 2, size * 2)
            ctx.fill()
            ctx.stroke()
          } else {
            ctx.beginPath()
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false)
            ctx.fillStyle = '#0f172a'
            ctx.fill()
            ctx.strokeStyle = baseColor
            ctx.lineWidth = (2 + Math.min(score / 5, 4)) / safeScale
            ctx.stroke()

            // Inner core
            ctx.beginPath()
            ctx.arc(node.x, node.y, size * 0.3, 0, 2 * Math.PI, false)
            ctx.fillStyle = baseColor
            ctx.fill()

            if (isSelected || isHovered) {
              ctx.beginPath()
              ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI, false)
              ctx.strokeStyle = baseColor
              ctx.lineWidth = 1 / safeScale
              ctx.setLineDash([2, 2])
              ctx.stroke()
              ctx.setLineDash([])
            }
          }
          ctx.restore()
          // Text Labels
          const shouldShowLabel = isPort ? showPortLabels : showNodeLabels
          if (shouldShowLabel && (safeScale > 1.2 || isSelected || isHovered)) {
            const fontSize = (isPort ? 8 : 12) / safeScale
            ctx.font = `${isSelected ? 'bold ' : ''}${fontSize}px 'Courier New', monospace`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            const label = node.label || node.id || 'N/A'
            const textWidth = ctx.measureText(label).width
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
            ctx.fillRect(node.x - textWidth / 2 - 2, node.y + size + 4, textWidth + 4, fontSize + 4)
            ctx.fillStyle = isSelected ? selectedColor : '#94a3b8'
            ctx.fillText(label, node.x, node.y + size + 6)
          }
        }}
      />
    </div>
  )
}

export default NetworkGraph
