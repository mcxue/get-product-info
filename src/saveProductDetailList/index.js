import fs from 'fs/promises'

const saveProductDetailList = async (productInfoList) => {
  return await fs.writeFile('productList.txt', JSON.stringify(productInfoList))
}

export default saveProductDetailList
