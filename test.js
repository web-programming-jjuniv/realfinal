const service_uuid = "c6f8b088-2af8-4388-8364-ca2a907bdeb8";
const characteristic_uuid = "f6aa83ca-de53-46b4-bdea-28a7cb57942e";

let characteristic; // 전역 변수로 특성 저장
let device;         // 전역 변수로 BLE 디바이스 저장

async function main() {
    console.log('Hello Bleuno');
    document.querySelector('#automode').addEventListener('click', autoModeSend);                      //각 버튼에 이벤트 리스너 등록
    document.querySelector('#endmode').addEventListener('click', endModeSend);
    document.querySelector('#connectBluetooth').addEventListener('click', connectDevice);
    document.querySelector('#blinker1').addEventListener('click', blinker1send);
    document.querySelector('#blinker2').addEventListener('click', blinker2send);
    document.querySelector('#blinker3').addEventListener('click', blinker3send);
    document.querySelector('#blinker4').addEventListener('click', blinker4send);
    document.querySelector('#send').addEventListener('click', sendData);
    document.querySelector('#disconnect').addEventListener('click', disconnectDevice);
    document.querySelector('#clear').addEventListener('click', () => {
        document.querySelector('#data-received').value = '';
    });
}

async function connectDevice() {
    try {
        // 디바이스 선택(선택 창이 열리고 사용자가 선택할 때까지 대기)
        device = await navigator.bluetooth.requestDevice({
            filters: [
                {
                    namePrefix: 'ESP32_BLE'
                },
                {
                    services: [service_uuid]
                }
            ]
        });

        console.log('디바이스 선택됨:', device.name);

        // 디바이스 연결
        const server = await device.gatt.connect();
        console.log('GATT 서버에 연결됨');

        // 서비스 접근
        const service = await server.getPrimaryService(service_uuid);
        console.log('서비스 접근 성공');

        // 특성 접근 및 저장
        characteristic = await service.getCharacteristic(characteristic_uuid);
        console.log('특성 접근 성공');

        // 특성 값 변경 시 알림 수신 설정
        const decoder = new TextDecoder('utf-8');
        characteristic.addEventListener('characteristicvaluechanged', (event) => {
            const value = event.target.value;
            const receivedValue = decoder.decode(value);
            console.log('알림 수신:', receivedValue);

            // 수신 데이터를 화면에 표시
            const dataReceived = document.querySelector('#data-received');
            dataReceived.value += `Received: ${receivedValue}\n`;
            dataReceived.scrollTop = dataReceived.scrollHeight; // 스크롤 최신화
        });
        await characteristic.startNotifications();
        console.log('알림 수신 시작');

        const connectButton = document.querySelector('#connect');
        connectButton.innerText = '연결 해제';
        connectButton.removeEventListener('click', connectDevice);
        connectButton.addEventListener('click', disconnectDevice);

    } catch (error) {
        console.error('에러 발생:', error);
    }
}

async function disconnectDevice() {
    try {
        if (device && device.gatt.connected) {
            await device.gatt.disconnect();
            console.log('GATT 서버 연결 해제됨');
        }

        const connectButton = document.querySelector('#connect');
        connectButton.innerText = '연결';
        connectButton.removeEventListener('click', disconnectDevice);
        connectButton.addEventListener('click', connectDevice);

    } catch (error) {
        console.error('에러 발생:', error);
    }
}
async function blinker1send() {
    try {
        if (characteristic) {
            const encoder = new TextEncoder();
            const resetcommand = encoder.encode("off -1"); // LED 켜기 명령
            await characteristic.writeValue(resetcommand);
            const command = encoder.encode("on 1 2 3 8"); // LED 켜기 명령
            await characteristic.writeValue(command);
            console.log('신호등1 명령 전송됨');
        } else {
            console.error('BLE 특성이 연결되지 않았습니다.');
        }
    } catch (error) {
        console.error('LED 켜기 명령 전송 중 오류 발생:', error);
    }

}

async function blinker2send() {
    try {
        if (characteristic) {
            const encoder = new TextEncoder();
            const resetcommand = encoder.encode("off -1"); // LED 켜기 명령
            await characteristic.writeValue(resetcommand);
            const command = encoder.encode("on 2 3 ~ 9"); // LED 켜기 명령
            await characteristic.writeValue(command);
            console.log('신호등2 명령 전송됨');
        } else {
            console.error('BLE 특성이 연결되지 않았습니다.');
        }
    } catch (error) {
        console.error('LED 켜기 명령 전송 중 오류 발생:', error);
    }

}

