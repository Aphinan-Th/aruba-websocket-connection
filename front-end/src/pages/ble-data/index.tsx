import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  type TableProps,
  notification,
  Divider,
  Col,
  Row,
} from "antd";
import { Reporter, Response } from "../../interface/reponse";
import { Typography } from "antd";
const { Paragraph } = Typography;

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
    render: (text) => <Paragraph copyable style={{ padding: "0", margin: "0" }}>{text}</Paragraph>,
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

const BleDataPage: React.FC = () => {
  const [mapData, setMapData] = useState<DataType[]>();
  const [reporter, setReporter] = useState<Reporter>();

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3001/sse");
    eventSource.onopen = () => console.log("SSE connection opened");
    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data) as Response;
      setReporter(message.reporter);
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
      notification.error({
        message: "SSE Error",
        description: "An error occurred while connecting to the SSE server.",
      });
      eventSource.close();
    };

    return () => {
      eventSource.close();
      console.log("SSE connection closed");
    };
  }, []);

  return (
    <>
      <h2 style={{ marginBottom: "1rem" }}>Reporter</h2>
      <Divider />
      <div>
        <Row gutter={[16, 16]}>
          {" "}
          {/* Adjust gutter as needed */}
          <Col>
            <div style={{ background: "#e6f7ff", padding: "8px" }}>
              <p>
                <strong>Name :</strong> {reporter?.name}
              </p>
            </div>
          </Col>
          <Col>
            <div
              style={{ background: "#f6ffed", padding: "8px", display: "flex" }}
            >
              <strong>Mac : </strong>
              <Paragraph copyable style={{ padding: "0", margin: "0" }}>
                {reporter?.mac}
              </Paragraph>
            </div>
          </Col>
        </Row>
      </div>
      <div style={{ padding: "8px 0 0 8px" }}>
        <strong>HwType :</strong> {reporter?.hwType}
      </div>
      <div style={{ paddingLeft: "8px" }}>
        <strong>SwVersion :</strong> {reporter?.swVersion}
      </div>
      <div style={{ paddingLeft: "8px" }}>
        <strong>SwBuild :</strong> {reporter?.swBuild}
      </div>
      <div style={{ paddingLeft: "8px" }}>
        <strong>Time :</strong> {reporter?.time}
      </div>
      <div style={{ paddingLeft: "8px" }}>
        <strong>IP v4 :</strong> {reporter?.ipv4}
      </div>
      <Divider />
      <Table
        columns={columns}
        dataSource={mapData}
        style={{ marginTop: "1rem" }}
      />
    </>
  );
};

export default BleDataPage;
