import fs from 'fs/promises'
import * as path from 'path'

const getProductDetailList = async () => {
  return JSON.parse(String(await fs.readFile(path.resolve('productList.txt'))))
}

export default getProductDetailList
