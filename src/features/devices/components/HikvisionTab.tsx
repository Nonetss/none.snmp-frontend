import React from 'react'
import { Camera, Cpu, HardDrive, Network, Settings, Info, Video, Bell, Mic } from 'lucide-react'
import type { DeviceDetail } from '@/features/devices/components/types'

interface HikvisionTabProps {
  device: DeviceDetail
}

export const HikvisionTab: React.FC<HikvisionTabProps> = ({ device }) => {
  const hik = device.hikvision

  if (!hik) return null

  const InfoItem = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string
    value: string | number | null | undefined
    icon?: any
  }) => (
    <div className="flex flex-col gap-1 p-3 bg-white/5 border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3 text-neutral-500" />}
        <span className="text-[8px] text-neutral-500 uppercase font-bold tracking-widest">
          {label}
        </span>
      </div>
      <span className="text-[10px] text-white font-mono break-all">{value ?? 'N/A'}</span>
    </div>
  )

  const ProgressBar = ({
    label,
    value,
    percentage,
    icon: Icon,
  }: {
    label: string
    value: string
    percentage: string | null | undefined
    icon?: any
  }) => {
    const numericPercentage = percentage ? parseInt(percentage.replace(/[^0-9]/g, '')) : 0
    return (
      <div className="space-y-2 p-3 bg-white/5 border border-white/5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-3 h-3 text-neutral-500" />}
            <span className="text-[8px] text-neutral-500 uppercase font-bold tracking-widest">
              {label}
            </span>
          </div>
          <span className="text-[10px] text-white font-mono">{value}</span>
        </div>
        <div className="h-1 bg-white/5 w-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${numericPercentage}%` }}
          />
        </div>
        <div className="flex justify-end">
          <span className="text-[8px] text-neutral-500 font-bold">{numericPercentage}%</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Device Info */}
        <section className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-4">
            <Info className="w-4 h-4" /> device_identity
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <InfoItem label="Manufacturer" value={hik.manufacturer} />
            <InfoItem label="Device Type" value={hik.deviceType} />
            <InfoItem label="Hardware Version" value={hik.hardwVersion} />
            <InfoItem label="Software Version" value={hik.softwVersion} />
            <InfoItem label="MAC Address" value={hik.macAddr} />
            <InfoItem label="Device ID / Serial" value={hik.deviceID} />
            <InfoItem label="System Time" value={hik.sysTime} />
          </div>
        </section>

        {/* System Resources */}
        <section className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-4">
            <Cpu className="w-4 h-4" /> system_resources
          </h3>
          <div className="space-y-4">
            <ProgressBar
              label="CPU Usage"
              value={hik.cpuPercent || 'N/A'}
              percentage={hik.cpuPercent}
              icon={Cpu}
            />
            <ProgressBar
              label="Memory"
              value={`${hik.memUsed || 'N/A'} / ${hik.memSize || 'N/A'}`}
              percentage={hik.memUsed}
              icon={Settings}
            />
            <ProgressBar
              label="Disk Usage"
              value={`${hik.diskPercent || 'N/A'} / ${hik.diskSize || 'N/A'}`}
              percentage={hik.diskPercent}
              icon={HardDrive}
            />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <InfoItem label="Disk Count" value={hik.hikDiskNum} />
              <InfoItem label="Uptime" value={device.system?.sysUpTime} />
            </div>
          </div>
        </section>

        {/* Network Config */}
        <section className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-4">
            <Network className="w-4 h-4" /> network_configuration
          </h3>
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-[8px] text-neutral-600 uppercase font-bold tracking-[0.2em]">
                Static Settings
              </span>
              <div className="grid grid-cols-1 gap-2">
                <InfoItem label="IP Address" value={hik.staticIpAddr} />
                <InfoItem label="Netmask" value={hik.staticNetMask} />
                <InfoItem label="Gateway" value={hik.staticGateway} />
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-[8px] text-neutral-600 uppercase font-bold tracking-[0.2em]">
                External Services
              </span>
              <div className="grid grid-cols-1 gap-2">
                <InfoItem label="NTP Server" value={hik.ntpServIpAddr} />
                <InfoItem label="Manage Server" value={hik.manageServAddr} />
                <InfoItem label="Access Type" value={hik.netAccessType} />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Capabilities */}
        <section className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-4">
            <Video className="w-4 h-4" /> hardware_capabilities
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 border border-white/10 flex flex-col items-center text-center gap-2">
              <Video className="w-5 h-5 text-white" />
              <span className="text-[10px] text-white font-bold">{hik.videoInChanNum}</span>
              <span className="text-[8px] text-neutral-500 uppercase">Video Channels</span>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 flex flex-col items-center text-center gap-2">
              <Mic className="w-5 h-5 text-white" />
              <span className="text-[10px] text-white font-bold">{hik.audioInNum}</span>
              <span className="text-[8px] text-neutral-500 uppercase">Audio Inputs</span>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 flex flex-col items-center text-center gap-2">
              <Bell className="w-5 h-5 text-white" />
              <span className="text-[10px] text-white font-bold">
                {hik.alarmInChanNum} / {hik.alarmOutChanNum}
              </span>
              <span className="text-[8px] text-neutral-500 uppercase">Alarm IO</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <InfoItem label="Video Encoding" value={hik.videoEncode} />
            <InfoItem label="Net Transmission" value={hik.videoNetTrans} />
            <InfoItem label="Clarity Channels" value={hik.clarityChanNum} />
            <InfoItem label="Local Storage" value={hik.localStorage ? 'ENABLED' : 'DISABLED'} />
            <InfoItem label="RTSP Playback" value={hik.rtspPlayBack ? 'ENABLED' : 'DISABLED'} />
            <InfoItem label="Audio Ability" value={hik.audioAbility ? 'ENABLED' : 'DISABLED'} />
          </div>
        </section>

        {/* Extended Info */}
        <section className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-4">
            <Settings className="w-4 h-4" /> extended_parameters
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="Object ID" value={hik.hikObjectID} />
            <InfoItem label="Object Name" value={hik.hikObjectName} />
            <InfoItem label="Trap Host" value={hik.hikTrapHostIp1} />
            <InfoItem label="Manage Port" value={hik.managePort} />
            <InfoItem label="Device Language" value={hik.hikDeviceLanguage} />
            <InfoItem label="Device Status" value={hik.hikDeviceStatus} />
          </div>
        </section>
      </div>
    </div>
  )
}
