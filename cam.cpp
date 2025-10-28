#include "esp_camera.h"
#include "FS.h"
#include "SD_MMC.h"
#include "Arduino.h"

#define LED_PIN 4

#define RXD_PIN 3
#define TXD_PIN 1

HardwareSerial SerialUART(0);

bool isRecording = false;
File videoFile;

unsigned long lastBlink = 0;
bool ledState = false;

camera_config_t camera_config = {
  .pin_pwdn       = 32,
  .pin_reset      = -1,
  .pin_xclk       = 0,
  .pin_sccb_sda   = 26,
  .pin_sccb_scl   = 27,
  .pin_d7         = 35,
  .pin_d6         = 34,
  .pin_d5         = 39,
  .pin_d4         = 36,
  .pin_d3         = 21,
  .pin_d2         = 19,
  .pin_d1         = 18,
  .pin_d0         = 5,
  .pin_vsync      = 25,
  .pin_href       = 23,
  .pin_pclk       = 22,
  .xclk_freq_hz   = 20000000,
  .ledc_timer     = LEDC_TIMER_0,
  .ledc_channel   = LEDC_CHANNEL_0,
  .pixel_format   = PIXFORMAT_JPEG,
  .frame_size     = FRAMESIZE_UXGA,
  .jpeg_quality   = 10,
  .fb_count       = 2,
  .grab_mode      = CAMERA_GRAB_LATEST
};

bool initCamera() {
  return esp_camera_init(&camera_config) == ESP_OK;
}

void saveFrameToSD() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) return;

  String path = "/capture_" + String(millis()) + ".jpg";
  videoFile = SD_MMC.open(path, FILE_WRITE);
  if (videoFile) {
    videoFile.write(fb->buf, fb->len);
    videoFile.close();
  }
  esp_camera_fb_return(fb);
}

void deleteAllFiles() {
  File root = SD_MMC.open("/");
  File file = root.openNextFile();
  while(file){
    SD_MMC.remove(file.name());
    file = root.openNextFile();
  }
}

void setup() {
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  SD_MMC.begin();

  initCamera();
}

void loop() {
  if (SerialUART.available()) {
    String cmd = SerialUART.readStringUntil('\n');
    cmd.trim();

    unsigned long now = millis();
    if (now - lastBlink > 3000) {
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState);
      lastBlink = now;
      saveFrameToSD();
    }
}
