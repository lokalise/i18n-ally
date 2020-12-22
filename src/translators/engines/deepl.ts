import axios from 'axios'
import { Config, DeepLUsage } from '../../core'

const deepl = axios.create({
  baseURL: 'https://api.deepl.com/v2',
  params: {
    auth_key: Config.deeplAuth,
  },
})

deepl.interceptors.response.use((response) => {
  if (response.status === 200) return Promise.resolve(response.data)

  return Promise.reject(response.data)
})

async function usage(): Promise<DeepLUsage> {
  try {
    return await deepl.get('/usage')
  }
  catch (err) {
    console.trace(err)

    throw err
  }
}

export {
  usage,
}
