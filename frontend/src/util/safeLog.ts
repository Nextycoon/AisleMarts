export const safeLog = (...args: any[]) => { 
  if (__DEV__) console.log(...args); 
};

export const safeWarn = (...args: any[]) => {
  if (__DEV__) console.warn(...args);
};

export const safeError = (...args: any[]) => {
  if (__DEV__) console.error(...args);
};