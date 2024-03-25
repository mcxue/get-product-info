import * as cheerio from 'cheerio'
import chromePaths from 'chrome-paths'
import puppeteer from 'puppeteer'
import fetch from 'node-fetch'
import fs from 'fs/promises'
import config from './config.js'
import productLinks from './productLinks.js'

const requiredFields = [
  'APP_ID',
  'APP_SECRET',
  'SPREAD_SHEET_TOKEN',
  'SHEET_ID',
  'myChromeDataPath',
]

for (let i = 0; i < requiredFields.length; i++) {
  if (!config[requiredFields[i]]) {
    console.error(`缺少必要字段${requiredFields[i]}`)
    process.exit(1)
  }
}

const {
  // LOCAL_EXCEL_FILE_PATH,
  APP_ID,
  APP_SECRET,
  SPREAD_SHEET_TOKEN,
  SHEET_ID,
  myChromeDataPath,
  configBrowserFlag,
} = config

const LETTER_LIST = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']

// const getUrlList = () => {
//   const sheets = xlsx.parse(LOCAL_EXCEL_FILE_PATH)
//   const sheet = sheets[0]
//   return sheet.data.map(row => row[0])
// }

const getId = (str) => str.split('id=')[1]

let globalSinglePage = undefined
let globalBrowser = undefined
const getSinglePage = async () => {
  if (globalSinglePage) return globalSinglePage
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1300,
      height: 900
    },
    args: ['--disable-infobars', `--user-data-dir=${myChromeDataPath}`],
    executablePath: chromePaths.chrome,
  })
  globalBrowser = browser
  globalSinglePage = await browser.newPage()
  return globalSinglePage
}

const getHtml = async (url) => {
  const page = await getSinglePage()
  await page.goto(url)
  return await page.content()
}

const getSingleProduct = async (url) => {
  const html = await getHtml(url)
  const $ = cheerio.load(html)
  const name = $('.ItemHeader--mainTitle--3CIjqW5').text()
  const images = $('img.PicGallery--thumbnailPic--1spSzep')
  const imgUrls = []
  images.each((index, element) => {
    const imgSrc = $(element).attr('src')
    imgUrls.push(imgSrc?.startsWith('//') ? `https:${imgSrc}` : imgSrc)
  })
  return {
    date: getCurrentTime(),
    id: getId(url),
    name,
    imgUrls,
  }
}

let globalToken = undefined
const getToken = async () => {
  if (globalToken) return globalToken
  const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST', headers: {
      'Content-Type': 'application/json',
    }, body: JSON.stringify({
      app_id: APP_ID, app_secret: APP_SECRET,
    })
  }).then(res => res.json())
  if (res.code === 0 && res.tenant_access_token) {
    globalToken = res.tenant_access_token
  }
  return globalToken
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const getProductListWithUrlList = async (urlList) => {
  const result = []
  for (let i = 0; i < urlList.length; i++) {
    const product = await getSingleProduct(urlList[i])
    await sleep(1000)
    console.log(`获取商品信息${i + 1}/${urlList.length}`)
    result.push(product)
  }
  return result
}

const getCurrentTime = () => {
  const now = new Date()
  const utcOffset = 8 // 东八区的时间偏移量
  const offsetTime = now.getTime() + (utcOffset * 60 * 60 * 1000) // 偏移后的时间
  const offsetDate = new Date(offsetTime)
  return offsetDate.toISOString() // 将时间转换为 ISO 8601 格式
}

const logRequest = async (url, data) => {
  fs.appendFile('log_request.txt', `时间=${getCurrentTime()}, 请求成功: URL=${url}, 数据=${JSON.stringify(data)}\n`)
}

const uploadProductList = async (productList) => {
  const token = await getToken()
  const url = `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${SPREAD_SHEET_TOKEN}/values_append`
  const res = await fetch(url, {
    method: 'POST', headers: {
      'Content-Type': 'application/json', Authorization: `Bearer ${token}`,
    }, body: JSON.stringify({
      valueRange: {
        'range': SHEET_ID,
        'values': productList.map(({date, id, name}) => [date, id, name])
      }
    })
  }).catch(e => {
    console.log(e)
  })
  console.log(`已上传产品信息的文本部分`)
  const parsedRes = await res.json()
  logRequest(url, parsedRes)
  const tableRange = (parsedRes).data.tableRange
  const cellRange = tableRange.split('!')[1]
  const cellRangeList = cellRange.split(':')
  const startCell = cellRangeList[0]
  const endCell = cellRangeList[1]
  // const startColumn = startCell[0]
  const startRow = startCell.slice(1)
  const endColumn = endCell[0]
  // const endRow = endCell.slice(1)
  console.log('正在上传商品的图片信息，请稍后')
  for (let i = 0; i < productList.length; i++) {

    for (let j = 0; j < productList[i].imgUrls.length; j++) {
      const cellColumn = LETTER_LIST[LETTER_LIST.indexOf(endColumn) + 1 + j]
      const cellRow = String(Number(startRow) + i)
      await uploadImage(productList[i].imgUrls[j], cellColumn + cellRow)
    }
  }
  console.log('商品的图片信息上传完成')
}


const getUsefulImgUrl = (url) => {
  const index = url.indexOf('.jpg')
  return url.slice(0, index + 4)
}

const getImgName = (url) => {
  const index = url.lastIndexOf('/')
  return url.slice(index + 1)
}

const uploadImage = async (imgUrl, cell) => {
  const usefulImgUrl = getUsefulImgUrl(imgUrl)
  const imgName = getImgName(usefulImgUrl)
  const buffer = await fetch(usefulImgUrl).then(res => res.buffer())
  const token = await getToken()
  const url = `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${SPREAD_SHEET_TOKEN}/values_image`
  const res = await fetch(url, {
    method: 'POST', headers: {
      'Content-Type': 'application/json', Authorization: `Bearer ${token}`,
    }, body: JSON.stringify({
      range: `${SHEET_ID}!${cell}:${cell}`, image: Array.from(buffer), name: imgName,
    })
  })
  logRequest(url, await res.json())
}

const saveProductInfoListToLocal = async (productInfoList) => {
  return await fs.writeFile('productList.txt', JSON.stringify(productInfoList))
}

const getProductInfoListFromLocal = async () => {
  return JSON.parse(String(await fs.readFile('productList.txt')))
}

(async () => {
  try {
    if (configBrowserFlag) {
      console.log('有 5 分钟配置浏览器')
      const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
          width: 1300,
          height: 900
        },
        args: ['--disable-infobars', `--user-data-dir=${myChromeDataPath}`],
        executablePath: chromePaths.chrome,
      })
      await sleep(300000)
      await browser.close()
      process.exit(0)
    }
    const productList = await getProductListWithUrlList(productLinks)
    await saveProductInfoListToLocal(productList)
    const localProductList = await getProductInfoListFromLocal()
    await uploadProductList(localProductList)
    if (globalBrowser) {
      await globalBrowser.close()
    }
    process.exit(0)
  } catch (e) {
    if (globalBrowser) {
      await globalBrowser.close()
    }
    process.exit(1)
    console.log(e)
  }
})()
