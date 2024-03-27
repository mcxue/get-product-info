import fs from 'fs/promises'

export const logRequest = async (url, data) => {
  fs.appendFile('log_request.txt', `时间=${getCurrentTime()}, 请求成功: URL=${url}, 数据=${JSON.stringify(data)}\n`)
}

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const getCurrentTime = () => {
  const now = new Date()
  const utcOffset = 8 // 东八区的时间偏移量
  const offsetTime = now.getTime() + (utcOffset * 60 * 60 * 1000) // 偏移后的时间
  const offsetDate = new Date(offsetTime)
  return offsetDate.toISOString() // 将时间转换为 ISO 8601 格式
}

export const getRandomNumber = (min = 10, max = 15) => {
  const randomNumber = Math.random() * (max - min + 1) + min
  return Math.floor(randomNumber)
}

