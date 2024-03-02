import React from "react";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import ApplicationRoute from "./application.route";

const { Header, Content, Footer } = Layout;

const menuItems = [
  {
    key: "1",
    label: "Home",
  },
  {
    key: "2",
    label: "Websocket Info",
  },
];

const App: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
          defaultSelectedKeys={["1"]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: "0 48px" }}>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>Websocket Info</Breadcrumb.Item>
        </Breadcrumb>
        <div
          style={{
            padding: 24,
            minHeight: 380,
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
