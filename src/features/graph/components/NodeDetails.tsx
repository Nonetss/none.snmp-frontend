import React from "react";
import { X, Shield, MapPin, User } from "lucide-react";
import type { GraphNode } from "@/features/graph/components/types";

interface NodeDetailsProps {
  node: GraphNode;
  onClose: () => void;
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({ node, onClose }) => {
  return (
    <div className="fixed top-0 right-0 h-full w-[400px] z-[100] bg-black border-l border-white/20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col font-mono text-white animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-neutral-900/20">
        <div className="flex justify-between items-start mb-4">
          <span className="px-2 py-0.5 border border-white/20 text-neutral-400 text-[9px] font-bold uppercase tracking-[0.2em]">
            {node.type || "device"}
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <h3 className="text-xl font-bold text-white leading-tight mb-2 break-all">
          {node.label}
        </h3>
        {node.ip && (
          <p className="text-[10px] text-neutral-500 tracking-[0.3em] uppercase font-bold">
            {node.ip}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {node.details?.system && (
          <div className="space-y-3">
            <h4 className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <div className="w-1 h-3 bg-white/40" /> system_info
            </h4>
            <div className="space-y-3 bg-neutral-900/40 p-4 border border-white/5">
              <p className="text-xs text-neutral-400 italic leading-relaxed">
                "{node.details.system.sysDescr}"
              </p>
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 text-neutral-500 text-[10px]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="uppercase">
                    {node.details.system.sysLocation || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-neutral-500 text-[10px]">
                  <User className="w-3.5 h-3.5" />
                  <span className="uppercase">
                    {node.details.system.sysContact || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {node.details?.interfaces && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-1">
              <h4 className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <div className="w-1 h-3 bg-white/40" /> interface_list
              </h4>
              <span className="text-[9px] text-neutral-700 font-bold">
                {node.details.interfaces.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {node.details.interfaces.map((iface, i) => (
                <div
                  key={i}
                  className="px-3 py-2 bg-neutral-900/20 border border-white/5 text-[11px] text-neutral-400 hover:text-white hover:bg-neutral-900/40 transition-colors"
                >
                  {iface.ifName || iface.ifDescr}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Status */}
      <div className="p-4 border-t border-white/5 bg-neutral-900/10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[8px] text-neutral-600 uppercase tracking-widest">
            Selected.Node_Isolated
          </span>
        </div>
      </div>
    </div>
  );
};
