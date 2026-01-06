import React, { useState, useEffect } from 'react'
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
  Menu,
} from 'lucide-react'

interface Props {
  initialExpanded?: boolean
  pathname?: string
}

const Sidebar: React.FC<Props> = ({ initialExpanded = false, pathname = '/' }) => {
  const [currentPath, setCurrentPath] = useState(pathname)
  const [isExpanded, setIsExpanded] = useState(initialExpanded)

  useEffect(() => {
    // Keep it in sync if client-side navigation happens without full reload
    setCurrentPath(window.location.pathname)
  }, [])

  const toggleSidebar = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    // Set cookie for server-side persistence (valid for 1 year)
    document.cookie = `sidebar-expanded=${newState}; path=/; max-age=31536000`
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Topology', icon: Share2, path: '/graph' },
    { name: 'Devices', icon: Server, path: '/devices' },
    { name: 'Search', icon: Search, path: '/search' },
  ]

  return (
    <aside
      className={`${
        isExpanded ? 'w-64' : 'w-16'
      } transition-all duration-300 h-screen bg-black border-r border-white/10 flex flex-col items-center py-6 z-[100] group overflow-hidden font-mono shrink-0`}
    >
      {/* Header & Toggle */}
      <div className="w-full px-4 mb-10 flex items-center h-8 relative">
        <div
          className={`flex items-center gap-3 transition-all duration-300 ${isExpanded ? 'justify-start' : 'mx-auto'}`}
        >
          <div className="w-8 h-8 shrink-0 border border-white flex items-center justify-center bg-white/5">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          {isExpanded && (
            <div className="text-xs font-black text-white tracking-[0.3em] uppercase whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
              SNMP.v2
            </div>
          )}
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
              {isExpanded && (
                <span className="ml-4 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap animate-in fade-in duration-500">
                  {item.name}
                </span>
              )}
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
        <a
          href="/settings/snmp"
          className={`flex items-center h-11 px-2.5 transition-all relative ${
            currentPath.startsWith('/settings')
              ? 'bg-white text-black'
              : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5 min-w-[20px] shrink-0" />
          {isExpanded && (
            <span className="ml-4 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap animate-in fade-in duration-500">
              System_Settings
            </span>
          )}
        </a>

        <div className="flex flex-col items-center overflow-hidden">
          <div
            className={`w-full flex items-center gap-4 px-2.5 py-3 bg-white/5 border border-white/5 transition-all ${isExpanded ? 'justify-start' : 'justify-center'}`}
          >
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
            {isExpanded && (
              <div className="flex flex-col animate-in fade-in duration-500">
                <span className="text-[10px] text-neutral-400 uppercase font-black">
                  Auth.Session
                </span>
                <span className="text-[11px] text-white font-bold uppercase truncate">
                  Admin_Root
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          className={`flex items-center h-8 transition-all ${isExpanded ? 'px-2.5' : 'justify-center'}`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          {isExpanded && (
            <span className="ml-3 text-[10px] text-neutral-400 uppercase tracking-widest font-black animate-in fade-in duration-500">
              System.Online
            </span>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