async function blinker3send() {
    try {
        if (characteristic) {
            const encoder = new TextEncoder();
            const resetcommand = encoder.encode("off -1"); // LED 켜기 명령
            await characteristic.writeValue(resetcommand);
            const command = encoder.encode("on 1 3 ~ 10"); // LED 켜기 명령
            await characteristic.writeValue(command);
            
            console.log('신호등3 명령 전송됨');
        } else {
            console.error('BLE 특성이 연결되지 않았습니다.');
        }
    } catch (error) {
        console.error('LED 켜기 명령 전송 중 오류 발생:', error);
    }

}

async function blinker4send() {
    try {
        if (characteristic) {
            const encoder = new TextEncoder();
            const resetcommand = encoder.encode("off -1"); // LED 켜기 명령
            await characteristic.writeValue(resetcommand);
            const command = encoder.encode("on 1 2 ~ 11"); // LED 켜기 명령
            await characteristic.writeValue(command);
            console.log('신호등4 명령 전송됨');
        } else {
            console.error('BLE 특성이 연결되지 않았습니다.');
        }
    } catch (error) {
        console.error('LED 켜기 명령 전송 중 오류 발생:', error);
    }

}

async function autoModeSend() {
    try {
        if (!characteristic) {
            console.error('BLE 특성이 연결되지 않았습니다.');
            return;
        }

        const encoder = new TextEncoder();

        // LED 상태를 설정하는 함수
        async function sendCommand(command) {
            const encodedCommand = encoder.encode(command);
            await characteristic.writeValue(encodedCommand);
            console.log('전송된 명령:', command);
        }

        // 지연 시간 함수
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // 자동 모드 순환 패턴
        while (true) {
            // 1, 2, 3, 8 상태로 5초간 유지
            await sendCommand("on 1 2 3 8");
            await delay(5000);

            // 1, 2, 3, 4 상태로 1초간 유지
            await sendCommand("on 1 2 3 4");
            await sendCommand("off 8")
            await delay(1000);

            // 1, 2, 3, 9 상태로 5초간 유지
            await sendCommand("on ~ 2 3 9");
            await sendCommand("off 4 1")
            await delay(5000);

            // 1, 2, 3, 5 상태로 1초간 유지
            await sendCommand("on ~ 2 3 5")
            await sendCommand("off 9 ");
            await delay(1000);

            // 1, 3, 10 상태로 5초간 유지
            await sendCommand("on 1 3 10 ~");
            await sendCommand("off 5 2")
            await delay(5000);

            // 1, 3, 6 상태로 1초간 유지
            await sendCommand("on 1 3 6 ~");
            await sendCommand("off 10")
            await delay(1000);

            // 1, 2, 11 상태로 5초간 유지
            await sendCommand("on ~ 1 2 11");
            await sendCommand("off 6 3")
            await delay(5000);

            // 1, 2, 7 상태로 1초간 유지
            await sendCommand("on ~ 1 2 7");
            await sendCommand("off 11")
            await delay(1000);

            await sendCommand("off 7 ~")
            await delay(1);



            // 무한 반복 (필요시 종료 조건 추가 가능)
        }
    } catch (error) {
        console.error('자동 모드 실행 중 오류 발생:', error);
    }
}
async function endModeSend() {
    try {
        if (characteristic) {
            const encoder = new TextEncoder();
            const command = encoder.encode("off -1"); // LED 켜기 명령
            await characteristic.writeValue(command);
            console.log('LED 켜기 명령 전송됨');
        } else {
            console.error('BLE 특성이 연결되지 않았습니다.');
        }
    } catch (error) {
        console.error('LED 켜기 명령 전송 중 오류 발생:', error);
    }

}
async function sendData() {
    try {
        if (!characteristic) {
            console.error('BLE 디바이스가 연결되지 않았습니다.');
            return;
        }

        // 입력 필드에서 데이터 가져오기
        const dataToSend = document.querySelector('#data-to-send').value;
        if (!dataToSend) {
            console.error('보낼 데이터가 없습니다.');
            return;
        }

        // 데이터 인코딩 및 전송
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(dataToSend);
        await characteristic.writeValue(encodedData);
        console.log('데이터 전송:', dataToSend);

        // 전송 데이터를 화면에 표시
        const dataReceived = document.querySelector('#data-received');
        dataReceived.value += `Sent: ${dataToSend}\n`;

    } catch (error) {
        console.error('데이터 전송 중 에러 발생:', error);
    }
}

export default main;
