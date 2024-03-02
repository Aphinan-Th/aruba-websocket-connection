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

const Home: React.FC = () => {
  // const [messages, setMessages] = useState<DataType>();
  const [mapData, setMapData] = useState<DataType[]>();

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3001/sse");

    eventSource.onopen = () => console.log("SSE connection opened");

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data) as Result;
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
