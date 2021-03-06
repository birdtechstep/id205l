// settings screen, renders brightness level
const fb = require('fb');

const start = () => {
  const bg = fb.add({
    x: 80,
    y: 40,
    w: 80,
    h: 160,
    c: fb.color(99, 99, 99),
  });
  const fg = fb.add({
    x: 80,
    y: 40,
    w: 80,
    c: fb.color(33, 33, 33),
  });

  const update = () => {
    const h = 160 - 40 * SETTINGS.BL_LEVEL;
    fb.set(fg, { h: h });
  };

  const onTap = () => {
    SETTINGS.BL_LEVEL += 1;
    if (SETTINGS.BL_LEVEL == 4) {
      SETTINGS.BL_LEVEL = 1;
    }
    Watch.setBacklight(SETTINGS.BL_LEVEL);
    update();
  }

  update();

  return {
    onStop: () => {
      fb.remove(bg);
      fb.remove(fg);
    },
    onTap: onTap,
  }
};

module.exports = start;