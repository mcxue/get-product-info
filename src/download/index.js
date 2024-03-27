import getProductLinkList from '../getProductLinkList/index.js'
import { getCurrentTime, getRandomNumber, sleep } from '../utils.js'
import * as cheerio from 'cheerio'
import { getBrowser, getIdFromUrl, getPage } from './utils.js'
import saveProductDetailList from '../saveProductDetailList/index.js'

const refreshLoginState = async () => {
  const page = await getPage()
  await page.goto('https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm')
  console.log('已刷新登陆状态，等待6秒，请稍后')
  await sleep(6 * 1000)
}

const getSingleProductByVisitUrl = async (url) => {
  const page = await getPage()
  await page.goto(url)
  const html = await page.content()
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
    id: getIdFromUrl(url),
    name,
    imgUrls,
  }
}

const getProductListWithUrlList = async (urlList) => {
  await refreshLoginState()
  const result = []
  for (let i = 0; i < urlList.length; i++) {
    const product = await getSingleProductByVisitUrl(urlList[i])
    await sleep(3000);
    console.log(`已获取商品信息${i + 1}/${urlList.length} ${product.name}`)
    if (product.name?.endsWith('...')) {
      console.log('发现商品信息不完整，退出运行');
      process.exit(233);
    }
    result.push(product)
    const randomNumber = getRandomNumber(6, 15)
    if (i < urlList.length - 1) {
      console.log(`${randomNumber}秒后获取下一件商品信息，请稍后....`)
      await sleep(randomNumber * 1000)
    }
  }
  return result
}

const download = async () => {
  const productLinks = await getProductLinkList()
  const productList = await getProductListWithUrlList(productLinks)
  console.log('商品信息下载完成，文件保存于在 productList.txt 文件中')
  await saveProductDetailList(productList)
  const browser = await getBrowser()
  await browser.close()
}

export default download
