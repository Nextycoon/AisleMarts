const { element, by }=require('detox');const {waitAny}=require('./_waitAny');
describe('Stories tray render',()=>{it('shows loading then hydrates stories',async()=>{await waitAny([element(by.id('lux-loading')),element(by.text('Luxury Shopping Experience'))],10000);await element(by.id('stories-tray')).toExist();await element(by.id('story-card-0')).toExist();});});
