import React, { useState, useMemo } from "react";
import { Network, Activity, Filter } from "lucide-react";
import type {
  DeviceDetail,
  Interface,
  AddrEntry,
} from "@/features/devices/components/types";

interface InterfacesTabProps {
  device: DeviceDetail;
}

type StatusFilter = "all" | "up" | "down";

export const InterfacesTab: React.FC<InterfacesTabProps> = ({ device }) => {
  const [showAllInterfaces, setShowAllInterfaces] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredInterfaces = useMemo(() => {
    if (!device.interfaces) return [];
    return device.interfaces.filter((iface) => {
      if (statusFilter === "all") return true;
      const isUp = iface.latestData?.ifOperStatus === 1;
      return statusFilter === "up" ? isUp : !isUp;
    });
  }, [device.interfaces, statusFilter]);

  const displayedInterfaces = showAllInterfaces
    ? filteredInterfaces
    : filteredInterfaces.slice(0, 10);

  const stats = useMemo(() => {
    const total = device.interfaces?.length || 0;
    const up =
      device.interfaces?.filter((i) => i.latestData?.ifOperStatus === 1)
        .length || 0;
    return { total, up, down: total - up };
  }, [device.interfaces]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-neutral-900/20 border border-white/10 p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
              <Network className="w-4 h-4" /> interface_matrix
            </h3>

            <div className="flex items-center gap-2 bg-white/5 p-1 border border-white/10">
              {(["all", "up", "down"] as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1 text-[8px] uppercase font-bold transition-all ${
                    statusFilter === f
                      ? "bg-white text-black"
                      : "text-neutral-500 hover:text-white"
                  }`}
                >
                  {f} (
                  {f === "all"
                    ? stats.total
                    : f === "up"
                      ? stats.up
                      : stats.down}
                  )
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedInterfaces.map((iface: Interface, i: number) => (
              <div
                key={i}
                className="p-4 bg-neutral-900/40 border border-white/5 hover:border-white/20 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white uppercase group-hover:tracking-wider transition-all">
                      {iface.ifDescr ||
                        iface.ifName ||
                        "IFACE_ID:" + iface.ifIndex}
                    </span>
                    <span className="text-[8px] text-neutral-600 font-bold uppercase">
                      Index: {iface.ifIndex}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div
                      className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] ${iface.latestData?.ifOperStatus === 1 ? "bg-white" : "bg-neutral-800 border border-white/20"}`}
                    />
                    <span className="text-[8px] text-neutral-600 uppercase font-bold">
                      {iface.latestData?.ifOperStatus === 1 ? "Active" : "Down"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 pt-2 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[7px] text-neutral-700 uppercase font-bold mb-1">
                      Physical Address
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {iface.ifPhysAddress || "00:00:00:00:00:00"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[7px] text-neutral-700 uppercase font-bold mb-1">
                      Max Speed
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {(parseInt(iface.ifSpeed) / 1000000).toFixed(0)} MBPS
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] text-neutral-700 uppercase font-bold mb-1">
                      MTU Size
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {iface.ifMtu} BYTES
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[7px] text-neutral-700 uppercase font-bold mb-1">
                      Protocol Type
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      TYPE_{iface.ifType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {filteredInterfaces.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed border-white/10">
                <span className="text-[10px] text-neutral-600 uppercase tracking-widest">
                  No interfaces match the selected filter
                </span>
              </div>
            )}
          </div>

          {filteredInterfaces.length > 10 && (
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setShowAllInterfaces(!showAllInterfaces)}
                className="px-8 py-2 border border-white/20 text-[10px] uppercase font-bold hover:bg-white hover:text-black transition-all tracking-widest"
              >
                {showAllInterfaces
                  ? "Collapse.Matrix()"
                  : `Expand.Matrix(${filteredInterfaces.length - 10}.More)`}
              </button>
            </div>
          )}
        </section>

        <section className="bg-neutral-900/10 border border-white/5 p-6 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-3">
            <Activity className="w-4 h-4" /> full_ipv4_address_table
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
            {device.ipSnmp?.addrEntries?.map((addr: AddrEntry, i: number) => (
              <div
                key={i}
                className="p-3 border border-white/5 bg-neutral-900/40"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-white">
                    {addr.ipAdEntAddr}
                  </span>
                  <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-tighter">
                    IF: {addr.ipAdEntIfIndex}
                  </span>
                </div>
                <div className="flex justify-between text-[9px] text-neutral-500">
                  <span className="uppercase">Mask: {addr.ipAdEntNetMask}</span>
                  <span className="uppercase">
                    MTU: {addr.ipAdEntReasmMaxSize}
                  </span>
                </div>
              </div>
            ))}
            {(!device.ipSnmp?.addrEntries ||
              device.ipSnmp.addrEntries.length === 0) && (
              <div className="text-center py-8 text-[8px] text-neutral-700 uppercase italic">
                No IP entries found
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
