import React, { useState, useMemo } from "react";
import { List, Shield, Database, Search, X } from "lucide-react";
import type {
  DeviceDetail,
  Service,
} from "@/features/devices/components/types";

interface ServicesTabProps {
  device: DeviceDetail;
}

type ServiceStatusFilter = "all" | "running" | "other";

export const ServicesTab: React.FC<ServicesTabProps> = ({ device }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceStatusFilter>("all");

  const filteredServices = useMemo(() => {
    if (!device.services) return [];
    return device.services.filter((svc) => {
      const matchesSearch =
        svc.hrSWRunName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        svc.hrSWRunPath.toLowerCase().includes(searchTerm.toLowerCase());

      if (statusFilter === "all") return matchesSearch;
      const isRunning = svc.hrSWRunStatus === 1;
      const matchesStatus = statusFilter === "running" ? isRunning : !isRunning;

      return matchesSearch && matchesStatus;
    });
  }, [device.services, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = device.services?.length || 0;
    const running =
      device.services?.filter((s) => s.hrSWRunStatus === 1).length || 0;
    return { total, running, other: total - running };
  }, [device.services]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
              <List className="w-4 h-4" /> running_services_table
            </h3>
            <span className="text-[9px] text-neutral-600 font-bold uppercase bg-white/5 px-2 py-0.5 border border-white/5">
              Filtered: {filteredServices.length} / Total: {stats.total}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
            {/* Search Input */}
            <div className="relative group flex-grow sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="SEARCH_SERVICES..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 py-2 pl-9 pr-8 text-[10px] uppercase font-bold tracking-widest focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-white text-neutral-500"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-white/5 p-1 border border-white/10">
              {(["all", "running", "other"] as ServiceStatusFilter[]).map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-3 py-1.5 text-[8px] uppercase font-bold transition-all whitespace-nowrap ${
                      statusFilter === f
                        ? "bg-white text-black"
                        : "text-neutral-500 hover:text-white"
                    }`}
                  >
                    {f} (
                    {f === "all"
                      ? stats.total
                      : f === "running"
                        ? stats.running
                        : stats.other}
                    )
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredServices.map((svc: Service, i: number) => (
            <div
              key={i}
              className="p-4 bg-white/5 border border-white/5 hover:border-white/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-2 border transition-all ${svc.hrSWRunStatus === 1 ? "bg-white/5 border-white/10 group-hover:bg-white group-hover:text-black" : "bg-neutral-900 border-white/5 text-neutral-700"}`}
                >
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <span
                    className={`text-[8px] px-1.5 py-0.5 font-bold uppercase ${svc.hrSWRunStatus === 1 ? "bg-white/10 text-neutral-300" : "bg-neutral-900 text-neutral-600 border border-white/5"}`}
                  >
                    {svc.hrSWRunStatus === 1 ? "Running" : "Other"}
                  </span>
                </div>
              </div>
              <h4
                className="text-xs font-bold text-white uppercase mb-1 truncate"
                title={svc.hrSWRunName}
              >
                {svc.hrSWRunName || "Unnamed Service"}
              </h4>
              <p
                className="text-[9px] text-neutral-500 line-clamp-2 italic mb-4 h-6"
                title={svc.hrSWRunPath}
              >
                {svc.hrSWRunPath || "No path specified."}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[7px] text-neutral-600 uppercase font-bold">
                    Parameters
                  </span>
                  <span
                    className="text-[9px] text-neutral-400 truncate"
                    title={svc.hrSWRunParameters}
                  >
                    {svc.hrSWRunParameters || "None"}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[7px] text-neutral-600 uppercase font-bold">
                    Index
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {svc.hrSWRunIndex}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filteredServices.length === 0 && (
            <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-white/10 text-neutral-600">
              <Database className="w-8 h-8 mb-4 opacity-20" />
              <span className="text-[10px] uppercase tracking-[0.4em]">
                No.Matching.Services.Found
              </span>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="mt-4 px-4 py-2 border border-white/10 text-[8px] hover:bg-white hover:text-black transition-all uppercase font-bold"
              >
                Clear.Filters()
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
