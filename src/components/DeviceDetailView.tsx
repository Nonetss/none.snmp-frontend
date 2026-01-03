import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Server, 
  MapPin, 
  Cpu, 
  RefreshCcw,
  AlertCircle,
  Network,
  Database,
  Info,
  Activity,
  ArrowLeft,
  Shield,
  Clock,
  Box
} from "lucide-react";

interface DeviceDetail {
  id: number;
  ipv4: string;
  name: string;
  system: {
    sysDescr: string;
    sysUpTime: string;
    sysContact: string;
    sysName: string;
    sysLocation: string;
  };
  interfaces: any[];
  resources: any[];
  [key: string]: any;
}

interface Props {
  deviceId: string;
}

const DeviceDetailView: React.FC<Props> = ({ deviceId }) => {
  const [device, setDevice] = useState<DeviceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllInterfaces, setShowAllInterfaces] = useState(false);

  const [showAllNeighbors, setShowAllNeighbors] = useState(false);

  const fetchDevice = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const hostname = window.location.hostname;
      const response = await axios.get(`http://${hostname}:3000/api/v1/search/device?id=${deviceId}`);
      if (response.data && response.data.length > 0) {
        setDevice(response.data[0]);
      } else {
        setError("Device not found.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch device details");
    } finally {
      setLoading(false);
    }
  };

  const handleFullPoll = async () => {
    setPolling(true);
    try {
      const hostname = window.location.hostname;
      await axios.post(`http://${hostname}:3000/api/v1/snmp/device/poll/${deviceId}/all`);
      // Re-fetch data after successful poll
      await fetchDevice(true);
    } catch (err: any) {
      console.error("Poll failed:", err);
      alert("CRITICAL_ERROR: SNMP_POLL_FAILED");
    } finally {
      setPolling(false);
    }
  };

  useEffect(() => {
    if (deviceId) fetchDevice();
  }, [deviceId]);

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-black text-white font-mono">
      <div className="flex flex-col items-center gap-4">
        <RefreshCcw className="w-8 h-8 animate-spin text-white" />
        <span className="text-[10px] tracking-[0.3em] uppercase">Deep.Scanning(ID:{deviceId})</span>
      </div>
    </div>
  );

  if (error || !device) return (
    <div className="p-8 text-white font-mono bg-black h-full flex items-center justify-center">
      <div className="border border-white/20 p-8 flex flex-col items-center gap-4 max-w-md">
        <AlertCircle className="w-10 h-10 text-white" />
        <p className="text-xs uppercase tracking-widest text-center">{error || "CRITICAL_ERROR: NODE_NOT_FOUND"}</p>
        <a href="/devices" className="mt-4 px-6 py-2 border border-white text-xs hover:bg-white hover:text-black transition-all uppercase">Back.To.Inventory()</a>
      </div>
    </div>
  );

  const displayedInterfaces = showAllInterfaces 
    ? device.interfaces 
    : device.interfaces?.slice(0, 4);

  const hasNeighbors = (device.neighbor_discovery?.outbound?.length > 0) || (device.neighbor_discovery?.inbound?.length > 0);

  return (
    <div className="bg-black text-white font-mono min-h-screen w-full">
      {/* Header Bar */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <a href="/devices" className="p-2 border border-white/10 hover:bg-white hover:text-black transition-all group">
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-white" />
              <h1 className="text-xl font-bold tracking-tighter uppercase">{device.name}</h1>
            </div>
            <div className="flex items-center gap-3 text-[9px] text-neutral-500 uppercase tracking-widest font-bold">
              <span className="flex items-center gap-1"><Server className="w-3 h-3" /> ID:{device.id}</span>
              <span className="flex items-center gap-1 text-white"><div className="w-1 h-1 bg-white rounded-full animate-pulse" /> {device.ipv4}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleFullPoll} 
            disabled={polling}
            className={`px-4 py-2 border border-white/10 text-[10px] uppercase font-bold transition-all flex items-center gap-2 ${
              polling ? "bg-white text-black animate-pulse" : "hover:bg-white/5"
            }`}
          >
            {polling ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
            {polling ? "Polling..." : "Full.SNMP.Poll()"}
          </button>
          <button onClick={() => fetchDevice()} className="px-4 py-2 border border-white/10 text-[10px] uppercase font-bold hover:bg-white/5 flex items-center gap-2">
            <RefreshCcw className="w-3 h-3" /> Re-Scan
          </button>
          <div className="px-4 py-2 border border-white/20 bg-white text-black text-[10px] uppercase font-bold">
            Status: Managed
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8 max-w-[1800px] mx-auto">
        {/* TOP ROW: System & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Card */}
          <section className="lg:col-span-2 bg-neutral-900/20 border border-white/10 p-6 space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-4">
              <Info className="w-4 h-4" /> system_specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] text-neutral-600 uppercase font-bold tracking-widest">Description</span>
                  <p className="text-xs text-neutral-400 italic leading-relaxed border-l-2 border-white/10 pl-4 py-1">
                    "{device.system?.sysDescr}"
                  </p>
                </div>
                <div className="flex justify-between items-center text-[10px] pt-4">
                  <span className="text-neutral-500 uppercase">SysName</span>
                  <span className="font-bold">{device.system?.sysName || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[8px] text-neutral-600 uppercase font-bold">Location</span>
                    <div className="flex items-center gap-2 text-xs text-white">
                      <MapPin className="w-3 h-3 text-neutral-500" />
                      <span className="uppercase">{device.system?.sysLocation || "N/A"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] text-neutral-600 uppercase font-bold">Uptime</span>
                    <div className="flex items-center gap-2 text-xs text-white">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      <span>{device.system?.sysUpTime ? new Date(device.system.sysUpTime).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-neutral-500 uppercase">Contact</span>
                    <span className="font-bold">{device.system?.sysContact || "NOT_DEFINED"}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-neutral-500 uppercase">Services_Bitmask</span>
                    <span className="font-bold">{device.system?.sysServices}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Resources Card */}
          <section className="bg-neutral-900/10 border border-white/5 p-6 space-y-4">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
              <Database className="w-4 h-4" /> hardware_resources
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {device.resources?.map((res: any, i: number) => (
                <div key={i} className="p-3 bg-white/5 border border-transparent hover:border-white/10 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-white uppercase">{res.name}</span>
                    <span className="text-[8px] px-1 bg-white/10 text-neutral-400 uppercase tracking-tighter">{res.type}</span>
                  </div>
                  <p className="text-[9px] text-neutral-600 italic line-clamp-1">{res.value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* MIDDLE ROW: Networking Table & Interfaces */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interfaces */}
          <section className="lg:col-span-2 bg-neutral-900/20 border border-white/10 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
                <Network className="w-4 h-4" /> interface_matrix
              </h3>
              <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">
                Nodes.Count: {device.interfaces?.length}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500">
              {displayedInterfaces?.map((iface: any, i: number) => (
                <div key={i} className="p-4 bg-neutral-900/40 border border-white/5 hover:border-white/20 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white uppercase group-hover:tracking-wider transition-all">
                        {iface.ifDescr || iface.ifName || "IFACE_ID:"+iface.ifIndex}
                      </span>
                      <span className="text-[8px] text-neutral-600 font-bold uppercase">Index: {iface.ifIndex}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                      <span className="text-[8px] text-neutral-600 uppercase font-bold">Active</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-4 pt-2 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[7px] text-neutral-700 uppercase font-bold mb-1">Physical Address</span>
                      <span className="text-[10px] font-mono text-neutral-400">{iface.ifPhysAddress || "00:00:00:00:00:00"}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[7px] text-neutral-700 uppercase font-bold mb-1">Max Speed</span>
                      <span className="text-[10px] font-mono text-neutral-400">{(parseInt(iface.ifSpeed) / 1000000).toFixed(0)} MBPS</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7px] text-neutral-700 uppercase font-bold mb-1">MTU Size</span>
                      <span className="text-[10px] font-mono text-neutral-400">{iface.ifMtu} BYTES</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[7px] text-neutral-700 uppercase font-bold mb-1">Protocol Type</span>
                      <span className="text-[10px] font-mono text-neutral-400">TYPE_{iface.ifType}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {device.interfaces?.length > 4 && (
              <div className="pt-4 flex justify-center">
                <button 
                  onClick={() => setShowAllInterfaces(!showAllInterfaces)}
                  className="px-8 py-2 border border-white/20 text-[10px] uppercase font-bold hover:bg-white hover:text-black transition-all tracking-widest"
                >
                  {showAllInterfaces ? "Collapse.Matrix()" : `Expand.Matrix(${device.interfaces.length - 4}.More)`}
                </button>
              </div>
            )}
          </section>

          {/* IP Addresses Table */}
          <section className="bg-neutral-900/10 border border-white/5 p-6 space-y-4">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-3">
              <Activity className="w-4 h-4" /> ipv4_address_table
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {device.ipSnmp?.addrEntries?.map((addr: any, i: number) => (
                <div key={i} className="p-3 border border-white/5 bg-neutral-900/40">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">{addr.ipAdEntAddr}</span>
                    <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-tighter">IF_INDEX: {addr.ipAdEntIfIndex}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-neutral-500">
                    <span className="uppercase">Mask: {addr.ipAdEntNetMask}</span>
                    <span className="uppercase">MTU: {addr.ipAdEntReasmMaxSize}</span>
                  </div>
                </div>
              ))}
              {device.ipSnmp?.addrEntries?.length === 0 && (
                <div className="text-center py-8 text-[8px] text-neutral-700 uppercase italic">No IP entries found</div>
              )}
            </div>
          </section>
        </div>

        {/* BOTTOM SECTION: Routes & Physical Inventory */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Routing Table */}
          <section className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-4">
              <RefreshCcw className="w-4 h-4" /> active_routing_table
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[8px] text-neutral-500 uppercase tracking-widest border-b border-white/5">
                    <th className="pb-2">Destination</th>
                    <th className="pb-2">Next_Hop</th>
                    <th className="pb-2">Interface</th>
                    <th className="pb-2">Protocol</th>
                    <th className="pb-2 text-right">Metric</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {device.routes?.map((route: any, i: number) => (
                    <tr key={i} className="text-[10px] group hover:bg-white/5">
                      <td className="py-2 text-white font-bold">{route.dest}</td>
                      <td className="py-2 text-neutral-400">{route.nextHop}</td>
                      <td className="py-2 text-neutral-500">IF_{route.ifIndex}</td>
                      <td className="py-2 text-neutral-600 uppercase italic">{route.proto}</td>
                      <td className="py-2 text-right text-neutral-400 font-bold">{route.metric1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {device.routes?.length === 0 && (
                <div className="text-center py-8 text-[8px] text-neutral-700 uppercase italic">Routing table is empty</div>
              )}
            </div>
          </section>

          {/* Physical Inventory */}
          <section className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-4">
              <Box className="w-4 h-4" /> physical_inventory_FRU
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {device.physicalEntities?.map((entity: any, i: number) => (
                <div key={i} className="p-3 bg-white/5 border border-transparent hover:border-white/10 transition-all">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white uppercase">{entity.name}</span>
                    <span className="text-[8px] text-neutral-500 font-bold uppercase">{entity.class}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <span className="text-neutral-600 italic line-clamp-1">"{entity.descr}"</span>
                    <div className="text-right flex flex-col">
                      <span className="text-white font-mono">{entity.serialNum || "NO_SERIAL"}</span>
                      <span className="text-neutral-700 uppercase tracking-tighter">{entity.mfgName} {entity.modelName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* FOOTER ROW: Bridge & Discovery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="bg-neutral-900/10 border border-white/5 p-6 space-y-4">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-3">
              <Box className="w-4 h-4" /> bridge_architecture
            </h3>
            <div className="space-y-4 pt-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-neutral-600 uppercase">Bridge Addr</span>
                <span className="font-mono text-white">{device.bridge?.base?.bridgeAddress || "NULL"}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-neutral-600 uppercase">Active Ports</span>
                <span className="font-mono text-white">{device.bridge?.base?.numPorts || 0}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-neutral-600 uppercase">Device Type</span>
                <span className="font-mono text-white">CLASS_{device.bridge?.base?.type || 0}</span>
              </div>
            </div>
          </section>

          <section className="lg:col-span-2 bg-neutral-900/10 border border-white/5 p-6 space-y-4">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-3">
              <Network className="w-4 h-4" /> neighbor_discovery_matrix
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hasNeighbors ? (
                <>
                  <div className="space-y-2">
                    <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest">Outbound.Neighbors</span>
                    {(showAllNeighbors ? device.neighbor_discovery?.outbound : device.neighbor_discovery?.outbound?.slice(0, 2))?.map((n: any, i: number) => (
                      <div key={`out-${i}`} className="p-3 border border-white/5 bg-white/5 flex flex-col gap-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-bold text-white uppercase">{n.sysName || n.remoteDeviceName || "REMOTE_NODE"}</span>
                          <span className="text-[8px] px-1 bg-white/10 text-neutral-400">{n.protocol}</span>
                        </div>
                        <span className="text-[9px] text-neutral-500 uppercase tracking-tighter">Local: {n.portId} {'->'} Remote: {n.portDesc}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest">Inbound.Discovery</span>
                    {(showAllNeighbors ? device.neighbor_discovery?.inbound : device.neighbor_discovery?.inbound?.slice(0, 2))?.map((n: any, i: number) => (
                      <div key={`in-${i}`} className="p-3 border border-white/5 bg-white/5 flex flex-col gap-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-bold text-white uppercase">{n.neighborSysName || n.remoteDeviceName || "DETECTED_NODE"}</span>
                          <span className="text-[8px] px-1 bg-white/10 text-neutral-400">{n.protocol}</span>
                        </div>
                        <span className="text-[9px] text-neutral-500 uppercase tracking-tighter">Address: {n.address || "N/A"} | Port: {n.neighborPort}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="col-span-2 h-24 flex items-center justify-center border border-dashed border-white/10">
                  <span className="text-[8px] text-neutral-600 uppercase tracking-widest">No active neighbors found</span>
                </div>
              )}
            </div>
            {hasNeighbors && (device.neighbor_discovery?.outbound?.length > 2 || device.neighbor_discovery?.inbound?.length > 2) && (
              <div className="pt-2 flex justify-center">
                <button 
                  onClick={() => setShowAllNeighbors(!showAllNeighbors)}
                  className="w-full py-1.5 border border-white/10 text-[9px] uppercase font-bold hover:bg-white/5 transition-all tracking-widest"
                >
                  {showAllNeighbors ? "Collapse.Discovery()" : "Expand.Discovery_Matrix()"}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailView;
