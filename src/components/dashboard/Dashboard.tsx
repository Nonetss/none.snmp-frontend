import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  Server,
  Share2,
  Database,
  Hash,
  Zap,
  AlertCircle,
  BarChart3,
  Globe,
  RefreshCcw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchStats = async () => {
    setLoading(true);
    try {
      const hostname = window.location.hostname;
      const response = await axios.get(
        `http://${hostname}:3000/api/v1/search/stats`,
      );
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const statsInterval = setInterval(fetchStats, 30000);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(clockInterval);
    };
  }, []);

  if (loading && !stats)
    return (
      <div className="flex items-center justify-center h-full bg-black text-white font-mono">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-8 h-8 animate-spin text-white" />
          <span className="text-[10px] tracking-[0.3em] uppercase">
            Loading.Metrics()
          </span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-white font-mono bg-black">
        <div className="border border-white/20 p-6 flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8 text-white" />
          <p className="text-xs uppercase tracking-widest">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 border border-white text-xs hover:bg-white hover:text-black transition-all"
          >
            RETRY.SYSTEM()
          </button>
        </div>
      </div>
    );

  const snmpData = stats.snmpVersionDistribution || [];
  const subnetData = stats.subnetsDistribution || [];

  const interfaceData = [
    { name: "UP", value: stats.interfaceStatus?.up || 0, color: "#FFFFFF" },
    { name: "DOWN", value: stats.interfaceStatus?.down || 0, color: "#333333" },
    {
      name: "OTHER",
      value: stats.interfaceStatus?.other || 0,
      color: "#111111",
    },
  ];

  const StatCard = ({ title, value, icon: Icon, subtext }: any) => (
    <div className="bg-neutral-900/40 border border-white/10 p-5 space-y-3 hover:border-white/30 transition-all group">
      <div className="flex justify-between items-start">
        <div className="p-2 bg-white/5 border border-white/10 group-hover:border-white/20">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">
          Live.Feed
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-white tracking-tighter">
          {value}
        </div>
        <div className="text-[9px] text-neutral-500 uppercase font-bold tracking-[0.2em]">
          {title}
        </div>
      </div>
      {subtext && (
        <div className="text-[8px] text-neutral-600 border-t border-white/5 pt-2">
          {subtext}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8 bg-black text-white font-mono min-h-screen space-y-8 w-full">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-white" />
            <h1 className="text-2xl font-bold tracking-tighter uppercase">
              Network.Intelligence.Center
            </h1>
          </div>
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em]">
            Autonomous Monitoring System v2.4.0
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-white mb-1">
            LOCAL_TIME: {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-[8px] text-neutral-600 uppercase tracking-widest">
            System Status: Operational
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Devices"
          value={stats.devices?.totalManaged + stats.devices?.totalExternal}
          icon={Server}
          subtext={`${stats.devices?.totalManaged} Managed / ${stats.devices?.totalExternal} External`}
        />
        <StatCard
          title="Network Edges"
          value={stats.topology?.resolvedLinks}
          icon={Share2}
          subtext={`LLDP: ${stats.topology?.lldpConnections} | CDP: ${stats.topology?.cdpConnections}`}
        />
        <StatCard
          title="IPv4 Space"
          value={stats.network?.totalIps}
          icon={Globe}
          subtext={`${stats.network?.subnets} Active Subnets`}
        />
        <StatCard
          title="24H Activity"
          value={
            stats.activity?.updatedNeighbors24h +
            stats.activity?.arpDiscoveries24h
          }
          icon={Activity}
          subtext={`${stats.activity?.arpDiscoveries24h} ARP New Discoveries`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subnet Distribution */}
        <div className="lg:col-span-2 bg-neutral-900/20 border border-white/10 p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" /> Subnet_Capacity_Map
            </h3>
            <span className="text-[8px] text-neutral-600 tracking-widest">
              X-AXIS: SUBNET_CIDR / Y-AXIS: DEVICE_COUNT
            </span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subnetData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1f1f1f"
                  vertical={false}
                />
                <XAxis
                  dataKey="cidr"
                  stroke="#555"
                  fontSize={8}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#555" }}
                />
                <YAxis
                  stroke="#555"
                  fontSize={8}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#555" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid #333",
                    fontSize: "10px",
                  }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar
                  dataKey="deviceCount"
                  fill="#ffffff"
                  radius={[2, 2, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interface Health */}
        <div className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> Interface_Health
            </h3>
          </div>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={interfaceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {interfaceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid #333",
                    fontSize: "10px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold tracking-tighter">
                {stats.interfaceStatus?.up}
              </span>
              <span className="text-[8px] text-neutral-500 uppercase">
                Active.Ports
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 pt-2">
            {interfaceData.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-center text-[9px] border-b border-white/5 pb-1"
              >
                <span className="text-neutral-500 flex items-center gap-2 uppercase tracking-widest">
                  <div
                    className="w-1.5 h-1.5"
                    style={{ backgroundColor: item.color }}
                  />{" "}
                  {item.name}
                </span>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Hubs */}
        <div className="bg-neutral-900/10 border border-white/10 p-6 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 border-b border-white/10 pb-3">
            <Share2 className="w-3.5 h-3.5" /> Core_Nodes_Density
          </h3>
          <div className="space-y-2">
            {stats.topHubs?.map((hub: any, i: number) => (
              <div
                key={hub.name}
                className="group flex items-center justify-between p-3 bg-white/5 border border-transparent hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-neutral-600 text-[9px] font-bold">
                    0{i + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white group-hover:tracking-wider transition-all uppercase">
                      {hub.name}
                    </span>
                    <span className="text-[8px] text-neutral-600 uppercase">
                      Network backbone node
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold">{hub.connections}</div>
                  <div className="text-[8px] text-neutral-600 uppercase">
                    Edges
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SNMP Distribution */}
        <div className="bg-neutral-900/10 border border-white/10 p-6 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 border-b border-white/10 pb-3">
            <Database className="w-3.5 h-3.5" /> Protocol_Distribution
          </h3>
          <div className="space-y-4 pt-2">
            {snmpData.map((item: any) => (
              <div key={item.version} className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] uppercase tracking-widest">
                  <span className="text-neutral-500">
                    SNMP.Version_{item.version}
                  </span>
                  <span className="text-white font-bold">
                    {item.deviceCount} Units
                  </span>
                </div>
                <div className="w-full h-1 bg-neutral-900">
                  <div
                    className="h-full bg-white transition-all duration-1000"
                    style={{
                      width: `${(item.deviceCount / stats.devices?.totalManaged) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer System Log */}
      <div className="border border-white/10 p-4 flex justify-between items-center bg-white/[0.02]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[8px] text-neutral-500 uppercase tracking-[0.2em]">
            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />{" "}
            Data.Ingestion: Active
          </div>
          <div className="flex items-center gap-2 text-[8px] text-neutral-500 uppercase tracking-[0.2em]">
            <span className="w-1 h-1 rounded-full bg-white" /> Backend_Node:
            Connected
          </div>
        </div>
        <div className="text-[8px] text-neutral-600 uppercase tracking-widest italic font-medium">
          "Monitoring the unseen, one packet at a time."
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
