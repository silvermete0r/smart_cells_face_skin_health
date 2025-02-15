void setup() {
  for (int port = 8; port <= 10; port++) {
    pinMode(port, OUTPUT);
  }
  Serial.begin(38400);
}

void light(int pin) {
  digitalWrite(pin, HIGH);
  delay(60000);
  digitalWrite(pin, LOW);
  delay(1000);
}

const char* port_to_item[4] = {
  "",
  "Cleansers",   // product code 1: corresponds to pin 8
  "Moisturizers",// product code 2: corresponds to pin 9
  "Exfoliants"   // product code 3: corresponds to pin 10
};

void loop() {
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();  // remove extra whitespace and newline characters
    
    if (input.length() == 0) {
      Serial.println("No product code received.");
      return;
    }
    
    int productCode = input.toInt();
    if (productCode >= 1 && productCode <= 3) {
      int pin = productCode + 7;  // mapping product code to pin (1->8, etc.)
      Serial.print("Turning on light at pin: ");
      Serial.println(pin);
      Serial.print("Take the item: ");
      Serial.println(port_to_item[productCode]);
      light(pin); 
    } else {
      Serial.println("Invalid product code! Enter a value between 1 and 3.");
    }
  }
}
