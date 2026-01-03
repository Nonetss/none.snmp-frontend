import React from "react";
import { X, Shield, MapPin, User } from "lucide-react";
import type { GraphNode } from "./types";

interface NodeDetailsProps {
  node: GraphNode;
  onClose: () => void;
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({ node, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 font-mono">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-black border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.05)] flex flex-col text-white overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-white/20 bg-neutral-900/30">
          <div className="flex justify-between items-start mb-6">
            <span className="px-3 py-1 border border-white/40 text-white text-[10px] font-bold uppercase tracking-[0.3em]">
              {node.type}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h3 className="text-3xl font-bold text-white leading-tight mb-2 truncate tracking-tighter">
            {node.label}
          </h3>
          {node.ip && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <p className="text-xs text-neutral-400 tracking-[0.4em] uppercase font-bold">
                {node.ip}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-neutral-950/50">
          {node.details?.system && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.4em] flex items-center gap-3">
                <div className="w-1.5 h-4 bg-white" /> system_information
              </h4>
              <div className="bg-neutral-900/50 p-6 border border-white/10 space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                  <Shield className="w-20 h-20 text-white" />
                </div>
                <p className="text-[13px] text-neutral-300 leading-relaxed font-medium italic relative z-10">
                  "{node.details.system.sysDescr}"
                </p>
                <div className="flex flex-wrap gap-6 items-center pt-2 relative z-10">
                  <div className="flex items-center gap-3 text-neutral-500 text-xs">
                    <MapPin className="w-4 h-4" />
                    <span className="uppercase tracking-widest border-b border-white/10">
                      {node.details.system.sysLocation || "NOT_DEFINED"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-500 text-xs">
                    <User className="w-4 h-4" />
                    <span className="uppercase tracking-widest border-b border-white/10">
                      {node.details.system.sysContact || "UNKNOWN_ADMIN"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {node.details?.interfaces && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.4em] flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-white" /> interface_matrix
                </h4>
                <span className="text-[10px] text-neutral-600 tracking-widest font-bold">
                  COUNT: {node.details.interfaces.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {node.details.interfaces.map((iface, i) => (
                  <div
                    key={i}
                    className="p-4 border border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/30 transition-all group flex items-start justify-between"
                  >
                    <div className="flex flex-col gap-1 pr-4 min-w-0">
                      <span className="text-xs font-bold text-white">
                        {iface.ifName}
                      </span>
                      <span className="text-[9px] text-neutral-500 truncate uppercase tracking-tighter">
                        {iface.ifDescr}
                      </span>
                      {iface.ifSpeed && (
                        <span className="text-[8px] text-neutral-600 mt-1 font-bold">
                          SPEED: {(iface.ifSpeed / 1000000).toFixed(1)} Mbps
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div
                        className={`px-1.5 py-0.5 text-[8px] font-bold border ${
                          iface.ifAdminStatus === 1
                            ? "bg-white/10 border-white/30 text-white"
                            : "bg-neutral-800 border-neutral-700 text-neutral-500"
                        }`}
                      >
                        {iface.ifAdminStatus === 1 ? "ACTIVE" : "DOWN"}
                      </div>
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          iface.ifAdminStatus === 1
                            ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                            : "bg-neutral-800"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
