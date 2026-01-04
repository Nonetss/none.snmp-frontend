import React from "react";
import { RefreshCcw, Box } from "lucide-react";
import type { DeviceDetail } from "./types";

interface NetworkTabProps {
  device: DeviceDetail;
}

export const NetworkTab: React.FC<NetworkTabProps> = ({ device }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <section className="xl:col-span-2 bg-neutral-900/20 border border-white/10 p-6 space-y-6">
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
          {(!device.routes || device.routes.length === 0) && (
            <div className="text-center py-8 text-[8px] text-neutral-700 uppercase italic">Routing table is empty</div>
          )}
        </div>
      </section>

      <section className="bg-neutral-900/10 border border-white/5 p-6 space-y-4">
         <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 border-b border-white/10 pb-3">
          <Box className="w-4 h-4" /> bridge_architecture
        </h3>
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 border border-white/5">
              <span className="text-[7px] text-neutral-600 uppercase font-bold block mb-1">Bridge Address</span>
              <span className="text-xs font-mono text-white">{device.bridge?.base?.bridgeAddress || "NULL"}</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/5">
              <span className="text-[7px] text-neutral-600 uppercase font-bold block mb-1">Active Ports</span>
              <span className="text-xs font-mono text-white">{device.bridge?.base?.numPorts || 0}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2">
              <span className="text-neutral-500 uppercase">Device Type</span>
              <span className="font-mono text-white">CLASS_{device.bridge?.base?.type || 0}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2">
              <span className="text-neutral-500 uppercase">FDB Entries</span>
              <span className="font-mono text-white">{device.bridge?.fdb?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2">
              <span className="text-neutral-500 uppercase">VLANs Configured</span>
              <span className="font-mono text-white">{device.bridge?.vlans?.length || 0}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
);
