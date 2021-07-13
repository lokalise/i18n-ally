export const isProd = process.env.NODE_ENV === 'production'
export const isDev = !isProd
export const isTest = process.env.NODE_ENV === 'test'
