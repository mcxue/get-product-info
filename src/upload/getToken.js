import fetch from 'node-fetch'

let globalToken = undefined
const getToken = async (appId, appSecret) => {
  if (globalToken) return globalToken
  const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST', headers: {
      'Content-Type': 'application/json',
    }, body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret,
    })
  }).then(res => res.json())
  if (res.code === 0 && res.tenant_access_token) {
    globalToken = res.tenant_access_token
  }
  return globalToken
}

export default getToken
