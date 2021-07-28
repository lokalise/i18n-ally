// @ts-ignore
export const isProd: boolean = process.env.NODE_ENV === 'production'
export const isDev = !isProd
// @ts-ignore
export const isTest: boolean = process.env.NODE_ENV === 'test'
