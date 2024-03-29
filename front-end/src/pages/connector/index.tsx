import React, { useEffect, useState } from "react";
import { Response, Result } from "../../interface/reponse";
import {
  Form,
  Input,
  Button,
  InputNumber,
  Switch,
  notification,
  Flex,
  Tag,
  Divider,
} from "antd";
import axios from "axios";

interface Action {
  deviceMac: string;
  serviceUuid: string | null;
  value: string | null;
  characteristicUuid: string | null;
  actionId: string;
  timeOut: number;
  type: string;
}

interface Receiver {
  apMac: string;
  all: boolean;
}

interface JsonMessage {
  meta: {
    access_token: string;
    version: number;
    sbTopic: string;
  };
  actions: Action[];
  receiver: Receiver;
}

const YourComponent: React.FC = () => {
  const [form] = Form.useForm();
  const [results, setResults] = useState<Result[]>();

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3001/sse");
    eventSource.onopen = () => console.log("SSE connection opened");
    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data) as Response;
      if (message.results) {
        setResults(message.results);
      }
      // setResults([
      //   {
      //     actionId: "00000001",
      //     type: "bleConnect",
      //     deviceMac: "a0e6f8407c08",
      //     status: "failureGeneric",
      //     statusString:
      //       "Invalid state, operation disallowed in this state(07cf00080000)",
      //     apbMac: "28de65791acb",
      //   },
      //   {
      //     actionId: "00000001",
      //     type: "bleConnect",
      //     deviceMac: "a0e6f8407c08",
      //     status: "failureGeneric",
      //     statusString:
      //       "Invalid state, operation disallowed in this state(07cf00080000)",
      //     apbMac: "28de65791acb",
      //   },
      //   {
      //     actionId: "00000001",
      //     type: "bleConnect",
      //     deviceMac: "a0e6f8407c08",
      //     status: "failureGeneric",
      //     statusString:
      //       "Invalid state, operation disallowed in this state(07cf00080000)",
      //     apbMac: "28de65791acb",
      //   },
      // ]);
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

  function encodeHexStringToBase64(hex: string): string {
    const bytes = hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16));
    if (bytes) {
      return btoa(String.fromCharCode.apply(null, bytes));
    } else {
      throw new Error("Invalid hexadecimal string");
    }
  }

  const onFinish = async (values: JsonMessage) => {
    console.log("Form submitted:", values);

    try {
      values.receiver.apMac = encodeHexStringToBase64(values.receiver.apMac);
      values.actions.forEach((action) => {
        action.deviceMac = encodeHexStringToBase64(action.deviceMac);
      });

      await axios.post("http://127.0.0.1:3001/sb_api", values, {
        validateStatus: () => true,
      });

      notification.success({
        message: "Form Submitted",
        description: "The form has been successfully submitted.",
      });
    } catch (error) {
      notification.error({
        message: "Form Submitting Error",
        description: "The form has been failed submitted.",
      });
      console.error("Error submitting data:", error);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1, padding: "20px" }}>
        <h2 style={{ marginBottom: "1rem" }}>Actions Results</h2>
        <Divider />
        {results?.map((result, index) => (
          <div
            key={index}
            style={{
              background: index % 2 === 0 ? "#e6f7ff" : "#f6ffed",
              padding: "8px",
              margin: "1rem",
            }}
          >
            <p>
              <strong>Action ID: </strong> {result.actionId}
            </p>
            <p>
              <strong>Type: </strong> {result.type}
            </p>
            <p>
              <strong>Device MAC: </strong> {result.deviceMac}
            </p>
            <p>
              <strong>Status: </strong>
              <Tag color={result.status === "success" ? "green" : "red"}>
                {result.status.toUpperCase()}
              </Tag>
            </p>
            <p>
              <strong>Status String: </strong> {result.statusString}
            </p>
            <p>
              <strong>APB MAC: </strong> {result.apbMac}
            </p>
          </div>
        ))}
      </div>
      {/* Right Section - Form */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h2 style={{ marginBottom: "1rem" }}>Actions</h2>
        <Divider />
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          style={{ maxWidth: "400px" }}
        >
          <Form.Item
            label="Access Token"
            name={["meta", "access_token"]}
            rules={[{ required: true, message: "Please input Access Token!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Version"
            name={["meta", "version"]}
            rules={[{ required: true, message: "Please input Version!" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="SB Topic"
            name={["meta", "sbTopic"]}
            rules={[{ required: true, message: "Please input SB Topic!" }]}
          >
            <Input />
          </Form.Item>
          {/* Actions */}
          <Form.List name="actions">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <div
                    key={field.key}
                    style={{
                      border: "1px solid #e8e8e8",
                      padding: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <h3>Action {index + 1}</h3>
                    <Form.Item
                      label="Device MAC"
                      name={[field.name, "deviceMac"]}
                      rules={[
                        { required: true, message: "Please input Device MAC!" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="Action ID"
                      name={[field.name, "actionId"]}
                      rules={[
                        { required: true, message: "Please input Action ID!" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="Timeout"
                      name={[field.name, "timeOut"]}
                      rules={[
                        { required: true, message: "Please input Timeout!" },
                      ]}
                    >
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                      label="Type"
                      name={[field.name, "type"]}
                      rules={[
                        { required: true, message: "Please input Type!" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="serviceUuid"
                      name={[field.name, "serviceUuid"]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item label="value" name={[field.name, "value"]}>
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="characteristicUuid"
                      name={[field.name, "characteristicUuid"]}
                    >
                      <Input />
                    </Form.Item>
                    <Button
                      danger
                      onClick={() => remove(field.name)}
                      style={{ marginRight: "8px" }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Add Action
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          {/* Receiver */}
          <Form.Item
            label="AP MAC"
            name={["receiver", "apMac"]}
            rules={[{ required: true, message: "Please input AP MAC!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Form.Item
              name={["receiver", "all"]}
              label="Receiver is receiving all"
              valuePropName="checked"
              style={{ display: "inline-block", marginBottom: 0 }}
            >
              <Switch />
            </Form.Item>
          </Form.Item>
          <Form.Item>
            <Flex justify="end">
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default YourComponent;
