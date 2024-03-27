export const getUsefulImgUrl = (url) => {
  let index = url.indexOf('.jpg')
  if (index === -1) {
    index = url.indexOf('.png')
  }
  return url.slice(0, index + 4)
}

export const getImgName = (url) => {
  const index = url.lastIndexOf('/')
  return url.slice(index + 1)
}
