import React, { useEffect, useState } from "react";
import { Reporter, Response } from "../../interface/reponse";
import {
  Table,
  Tag,
  type TableProps,
  notification,
  Divider,
  Col,
  Row,
} from "antd";
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

const classToColorMap: { [key: string]: string } = {
  abilitySmartSensor: "green",
  all: "green",
  arubaBeacon: "red",
  arubaSensor: "geekblue",
  arubaTag: "cyan",
  assaAbloy: "magenta",
  blyott: "yellow",
  diract: "orange",
  eddystone: "lime",
  enoceanSensor: "blue",
  enoceanSwitche: "purple",
  exposureNotification: "gold",
  google: "indigo",
  gwahygiene: "teal",
  iBeacon: "pink",
  minew: "brown",
  mysphera: "maroon",
  onity: "navy",
  polestar: "olive",
  sbeacon: "peru",
  serialData: "plum",
  unclassified: "salmon",
  wifiAssocSta: "sienna",
  wifiTag: "steelblue",
  wifiUnassocSta: "tomato",
  wiliot: "violet",
  zfTag: "wheat",
  zsd: "yellowgreen",
};

const columns: TableProps<DataType>["columns"] = [
  {
    title: "Mac Address",
    dataIndex: "mac",
    key: "mac",
    render: (text) => <Paragraph copyable style={{ padding: "0", margin: "0" }}>{text}</Paragraph>,
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
    sorter: {
      compare: (a, b) => {
        const cntA = a.statsFrameCnt ? a.statsFrameCnt[0] : undefined;
        const cntB = b.statsFrameCnt ? b.statsFrameCnt[0] : undefined;

        if (cntA === undefined && cntB === undefined) {
          return 0;
        } else if (cntA === undefined) {
          return -1;
        } else if (cntB === undefined) {
          return 1;
        }
        return parseInt(cntA) - parseInt(cntB);
      },
    },
  },
  {
    title: "Device Class",
    key: "deviceClass",
    dataIndex: "deviceClass",
    render: (_, { deviceClass }) => (
      <>
        {deviceClass?.map((item) => {
          const color = classToColorMap[item] || "green";
          return (
            <Tag color={color} key={item}>
              {item.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: "Company Identifier",
    key: "companyIdentifier",
    dataIndex: "companyIdentifier",
    sorter: {
      compare: (a, b) => {
        const companyA = a.companyIdentifier
          ? a.companyIdentifier[0]
          : undefined;
        const companyB = b.companyIdentifier
          ? b.companyIdentifier[0]
          : undefined;

        if (companyA === undefined && companyB === undefined) {
          return 0;
        } else if (companyA === undefined) {
          return -1;
        } else if (companyB === undefined) {
          return 1;
        }
        return companyA.localeCompare(companyB);
      },
    },
  },
];

const TelemetryWebsocketPage: React.FC = () => {
  const [mapData, setMapData] = useState<DataType[]>();
  const [reporter, setReporter] = useState<Reporter>();

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3001/sse");
    eventSource.onopen = () => console.log("SSE connection opened");
    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data) as Response;
      setReporter(message.reporter);
      const mapData =
        message?.reported &&
        message?.reported?.map((item) => {
          return {
            key: item.mac,
            mac: item.mac,
            lastSeen: new Date(Date.now()).toLocaleString("en-US", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            beventEvent: item.bevent.event,
            statsFrameCnt: [item.stats.frame_cnt.toString()],
            deviceClass: [item.deviceClass.toString()],
            companyIdentifier: [
              item?.companyIdentifier
                ?.map((item) => item.description)
                .toString(),
            ],
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

export default TelemetryWebsocketPage;
