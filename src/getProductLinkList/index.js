import fs from 'fs/promises'
import xlsx from 'node-xlsx'

const getProductLinkList = async () => {
  let ids = []
  let excelFileData = undefined
  let txtFileData = undefined
  try {
    excelFileData = await fs.readFile('./productId.xlsx')
  } catch (e) {
    console.log('无 productId.xlsx 文件')
  }
  if (!excelFileData) {
    try {
      txtFileData = await fs.readFile('./productId.txt')
    } catch (e) {
      console.log('无 productId.xlsx 文件')
    }
  }
  if (!excelFileData && !txtFileData) {
    console.log('必须存在 productId.xlsx 或 productId.txt')
    process.exit(233)
  }
  if (excelFileData) {
    const workSheets = xlsx.parse(excelFileData)
    workSheets[0].data.forEach(row => {
      ids.push(row[0])
    })
  } else if (txtFileData) {
    ids = String(await fs.readFile('./productId.txt'))
      .split('\n')
  }
  const filteredIds = ids.filter(id => /\d/.test(String(id)[0]))
  console.log('商品的 id 列表如下')
  console.log(filteredIds);
  return filteredIds.map(id => `https://detail.tmall.com/item.htm?id=${id}`)
}

export default getProductLinkList
