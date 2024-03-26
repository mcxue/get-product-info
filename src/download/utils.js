import puppeteer from 'puppeteer'
import chromePaths from 'chrome-paths'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import path from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let globalPage = undefined
let globalBrowser = undefined

const initBrowser = async () => {
  return await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1300,
      height: 900
    },
    args: ['--disable-infobars', `--user-data-dir=${path.resolve(__dirname, '../../myChromeData')}`],
    executablePath: chromePaths.chrome,
  })
}

export const getBrowser = async () => {
  if (!globalBrowser) {
    globalBrowser = initBrowser()
  }
  return globalBrowser
}

export const getPage = async () => {
  if (!globalPage) {
    const browser = await getBrowser();
    globalPage = await browser.newPage()
  }
  return globalPage
}

export const getIdFromUrl = (str) => str.split('id=')[1]
