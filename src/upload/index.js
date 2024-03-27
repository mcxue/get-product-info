import fetch from 'node-fetch'
import getToken from './getToken.js'
import config from '../../config.js'
import { logRequest } from '../utils.js'
import { LETTER_LIST } from './constants.js'
import getProductDetailList from '../getProductDetailList/index.js'
import { getImgName, getUsefulImgUrl } from './utils.js'

const {APP_ID, APP_SECRET, SPREAD_SHEET_TOKEN, SHEET_ID} = config

const uploadImage = async (imgUrl, cell) => {
  const usefulImgUrl = getUsefulImgUrl(imgUrl)
  const imgName = getImgName(usefulImgUrl)
  try {
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
  } catch (e) {
    console.log(e)
  }
}

const uploadProductList = async (productList) => {
  if (!(APP_ID && APP_SECRET && SPREAD_SHEET_TOKEN)) {
    return Promise.reject({
      code: '233',
      msg: '请检查以下配置是否为空：APP_ID、APP_SECRET、SPREAD_SHEET_TOKEN、SHEET_ID'
    })
  }
  const token = await getToken(APP_ID, APP_SECRET)
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
  await logRequest(url, parsedRes)
  const tableRange = (parsedRes).data.tableRange
  const cellRange = tableRange.split('!')[1]
  const cellRangeList = cellRange.split(':')
  const startCell = cellRangeList[0]
  const endCell = cellRangeList[1]
  const startRow = startCell.slice(1)
  const endColumn = endCell[0]
  console.log('正在上传商品的图片信息，每间隔1秒上传一张图片')
  for (let i = 0; i < productList.length; i++) {
    for (let j = 0; j < productList[i].imgUrls.length; j++) {
      const cellColumn = LETTER_LIST[LETTER_LIST.indexOf(endColumn) + 1 + j]
      const cellRow = String(Number(startRow) + i)
      console.log(`上传商品 ${i + 1}/${productList.length}，上传图片 ${j + 1}/${productList[i].imgUrls.length}`)
      await uploadImage(productList[i].imgUrls[j], cellColumn + cellRow).then()
    }
  }
  console.log('商品的图片信息上传完成')
}

const upload = async () => {
  const localProductList = await getProductDetailList()
  await uploadProductList(localProductList)
}

export default upload
