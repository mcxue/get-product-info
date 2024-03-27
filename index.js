import configBrowser from './src/configBrowser/index.js'
import config from './config.js'
import download from './src/download/index.js'
import upload from './src/upload/index.js'

(async () => {
  try {
    if (config.configBrowserFlag || process.argv.some(str => str.includes('--config')) ) {
      await configBrowser()
    } else {
      await download()
      await upload()
    }
    process.exit(0)
  } catch (e) {
    console.log(e)
    process.exit(233)
  }
})()
