#!/usr/bin/env python3

############################################################################
# (C) Copyright [2018-2021] Hewlett Packard Enterprise Development LP
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.
############################################################################

import os
import sys
import json
import requests
import base64
import codecs


###################################################
# Reads the JSON for the BLE SB message
# Converts the fields that have datatype "bytes"
# (such as the AP MAC, ServiceUUID, CharUUID, Value)
# to a base64 encoding
###################################################
def send_sb_ble_msg(json_file):
    print("\nsend " + json_file + " \n")

    if (os.path.isfile(json_file)):
        print("File exists")
    else:
        print("File:"+ json_file +" does not exist.... return")
        return

    json_msg = json.load(open(json_file, 'r'))
    print(json_msg)

    # Format Receiver MAC (AP ETH MAC)
    json_msg["receiver"]["apMac"] = json_msg["receiver"]["apMac"].replace(':', '')
    json_msg["receiver"]["apMac"] = json_msg["receiver"]["apMac"].lower()
    json_msg["receiver"]["apMac"] = base64.b64encode(codecs.decode(json_msg["receiver"]["apMac"], "hex")).decode('ascii')
    
    for item in json_msg["actions"]:
        
        # Format Device MAC
        item["deviceMac"] = item["deviceMac"].replace(':', '')
        item["deviceMac"] = item["deviceMac"].lower()
        item["deviceMac"] = base64.b64encode(codecs.decode(item["deviceMac"], 'hex')).decode('ascii')
        
        # Format SVC UUID
        if (item["serviceUuid"]):
            item["serviceUuid"] = item["serviceUuid"].replace('-', '')
            item["serviceUuid"] = item["serviceUuid"].upper()
            item["serviceUuid"] = base64.b64encode(codecs.decode(item["serviceUuid"], 'hex')).decode('ascii')
        
        # Format CHAR UUID
        if (item["characteristicUuid"]):
            item["characteristicUuid"] = item["characteristicUuid"].replace('-', '')
            item["characteristicUuid"] = item["characteristicUuid"].upper()
            item["characteristicUuid"] = base64.b64encode(codecs.decode(item["characteristicUuid"], 'hex')).decode('ascii')
        
        # Format Value
        if (item["value"]):
            item["value"] = item["value"].replace('-', '')
            item["value"] = item["value"].upper()
            item["value"] = base64.b64encode(codecs.decode(item["value"], 'hex')).decode('ascii')

    r = requests.post('http://127.0.0.1:3001/sb_api', json=json_msg, verify=False)
    print("Status Code: "+str(r.status_code))

    return



###################################################
# Reads the JSON for the SerialData SB message
# Converts the fields that have datatype "bytes"
# (such as the AP MAC and the SB serial payload)
# to a base64 encoding
###################################################
def send_sb_serialdata_msg(json_file):
    print("\nsend " + json_file + " \n")

    if (os.path.isfile(json_file)):
        print("File exists")
    else:
        print("File:"+ json_file +" does not exist.... return")
        return

    json_msg = json.load(open(json_file, 'r'))

    for sbsdata in json_msg['sbSData']:
        sbsdata['sbSerialPayload'] = base64.b64encode(codecs.decode(sbsdata['sbSerialPayload'], 'hex')).decode('ascii')

    apmac = json_msg["receiver"]["apMac"]
    json_msg["receiver"]["apMac"] = base64.b64encode(codecs.decode(apmac, "hex")).decode('ascii')

    print(json_msg)
    r = requests.post('http://127.0.0.1:3001/sb_api', json=json_msg, verify=False)
    print("Status Code: "+str(r.status_code))

    return

def req_ap_topo():
    response = requests.request("POST", 'http://127.0.0.1:3001/ap_topo')
    print(response.text)

def req_ap_info():
    response = requests.request("POST", 'http://127.0.0.1:3001/ap_info')
    print(response.text)

def read_custom_json_file():
    user_file = input("Enter filename: ")
    if (os.path.isfile(user_file)): 
        return user_file
    else:
        print("File does not exist")
        return None 

def menu_options():
    print("\n===============================\nChoose one of the following SouthBound options:")
    print(" 1. Exit")
    print("-----------")
    print(" 2. Send SerialData CO_RD Enocean message")
    print(" 3. Send custom SerialData JSON via file")
    print("-----------")
    print(" 4. Send BLE Action sb_action_set_1.json")
    print(" 5. Send BLE Action connect.json")
    print(" 6. Send BLE Action disconnect.json")
    print(" 7. Send custom BLE JSON via file")
    print("===============================")
    print(" 8. Request connected AP topology from websocket server")
    print(" 9. Request connected AP information from websocket server")
    print("===============================")

def main():
    for index in range(1,len(sys.argv)):
        if ('help' == str.lower(sys.argv[index])):
            help()
            exit(0)
        else:
            print("Unrecognized argument \"" + sys.argv[index] + "\". Use 'help' for list of accepted arguments.")
            exit(1)

    while 1:
        menu_options()
        user_input = input("Choose option: ")
        if ('1' == str.lower(user_input)):
            print("\nExiting ....\n")
            exit(0)
        elif ('2' == str.lower(user_input)):
            send_sb_serialdata_msg('action/co_rd_enocean.json')
        elif ('3' == str.lower(user_input)):
            rv = read_custom_json_file()
            if rv is not None:
                send_sb_serialdata_msg(rv)
        elif ('4' == str.lower(user_input)):
            send_sb_ble_msg('action/sb_action_set_1.json')
        elif ('5' == str.lower(user_input)):
            send_sb_ble_msg('action/connect.json')
        elif ('6' == str.lower(user_input)):
            send_sb_ble_msg('action/disconnect.json')
        elif ('7' == str.lower(user_input)):
            rv = read_custom_json_file()
            if rv is not None:
                send_sb_ble_msg(rv)
        elif ('8' == str.lower(user_input)):
            req_ap_topo()
        elif ('9' == str.lower(user_input)):
            req_ap_info()
        else:
            print("\nInvalid Option "+str.lower(user_input)+". Exiting ....\n")
            exit(0)


if __name__ == "__main__":
    main()
