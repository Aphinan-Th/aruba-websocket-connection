import React from "react";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import ApplicationRoute from "./application.route";

const { Header, Content, Footer } = Layout;

const menuItems = [
  {
    key: "/telemetry-websocket",
    label: "Telemetry",
  },
  {
    key: "/ble-data",
    label: "Ble Data",
  },
  {
    key: "/connector",
    label: "Connector",
  },
];

const App: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = window.location.pathname;
  const breadcrumbName = location.split("/").filter((i) => i);
  return (
    <Layout>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={[location]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
          onSelect={({ key }) => {
            window.location.href = key;
          }}
        />
      </Header>
      <Content style={{ padding: "0 48px" }}>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>{breadcrumbName}</Breadcrumb.Item>
        </Breadcrumb>
        <div
          style={{
            padding: 24,
            minHeight: "100vh",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <ApplicationRoute />
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Cloud App ©{new Date().getFullYear()} Created by KKU students
      </Footer>
    </Layout>
  );
};

export default App;
