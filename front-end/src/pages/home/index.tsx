import React, { useEffect, useState } from "react";
import { Result } from "./type";
import { Table, type TableProps } from "antd";

interface DataType {
  key: string;
  mac: string;
  lastSeen?: number;
  beventEvent?: string;
  statsFrameCnt?: string[];
  deviceClass?: string[];
  companyIdentifier?: string[];
}

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Mac Address",
    dataIndex: "mac",
    key: "mac",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Last Seen",
    dataIndex: "lastSeen",
    key: "lastSeen",
  },
  {
    title: "Bevent Event",
    dataIndex: "beventEvent",
    key: "beventEvent",
  },
  {
    title: "Stats Frame Cnt",
    key: "statsFrameCnt",
    dataIndex: "statsFrameCnt",
  },
  {
    title: "Device Class",
    key: "deviceClass",
    dataIndex: "deviceClass",
  },
  {
    title: "Company Identifier",
    key: "companyIdentifier",
    dataIndex: "companyIdentifier",
  },
];

const Home: React.FC = () => {
  // const [messages, setMessages] = useState<DataType>();
  const [mapData, setMapData] = useState<DataType[]>();

  useEffect(() => {
    const eventSource = new EventSource("https://153f-2001-44c8-44e7-5b06-7002-ffd1-89b-c7d2.ngrok-free.app/sse");

    eventSource.onopen = () => console.log("SSE connection opened");

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data) as Result;
      const mapData =
        message?.reported &&
        message?.reported?.map((item) => {
          return {
            key: item.mac,
            mac: item.mac,
            lastSeen: Date.now(),
            beventEvent: item.bevent.event,
            statsFrameCnt: [item.stats.frame_cnt.toString()],
            deviceClass: [item.deviceClass.toString()],
            companyIdentifier: [item?.companyIdentifier?.map((item) => item.description).toString()],
          } as DataType;
        });

      mapData && setMapData(mapData);
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      console.log("SSE connection closed");
    };
  }, []);

  return <Table columns={columns} dataSource={mapData} />;
};

export default Home;
