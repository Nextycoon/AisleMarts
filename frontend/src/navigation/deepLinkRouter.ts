import { DeepLink } from './deeplinks';import { scrollToStory } from './storyRegistry';
export function routeDeepLink(dl:DeepLink){switch(dl.type){case'story':if(!dl.id)return; if(!scrollToStory(dl.id)){console.log('[router] queued story',dl.id);}break;case'product':console.log('[router] product',dl.id);break;default:console.log('[router] unknown',dl);}}
