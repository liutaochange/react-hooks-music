import axios from 'axios'
import { baseUrl } from './config'

//axios 的实例及拦截器配置
const axiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  timeout: 50000,
})

axiosInstance.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.log(err, '网络错误')
  }
)

export { axiosInstance }
