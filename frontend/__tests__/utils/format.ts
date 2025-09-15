export const formatKES = (n:number) => new Intl.NumberFormat('en-KE', { style:'currency', currency:'KES' }).format(n);
export const isKenyaPhone = (s:string) => /^\+2547\d{8}$/.test(s);
