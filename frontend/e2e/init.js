const detox = require('detox'); beforeAll(async()=>{await detox.init(undefined,{launchApp:true});},300000); afterAll(async()=>{await detox.cleanup();}); jest.retryTimes(1);
