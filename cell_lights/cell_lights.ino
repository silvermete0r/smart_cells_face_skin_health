void setup() {
  for(int port=2; port<=10; port++) {
    pinMode(port, OUTPUT); 
  }
  Serial.begin(9600);
}

void light(int port) {
  digitalWrite(port, HIGH);
  delay(60000);
  digitalWrite(port, LOW);
  delay(1000);
}

char* port_to_item[9] = {
  "Cleanser", // 2
  "Toner", // 3
  "Serum", // 4
  "Moisturizer", // 5
  "Sunscreen", // 6
  "Exfoliator", // 7
  "Eye Cream", // 8 
  "Mask" // 9
};

void loop() {
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    int port = input.toInt();

    if (port >= 2 && port <= 10) {
      Serial.print("Turning on light at port: ");
      Serial.println(port);
      Serial.print("Take the item: ");
      Serial.println(port_to_item[port - 2]);
      light(port); 
    } else {
      Serial.println("Invalid port number! Enter a value between 2 and 10.");
    }
  }
}
