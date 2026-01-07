import React from 'react'
import { Settings2 } from 'lucide-react'

interface SettingsPanelProps {
  showNodeLabels: boolean
  setShowNodeLabels: (v: boolean) => void
  showPortLabels: boolean
  setShowPortLabels: (v: boolean) => void
  showPorts: boolean
  setShowPorts: (v: boolean) => void
  showParticles: boolean
  setShowParticles: (v: boolean) => void
  forceStrength: number
  setForceStrength: (v: number) => void
  linkDistance: number
  setLinkDistance: (v: number) => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  showNodeLabels,
  setShowNodeLabels,
  showPortLabels,
  setShowPortLabels,
  showPorts,
  setShowPorts,
  showParticles,
  setShowParticles,
  forceStrength,
  setForceStrength,
  linkDistance,
  setLinkDistance,
}) => {
  return (
    <div className="bg-black/95 border border-white/20 p-4 shadow-lg space-y-5 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-md fixed top-16 right-4 left-4 md:left-auto md:w-[400px] font-mono z-50">
      <div className="flex items-center justify-between border-b border-white/20 pb-2">
        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.2em]">
          sys.config
        </span>
        <Settings2 className="w-3 h-3 text-white" />
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-[400px]">
        {[
          {
            label: 'Labels.Node',
            value: showNodeLabels,
            set: setShowNodeLabels,
          },
          {
            label: 'Labels.Port',
            value: showPortLabels,
            set: setShowPortLabels,
          },
          {
            label: 'Visual.Ports',
            value: showPorts,
            set: setShowPorts,
          },
          {
            label: 'Visual.Flow',
            value: showParticles,
            set: setShowParticles,
          },
        ].map((cfg) => (
          <label key={cfg.label} className="flex items-center justify-between cursor-pointer group">
            <span className="text-[10px] text-neutral-400 group-hover:text-white transition-colors">
              {cfg.label}
            </span>
            <div
              className={`w-3 h-3 border border-white/40 transition-all ${
                cfg.value ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'bg-transparent'
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
            label: 'Phys.Repulsion',
            value: forceStrength,
            min: -1000,
            max: -50,
            step: 50,
            set: (v: string) => setForceStrength(parseInt(v)),
          },
          {
            label: 'Phys.Distance',
            value: linkDistance,
            min: 30,
            max: 350,
            step: 10,
            set: (v: string) => setLinkDistance(parseInt(v)),
          },
        ].map((slider) => (
          <div key={slider.label} className="space-y-1.5">
            <div className="flex justify-between items-center text-[9px] uppercase">
              <span className="text-neutral-500">{slider.label}</span>
              <span className="text-white font-bold">{slider.value}</span>
            </div>
            <input
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={slider.value}
              onChange={(e) => slider.set(e.target.value)}
              className="w-full h-0.5 bg-neutral-800 appearance-none cursor-pointer accent-white"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
