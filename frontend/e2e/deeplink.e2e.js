const { device, element, by } = require('detox');

describe('Deep link launch', () => {
  it('opens app with story deep link', async () => {
    const url = 'aislemarts://story/test-story';
    await device.launchApp({ newInstance: true, url });
    await expect(element(by.id('stories-tray'))).toExist();
  });
});
