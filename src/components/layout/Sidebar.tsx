import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  LayoutDashboard,
  Share2,
  Server,
  Settings,
  Cpu,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  Activity,
  Box,
  RefreshCcw,
  Zap,
  Check,
  X,
  MapPin,
  Laptop,
  Globe,
  Wrench,
} from 'lucide-react'

interface Props {
  initialExpanded?: boolean
  initialShowActions?: boolean
  pathname?: string
}

const Sidebar: React.FC<Props> = ({
  initialExpanded = true,
  initialShowActions = false,
  pathname = '/',
}) => {
  const [currentPath, setCurrentPath] = useState(pathname)
  const [isExpanded, setIsExpanded] = useState(initialExpanded)

  // Action States
  const [pinging, setPinging] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [polling, setPolling] = useState(false)
  const [showActions, setShowActions] = useState(initialShowActions)
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 5000)
  }

  const handleGlobalPing = async () => {
    setPinging(true)
    try {
      const response = await axios.post('/api/v0/search/device/status/ping')
      const { up, down } = response.data
      showToast(`Global Ping sequence completed: ${up} UP, ${down} DOWN`)
    } catch (err: any) {
      showToast('Ping failed: ' + (err.message || 'Unknown error'))
    } finally {
      setPinging(false)
    }
  }

  const handleGlobalScan = async () => {
    setScanning(true)
    try {
      await axios.post('/api/v0/snmp/scan/all')
      showToast('Global Subnet Scan initiated')
    } catch (err: any) {
      showToast('Scan failed: ' + (err.message || 'Unknown error'))
    } finally {
      setScanning(false)
    }
  }

  const handleGlobalPoll = async () => {
    setPolling(true)
    try {
      await axios.post('/api/v0/snmp/poll/all/all')
      showToast('Global SNMP Poll completed')
    } catch (err: any) {
      showToast('Poll failed: ' + (err.message || 'Unknown error'))
    } finally {
      setPolling(false)
    }
  }

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile && window.innerWidth < 768 && !isMobile) {
        setIsExpanded(false)
      }
    }

    // Initial check
    if (window.innerWidth < 768) {
      setIsMobile(true)
      setIsExpanded(false)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Keep it in sync if client-side navigation happens without full reload
    setCurrentPath(window.location.pathname)

    // Listen for Astro View Transitions navigation
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname)
    }

    document.addEventListener('astro:after-swap', handleNavigation)

    return () => {
      document.removeEventListener('astro:after-swap', handleNavigation)
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    // Only set cookie on desktop to avoid persistent mobile state affecting desktop
    if (!isMobile) {
      document.cookie = `sidebar-expanded=${newState}; path=/; max-age=31536000`
    }
  }

  const toggleShowActions = () => {
    const newState = !showActions
    setShowActions(newState)
    document.cookie = `sidebar-show-actions=${newState}; path=/; max-age=31536000`
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Topology', icon: Share2, path: '/graph' },
    { name: 'Monitoring', icon: Activity, path: '/monitoring' },
    { name: 'Containers', icon: Box, path: '/container' },
    { name: 'Devices', icon: Server, path: '/devices' },
    { name: 'Win-Info', icon: Laptop, path: '/win-info' },
    { name: 'Proxy', icon: Globe, path: '/proxy' },
    { name: 'Toolbox', icon: Wrench, path: '/toolbox' },
    { name: 'Locations', icon: MapPin, path: '/locations' },
    { name: 'Search', icon: Search, path: '/search' },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <aside
        className={`${isExpanded ? 'w-64' : 'w-16'} ${
          isMobile && isExpanded
            ? 'fixed inset-y-0 left-0 shadow-2xl border-r border-white/10'
            : 'relative'
        } transition-all duration-300 h-screen bg-black border-r border-white/10 flex flex-col items-center py-6 z-[100] group overflow-hidden font-mono shrink-0`}
      >
        {/* Header & Toggle */}
        <div
          className={`w-full ${isExpanded ? 'px-4' : 'px-0'} mb-10 flex items-center h-8 relative`}
        >
          <div
            className={`flex items-center transition-all duration-300 ${isExpanded ? 'justify-start gap-3' : 'w-full justify-center gap-0'}`}
          >
            <div
              className={`${isExpanded ? 'w-10 h-10' : 'w-8 h-8'} shrink-0 flex items-center justify-center transition-all duration-300`}
            >
              <img
                src="/logo.svg"
                alt="SNV Logo"
                className="w-full h-full object-contain pointer-events-none"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/logo.png' // Fallback to PNG if SVG fails
                }}
              />
            </div>
            <div
              className={`text-xs font-black text-white tracking-[0.3em] uppercase whitespace-nowrap transition-all duration-300 overflow-hidden ${
                isExpanded ? 'w-auto opacity-100 ml-3' : 'w-0 opacity-0 ml-0'
              }`}
            >
              none.snmp
            </div>
          </div>

          {isExpanded && (
            <button
              onClick={toggleSidebar}
              className="absolute right-4 p-1.5 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors border border-white/5"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {!isExpanded && (
            <button
              onClick={toggleSidebar}
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
              title="Expand Sidebar"
            />
          )}
        </div>
        {/* Main Navigation */}
        <nav className="flex-1 w-full space-y-2 px-3">
          {menuItems.map((item) => {
            const isActive =
              currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))
            return (
              <a
                key={item.name}
                href={item.path}
                className={`flex items-center h-11 px-2.5 transition-all relative ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 min-w-[20px] shrink-0" />
                <span
                  className={`ml-4 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 overflow-hidden ${
                    isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
                  }`}
                >
                  {item.name}
                </span>
                {isActive && (
                  <div
                    className={`absolute left-0 w-0.5 h-6 ${isExpanded ? 'bg-black' : 'bg-white'}`}
                  />
                )}
              </a>
            )
          })}
        </nav>
        {/* Bottom Navigation (Settings & Status) */}
        <div className="w-full px-3 space-y-4 pt-4 border-t border-white/5">
          {/* Global Actions Section */}
          <div className="space-y-1">
            {/* Header with toggle - only shown when sidebar is expanded */}
            {isExpanded && (
              <button
                onClick={toggleShowActions}
                className="w-full flex items-center justify-between px-2.5 mb-2 group transition-all duration-300"
              >
                <div className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em]">
                  Global_Ops
                </div>
                {showActions ? (
                  <ChevronUp className="w-3 h-3 text-neutral-600" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-neutral-600" />
                )}
              </button>
            )}

            {/* When sidebar is collapsed: always show icons vertically */}
            {!isExpanded && (
              <div className="space-y-1">
                <button
                  onClick={handleGlobalPing}
                  disabled={pinging}
                  title="Ping all devices"
                  className={`w-full flex items-center justify-center h-10 transition-all ${
                    pinging
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <Activity className={`w-4 h-4 ${pinging ? 'animate-pulse' : ''}`} />
                </button>

                <button
                  onClick={handleGlobalScan}
                  disabled={scanning}
                  title="Rescan all subnets"
                  className={`w-full flex items-center justify-center h-10 transition-all ${
                    scanning
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <RefreshCcw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleGlobalPoll}
                  disabled={polling}
                  title="Poll all devices"
                  className={`w-full flex items-center justify-center h-10 transition-all ${
                    polling
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <Zap className={`w-4 h-4 ${polling ? 'animate-bounce' : ''}`} />
                </button>
              </div>
            )}

            {/* When sidebar is expanded: show based on showActions state */}
            {isExpanded && showActions && (
              <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                <button
                  onClick={handleGlobalPing}
                  disabled={pinging}
                  title="Ping all devices"
                  className={`w-full flex items-center h-10 px-2.5 transition-all relative group overflow-hidden ${
                    pinging
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <Activity
                    className={`w-4 h-4 min-w-[16px] shrink-0 ${pinging ? 'animate-pulse' : ''}`}
                  />
                  <span className="ml-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                    {pinging ? 'Pinging...' : 'Ping.All'}
                  </span>
                  {pinging && (
                    <div className="absolute bottom-0 left-0 h-[1px] bg-emerald-500 animate-[shimmer_2s_infinite]" />
                  )}
                </button>

                <button
                  onClick={handleGlobalScan}
                  disabled={scanning}
                  title="Rescan all subnets"
                  className={`w-full flex items-center h-10 px-2.5 transition-all relative group overflow-hidden ${
                    scanning
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <RefreshCcw
                    className={`w-4 h-4 min-w-[16px] shrink-0 ${scanning ? 'animate-spin' : ''}`}
                  />
                  <span className="ml-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                    {scanning ? 'Scanning...' : 'Scan.All'}
                  </span>
                </button>

                <button
                  onClick={handleGlobalPoll}
                  disabled={polling}
                  title="Poll all devices"
                  className={`w-full flex items-center h-10 px-2.5 transition-all relative group overflow-hidden ${
                    polling
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <Zap
                    className={`w-4 h-4 min-w-[16px] shrink-0 ${polling ? 'animate-bounce' : ''}`}
                  />
                  <span className="ml-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                    {polling ? 'Polling...' : 'Poll.All'}
                  </span>
                </button>
              </div>
            )}

            {/* When sidebar is expanded but actions collapsed: show icons horizontally */}
            {isExpanded && !showActions && (
              <div className="flex items-center gap-1 animate-in fade-in duration-200 justify-start px-2.5">
                <button
                  onClick={handleGlobalPing}
                  disabled={pinging}
                  title="Ping all devices"
                  className={`p-2 transition-all rounded-sm ${
                    pinging
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <Activity className={`w-4 h-4 ${pinging ? 'animate-pulse' : ''}`} />
                </button>

                <button
                  onClick={handleGlobalScan}
                  disabled={scanning}
                  title="Rescan all subnets"
                  className={`p-2 transition-all rounded-sm ${
                    scanning
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <RefreshCcw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleGlobalPoll}
                  disabled={polling}
                  title="Poll all devices"
                  className={`p-2 transition-all rounded-sm ${
                    polling
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <Zap className={`w-4 h-4 ${polling ? 'animate-bounce' : ''}`} />
                </button>
              </div>
            )}
          </div>

          <a
            href="/settings"
            className={`flex items-center h-11 px-2.5 transition-all relative ${
              currentPath.startsWith('/settings')
                ? 'bg-white text-black'
                : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5 min-w-[20px] shrink-0" />
            <span
              className={`ml-4 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 overflow-hidden ${
                isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
              }`}
            >
              System_Settings
            </span>
          </a>
        </div>

        {/* Global Toast */}
        {toast.visible && (
          <div className="fixed bottom-8 right-8 z-[300] animate-in slide-in-from-right-full duration-500">
            <div className="bg-black border border-white/20 p-4 min-w-[300px] shadow-2xl flex items-center gap-4">
              <div className="w-8 h-8 rounded-none border border-white/20 flex items-center justify-center bg-white/5">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">
                  Global.Ops.Status
                </div>
                <div className="text-[11px] text-neutral-400 uppercase tracking-tighter">
                  {toast.message}
                </div>
              </div>
              <button
                onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
                className="p-1 hover:bg-white/5 text-neutral-600 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="h-0.5 bg-neutral-800 w-full overflow-hidden">
              <div className="h-full bg-white animate-progress-shrink origin-left" />
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar
