export const getUsefulImgUrl = (url) => {
  const index = url.indexOf('.jpg')
  return url.slice(0, index + 4)
}

export const getImgName = (url) => {
  const index = url.lastIndexOf('/')
  return url.slice(index + 1)
}
