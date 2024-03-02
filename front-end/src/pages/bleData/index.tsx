import React, { useEffect, useState } from "react";
// import "../../index.css"; // Import CSS file for styling
import { Result } from "./type";
import { Table, Tag, type TableProps } from "antd";

interface DataType {
  key: string;
  mac: string;
  lastSeen?: string;
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
    title: "Frame Type",
    dataIndex: "frameType",
    key: "frameType",
  },
  {
    title: "data",
    dataIndex: "data",
    key: "data",
  },
  {
    title: "rssi",
    dataIndex: "rssi",
    key: "rssi",
    render: (rssi: number) => {
      let color = "black";

      if (rssi <= -90) {
        color = "red";
      } else if (rssi <= -70) {
        color = "orange";
      } else {
        color = "green";
      }

      return (
        <Tag color={color} key={rssi}>
          {rssi}
        </Tag>
      );
    },
  },
  {
    title: "addrType",
    dataIndex: "addrType",
    key: "addrType",
    render: (addrType: string) => {
      let color = "black";

      if (addrType === "addr_type_public") {
        color = "green";
      } else if (addrType === "addr_type_random") {
        color = "yellow";
      }

      return (
        <Tag color={color} key={addrType}>
          {addrType}
        </Tag>
      );
    },
  },
  {
    title: "apbMac",
    dataIndex: "apbMac",
    key: "apbMac",
  },
];

const BleData: React.FC = () => {
  const [mapData, setMapData] = useState<DataType[]>();

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3001/sse");

    eventSource.onopen = () => console.log("SSE connection opened");

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data) as Result;
      const mapData =
        message?.bleData &&
        message?.bleData?.map((item) => {
          return {
            key: item.mac,
            mac: item.mac,
            frameType: item.frameType,
            data: item.data,
            rssi: item.rssi,
            addrType: item.addrType,
            apbMac: item.apbMac,
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

export default BleData;
