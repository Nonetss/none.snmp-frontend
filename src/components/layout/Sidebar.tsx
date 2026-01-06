import React from 'react'
import {
  LayoutDashboard,
  Share2,
  Server,
  Settings,
  Terminal,
  Cpu,
  ShieldCheck,
  Zap,
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const [currentPath, setCurrentPath] = React.useState('/')

  React.useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Topology', icon: Share2, path: '/graph' },
    { name: 'Devices', icon: Server, path: '/devices' },
  ]

  const systemItems = [
    { name: 'Settings', icon: Settings, path: '#' },
    { name: 'Terminal', icon: Terminal, path: '#' },
  ]

  return (
    <aside className="w-16 hover:w-48 transition-all duration-300 h-screen bg-black border-r border-white/10 flex flex-col items-center py-6 z-[100] group overflow-hidden font-mono">
      {/* Logo Area */}
      <div className="mb-10 flex flex-col items-center">
        <div className="w-8 h-8 border border-white flex items-center justify-center mb-2">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div className="hidden group-hover:block text-[8px] font-bold text-white tracking-[0.4em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          SNMP.v2
        </div>
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
              className={`flex items-center h-10 px-2 rounded-none transition-all group/item ${
                isActive
                  ? 'bg-white text-black'
                  : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 min-w-[20px]" />
              <span className="ml-4 text-[10px] font-bold uppercase tracking-widest hidden group-hover:block whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {item.name}
              </span>
              {isActive && (
                <div className="absolute left-0 w-0.5 h-6 bg-white hidden group-hover:block" />
              )}
            </a>
          )
        })}

        <div className="h-px bg-white/5 my-4 mx-2" />

        {systemItems.map((item) => (
          <a
            key={item.name}
            href={item.path}
            className="flex items-center h-10 px-2 text-neutral-600 hover:text-neutral-400 transition-all group/item cursor-not-allowed opacity-50"
          >
            <item.icon className="w-5 h-5 min-w-[20px]" />
            <span className="ml-4 text-[10px] font-bold uppercase tracking-widest hidden group-hover:block whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {item.name}
            </span>
          </a>
        ))}
      </nav>

      {/* Footer / Status Area */}
      <div className="mt-auto px-3 w-full space-y-4">
        <div className="flex flex-col items-center group-hover:items-start transition-all">
          <div className="p-2 border border-white/5 rounded-none">
            <ShieldCheck className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="hidden group-hover:block mt-2">
            <div className="text-[7px] text-neutral-700 uppercase tracking-tighter">
              Auth.Session
            </div>
            <div className="text-[8px] text-white font-bold uppercase tracking-widest">
              Admin_Root
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center group-hover:justify-start h-8">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="ml-3 text-[8px] text-neutral-500 uppercase tracking-widest hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            System.Online
          </span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
