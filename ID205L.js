let i = 0;

/* 
0 - I2C1 SCL 0
1 
2 - some I2C sda reg 0x9
3
4
5 - SCL reg 31
6 - 
7 - HEART SDA reg 0x44
8 - HEART SCL reg 0x44
9  - 
10 - 
11 - 
12 - MEMORY_WP
13 - 
14 - HEART_BACKLIGHT
15 - LCD?
16 - BUTTON
17 - HEART_ENABLE
18 - (DEVICE RESET), LED?
19 - MEMORY_SO
20 - MOTOR
21 - MEMORY_CS
22 - BACKLIGHT
23 - 
24 - 
25 - CHARGING
26 - 
27 - SDA reg 31 or 15
28 - 
29 - 
30 - BACKLIGHT2
31
32
33
34
35
36
37
38
39
40
*/


// I2C device SCL 5, SDA 27 addr 15
// reply 0: 33 0 0 128 240 127 0 128 0 0

// found i2c on scl 8 sda 7 reg 68
// found i2c on scl 6 sda 2 reg 9

// I2C device SCL 8 SDA 7 REG 0x44
// reply 0: [34, 1, 17, 143, 16, 32, 80, 7, 0, 2, 94, 143, 1, 255, 255, 15]

// memory spi
/*
*
21 0
19 1
12 1
*/

/**
Pin reactions:
pin 0
0 0
pin 11
11 0
pin 13
11 1
13 0
pin 15
15 0
15 1
pin 18
18 0
13 1
pin 23
18 1
23 0
pin 24
24 0
31 1
24 1
31 0
pin 27
27 0
27 1
pin 28
28 0
28 1
23 1
*/

// Poke on pin -> changed values:
// 13->11
// 22->18,30,15
// 23->30
// 24->31
// 28->27,23
// 29->23,22

// MEMORY CHIP related are
// CS - D21?
// SO - D19?
// WP - D12
// HOLD -
// SCLK -
// SI - 

// back sensor related are
// 15, 16(btn), 17, 18, 19, 25
// display - 30,31,2

// display related are
// 2, 15, 18, 30, 31,

const MOTOR = 20;
// const HEART_BACKLIGHT = 14;
const BUTTON = 16;
const HEART_SENSOR_ENABLE = 17;
const BACKLIGHT = 22;
const BACKLIGHT2 = 30;
const CHARGING = 25;

const MEMORY_CS = 21;
const MEMORY_WP = 12;
const MEMORY_SO = 19;

const vibrate = ms => digitalPulse(20, 1, ms);

const bl = level => {
  Pin(BACKLIGHT2).write(level >> 1 & 1);
  Pin(BACKLIGHT).write(level & 1);
};

vibrate([50, 50, 50]);
// digitalPulse(HEART_BACKLIGHT, 1, 1000);
// Pin(BUTTON).mode('input_pullup');

bl(2);
let j = 0;

setWatch(() => {
  console.log('btn');
  // digitalPulse(HEART_BACKLIGHT, 1, 1000);
  bl(j);
  j++;

  // digitalPulse(HEART_SENSOR_ENABLE, 1, 100);
  if (j === 4) { j = 0; }

}, BUTTON, { edge: 'falling', debounce: 50, repeat: true });

const pinMonitor = (mode) => {
  const regs = [
    2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47
  ];

  let pr = {};
  regs.forEach(r => {
    Pin(r).mode(mode);
  });

  setInterval(() => {
    regs.forEach(r => {
      const val = digitalRead(r);
      if (val != pr[r]) {
        console.log(r, val);
        pr[r] = val;
      }
    });
  }, 100);
};

// pinMonitor("input_pulldown");

const scan2 = (sda, scl) => {
  I2C1.setup({ sda: sda, scl: scl });
  for (let reg = 8; reg < 127; reg++) {
    try {
      I2C1.writeTo(reg, 0);
      console.log('found i2c on scl', scl, 'sda', sda, 'reg', Number(reg).toString(16));
      // console.log(I2C1.readFrom(reg, 1).forEach(i => console.log('j' + i)));
    } catch (e) {
    }
  }
  Pin(scl).mode('input');
  Pin(sda).mode('input');
};


const pinScan = () => {
  const regs = [
    0, 1, 2, 3, 4, 5, 6, 7,
    8, 9, 10, 11, 12, 13,
    15, 17, 18, 19, 21, 23, 24, 26, 27, 29, 31, 32, 33, 34, 35, 36, 37, 38, 39
  ];
  let a = 0;
  let b = 0;
  setInterval(() => {
    if (a >= b) { console.log('.', b); b++; a = 0; };
    if (b >= regs.length) { console.log('done'); return };

    if (a != b && a != undefined && b != undefined) {
      scan2(regs[a], regs[b]);
      scan2(regs[b], regs[a]);
    }
    a++;
  }, 500);
}

const pinScan2 = (sda) => {
  const regs = [
    0, 1, 3, 4, 5, 6, 7,
    8, 9, 10, 11, 12, 13,
    15, 17, 18, 19, 21, 23, 24, 26, 27, 29, 31, 32, 33, 34, 35, 36, 37, 38, 39
  ];
  const i = setInterval(() => {
    if (regs.length === 0) { console.log('done'); clearInterval(i); return; }
    const b = regs.shift();
    scan2(sda, b);
  }, 500);
}


// ===
///

var spi = new SPI();
setWatch(() => {
  const freePins = [
    24, 23, 28, 21, 12, 19, 18, 2, 1, 3
  ];
  const pick = () => {
    while (1) {
      var n = Math.floor(Math.random() * freePins.length);
      const res = freePins[n];
      if (res != -1) {
        freePins[n] = -1;
        return res;
      }
    }
  }
  const cs = pick();
  const en = pick();
  const irq = pick();
  const mosi = pick();
  const sck = pick();
  spi.setup({ mosi: Pin(mosi), sck: Pin(sck) });
  var g = require("ST7789").connect(spi, Pin(cs), Pin(en), Pin(irq), () => {
    console.log('conn', cs, en, irq, mosi, sck);
    //g.clear();
    g.setRotation(1);
    g.drawString("Hello", 0, 0);
    //g.setFontVector(20);
    //g.setColor(0,0.5,1);
    //g.drawString("Espruino",0,10);
  });
}, BTN1, { edge: 'rising', debounce: 50, repeat: true });