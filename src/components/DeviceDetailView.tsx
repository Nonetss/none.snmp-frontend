import React, { useEffect, useState } from "react";
import axios from "axios";
import { RefreshCcw, AlertCircle } from "lucide-react";

import { Header } from "./device-detail/Header";
import { TabsNav } from "./device-detail/TabsNav";
import { DashboardTab } from "./device-detail/DashboardTab";
import { InterfacesTab } from "./device-detail/InterfacesTab";
import { NetworkTab } from "./device-detail/NetworkTab";
import { DiscoveryTab } from "./device-detail/DiscoveryTab";
import { InventoryTab } from "./device-detail/InventoryTab";
import { BridgeTab } from "./device-detail/BridgeTab";
import { ServicesTab } from "./device-detail/ServicesTab";
import { ApplicationsTab } from "./device-detail/ApplicationsTab";
import type { DeviceDetail, TabId } from "./device-detail/types";

interface Props {
  deviceId: string;
}

const DeviceDetailView: React.FC<Props> = ({ deviceId }) => {
  const [device, setDevice] = useState<DeviceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const fetchDevice = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.PUBLIC_BACKEND_URL}/api/v1/search/device?id=${deviceId}`,
      );
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
      await axios.post(
        `${import.meta.env.PUBLIC_BACKEND_URL}/api/v1/snmp/device/poll/${deviceId}/all`,
      );
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-full bg-black text-white font-mono">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-8 h-8 animate-spin text-white" />
          <span className="text-[10px] tracking-[0.3em] uppercase">
            Deep.Scanning(ID:{deviceId})
          </span>
        </div>
      </div>
    );

  if (error || !device)
    return (
      <div className="p-8 text-white font-mono bg-black h-full flex items-center justify-center">
        <div className="border border-white/20 p-8 flex flex-col items-center gap-4 max-w-md">
          <AlertCircle className="w-10 h-10 text-white" />
          <p className="text-xs uppercase tracking-widest text-center">
            {error || "CRITICAL_ERROR: NODE_NOT_FOUND"}
          </p>
          <a
            href="/devices"
            className="mt-4 px-6 py-2 border border-white text-xs hover:bg-white hover:text-black transition-all uppercase"
          >
            Back.To.Inventory()
          </a>
        </div>
      </div>
    );

  const hasNeighbors =
    device.neighbor_discovery?.outbound?.length > 0 ||
    device.neighbor_discovery?.inbound?.length > 0;

  return (
    <div className="bg-black text-white font-mono min-h-screen w-full flex flex-col">
      <Header
        device={device}
        polling={polling}
        onFullPoll={handleFullPoll}
        onRescan={() => fetchDevice()}
      />

      <TabsNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="p-8 space-y-8 max-w-[1800px] mx-auto w-full flex-grow">
        {activeTab === "dashboard" && (
          <DashboardTab
            device={device}
            setActiveTab={setActiveTab}
            hasNeighbors={hasNeighbors}
          />
        )}
        {activeTab === "interfaces" && <InterfacesTab device={device} />}
        {activeTab === "network" && <NetworkTab device={device} />}
        {activeTab === "bridge" && <BridgeTab device={device} />}
        {activeTab === "discovery" && <DiscoveryTab device={device} />}
        {activeTab === "inventory" && <InventoryTab device={device} />}
        {activeTab === "services" && <ServicesTab device={device} />}
        {activeTab === "applications" && <ApplicationsTab device={device} />}
      </div>
    </div>
  );
};

export default DeviceDetailView;
