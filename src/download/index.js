import getProductLinkList from '../getProductLinkList/index.js'
import { getCurrentTime, sleep } from '../utils.js'
import * as cheerio from 'cheerio'
import { getBrowser, getIdFromUrl, getPage } from './utils.js'
import saveProductDetailList from '../saveProductDetailList/index.js'

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
  const result = []
  for (let i = 0; i < urlList.length; i++) {
    const product = await getSingleProductByVisitUrl(urlList[i])
    await sleep(1500) // 每间 1.5 秒浏览访问一次商品
    console.log(`获取商品信息${i + 1}/${urlList.length}`)
    result.push(product)
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
