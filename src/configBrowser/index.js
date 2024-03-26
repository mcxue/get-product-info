import puppeteer from 'puppeteer'
import chromePaths from 'chrome-paths'
import { sleep } from '../utils.js'
import path from 'path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const configBrowser = async () => {
  console.log('有 5 分钟配置浏览器，配置完毕后关闭浏览器，并终止程序')
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1300,
      height: 900
    },
    args: ['--disable-infobars', `--user-data-dir=${path.resolve(__dirname, '../../myChromeData')}`],
    executablePath: chromePaths.chrome,
  })
  await sleep(300000)
  await browser.close()
}

export default configBrowser

