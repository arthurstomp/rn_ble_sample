/**
 * Sample BLE React Native App
 */

import React, {useCallback, useState} from 'react';
import {Text, SafeAreaView, StyleSheet, Pressable} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import BleManager, {Peripheral} from 'react-native-ble-manager';
import {RootStackParamList} from './App';
import {Buffer} from '@craftzdog/react-native-buffer';

type Props = NativeStackScreenProps<RootStackParamList, 'Device'>;

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function connect(
  peripheral: Peripheral,
  setConnected: (conn: boolean) => void,
) {
  try {
    if (peripheral) {
      console.log('connecting...');
      await BleManager.connect(peripheral.id);

      // before retrieving services, it is often a good idea to let bonding & connection finish properly
      await sleep(2000);
      setConnected(true);
      console.log('connected');
      const peripheralData = await BleManager.retrieveServices(peripheral.id);
      // console.debug(
      //   `[connectPeripheral][${peripheral.id}] retrieved peripheral services`,
      //   peripheralData,
      // );
      console.log('Got data', peripheralData);

      const rssi = await BleManager.readRSSI(peripheral.id);
      // console.debug(
      // `[connectPeripheral][${peripheral.id}] retrieved current RSSI value: ${rssi}.`,
      // );
      console.log('device rssi', rssi);
    }
  } catch (error) {
    console.log(error);
    console.error(
      `[connectPeripheral][${peripheral.id}] connectPeripheral error`,
      error,
    );
  }
}

async function read(
  peripheral: Peripheral,
  setText: (newText: string) => void,
) {
  let targetService, targetChar;
  const peripheralData = await BleManager.retrieveServices(peripheral.id);

  if (peripheralData.services) {
    const targetIndex = peripheralData.services?.length - 1;
    targetService = peripheralData.services[targetIndex];
    console.log(targetService);
  }

  if (peripheralData.characteristics) {
    const targetIndex = peripheralData.characteristics?.length - 1;
    targetChar = peripheralData.characteristics[targetIndex];
    console.log(targetChar);
  }

  if (targetService && targetChar) {
    let bytes = await BleManager.read(
      peripheral.id,
      targetService.uuid,
      targetChar.characteristic,
    );

    let buffer = Buffer.from(bytes);

    console.log('BYTES', buffer);
    console.log('BYTES string', buffer.toString('utf-8'));
    setText(buffer.toString('utf-8'));
  }
}

async function pong(peripheral: Peripheral) {
  let targetService, targetChar;
  const peripheralData = await BleManager.retrieveServices(peripheral.id);

  if (peripheralData.services) {
    const targetIndex = peripheralData.services?.length - 1;
    targetService = peripheralData.services[targetIndex];
    console.log(targetService);
  }

  if (peripheralData.characteristics) {
    const targetIndex = peripheralData.characteristics?.length - 1;
    targetChar = peripheralData.characteristics[targetIndex];
    console.log(targetChar);
  }

  if (targetService && targetChar) {
    BleManager.write(
      peripheral.id,
      targetService.uuid,
      targetChar.characteristic,
      Buffer.from('Ping').toJSON().data,
    );
  }
}

export default function Device({route}: Props) {
  const [connected, setConnected] = useState<boolean>(false);
  const [text, setText] = useState<string | null>(null);
  const peripheral = route.params.peripheral;

  const handleConnect = useCallback(async () => {
    if (peripheral) {
      await connect(peripheral, setConnected);
    }
  }, [peripheral]);

  const handleRead = useCallback(async () => {
    if (connected && peripheral) {
      console.log('READ');
      read(peripheral, setText);
    }
  }, [connected, peripheral]);

  const handlePing = useCallback(async () => {
    if (connected && peripheral) {
      console.log('Ping');
      pong(peripheral);
    }
  }, [connected, peripheral]);
  return (
    <>
      <SafeAreaView>
        <Text style={styles.header}>{peripheral?.name}</Text>
        <Pressable style={styles.button} onPress={handleConnect}>
          <Text style={styles.text}>Connect</Text>
        </Pressable>
        {connected && (
          <Pressable style={styles.button} onPress={handleRead}>
            <Text style={styles.text}>Read</Text>
          </Pressable>
        )}
        {connected && (
          <Pressable style={styles.button} onPress={handlePing}>
            <Text style={styles.text}>Ping</Text>
          </Pressable>
        )}

        <Text style={styles.text_black}>{text}</Text>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    color: Colors.black,
    fontSize: 32,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    width: '50%',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    marginTop: 40,
    backgroundColor: Colors.black,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  text_black: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'black',
    textAlign: 'center',
    marginTop: 30,
  },
});
