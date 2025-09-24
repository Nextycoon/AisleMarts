export const safeLog = (...args: any[]) => { 
  if (__DEV__) console.log(...args); 
};