#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// UUIDs for Service and Characteristics (Generate your own unique ones!)
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define TEMP_CHAR_UUID      "beb5483e-36e1-4688-b7f5-ea07361b26a8" // For ESP32 -> RN (NOTIFY)
#define COMMAND_CHAR_UUID   "1a7e8e50-9d0d-457e-97f6-68f447781f8f" // For RN -> ESP32 (WRITE)

// DS18B20 setup
#define ONE_WIRE_BUS 4 // GPIO pin for DS18B20 data
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// --- Global State ---
unsigned long lastPushTime = 0;
const long pushInterval = 1000; // 10 seconds



BLECharacteristic *pTempCharacteristic;
BLECharacteristic *pCommandCharacteristic;
bool deviceConnected = false;

// --- Server Callbacks ---
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Client connected.");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Client disconnected. Starting advertising...");
      BLEDevice::startAdvertising(); // Restart advertising to allow reconnection
    }
};

// --- Command Handling Callback (RN -> ESP32) ---
class MyCharacteristicCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
        
            // Add other command handlers here...
    }
};

void setup() {
    Serial.begin(115200);

    sensors.begin();

    // 1. Initialize BLE Device and Server
    BLEDevice::init("ESP32_TEMP_SERVER"); // Device Name
    BLEServer *pServer = BLEDevice::createServer();

    pServer->setCallbacks(new MyServerCallbacks());

    // Create the Service
    BLEService *pService = pServer->createService(SERVICE_UUID);

    // Create Temperature Characteristic (Read/Notify - ESP32 -> RN Data Flow)
    pTempCharacteristic = pService->createCharacteristic(
                                         TEMP_CHAR_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_NOTIFY
                                       );
    pTempCharacteristic->addDescriptor(new BLE2902()); // Enable Notifications

    // Create Command Characteristic (Write - RN -> ESP32 Control Flow)
    pCommandCharacteristic = pService->createCharacteristic(
                                            COMMAND_CHAR_UUID,
                                            BLECharacteristic::PROPERTY_WRITE
                                          );
    pCommandCharacteristic->setCallbacks(new MyCharacteristicCallbacks());

    // Start the Service and Advertising
    pService->start();
    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    BLEDevice::startAdvertising();

    Serial.println("Waiting for BLE client connection...");
}

void loop() {
    // 3. Data Flow (ESP32 -> RN) - Push Data using Notification
    if (deviceConnected && (millis() - lastPushTime > pushInterval)) {
        sensors.requestTemperatures();
        float currentTempC = sensors.getTempCByIndex(0);; 
        // Check if reading is valid
        if (currentTempC == DEVICE_DISCONNECTED_C) {
            Serial.println("Error: Could not read temperature");
        } else {
            Serial.print("Temperature: ");
            Serial.print(currentTempC);
            Serial.println(" °C");

            // Convert float to byte array
            uint8_t data[4];
            memcpy(data, &currentTempC, 4);

            // Notify the temperature value
            pTempCharacteristic->setValue(data, 4);
            pTempCharacteristic->notify();
        }
        lastPushTime = millis();
    }
    delay(100);
}