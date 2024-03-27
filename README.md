# 获取商品详情并上传到云文档的电子表

## 一、使用步骤

### 1. 在飞书后台申请一个应用并配置 config.js

1. 在 [开发者后台](https://open.feishu.cn/app?lang=zh-CN) 创建一个企业自建应用，可以为其取一个名字，比如"更新商品信息"
2. 给它添加一个权限，该权限名为 "查看、评论、编辑和管理云空间中所有文件"
3. 发布该应用
4. 在基础信息中找到 "App ID" 和 "App Secret"，复制并填入 config.js 中的 "APP_ID"、"APP_SECRET"

### 2. 选择将要被填如产品信息的电子表并配置 config.js

1. 打开电子表的网址，网址的路径结尾的一串字符串是该电子表的唯一标识，复制并填入到 config.js 中的 "SPREAD_SHEET_TOKEN"
   * 比如 `https://o7oex3zr.feishu.cn/sheets/YydRsyHxqhYeT3t8QctgkAnkb` 中的 `YydRsyHxqhYeT3t8QctgkAnkb`
2. 在该电子表中新建一个 sheet 并切换 sheet，网址结尾会出现对应 sheet 的唯一标识， 复制并填入到 config.js 中的 "SHEET_ID"
   * 比如 `https://o7oex3zr.feishu.cn/sheets/YydRsyHxqhYeT3t8QctgkAnkb?sheet=Pgscd` 中的 `Pgscd`
3. 在右上角鼠标选择点击"..." > "...更多" > "添加应用"，搜索出创建的"更新商品信息"应用，为其赋予编辑能力并添加
4. 在表格第一行的单元格依次填入"日期"、"id"、"名字"、"图片"

### 3. 配置浏览器、登陆淘宝、配置 config.js

1. 配置临时的浏览器数据存放的位置，填入到 config.js 中的 "myChromeDataPath"
2. 将 config.js 中 configBrowserFlag 设置为 true，打开淘宝页面并登陆，随后关闭
3. 将 config.js 中 configBrowserFlag 设置为 false

### 4. 添加拥有商品 id 的文件

在项目中，

### 5. Node 环境配置与安装依赖

1. 本脚本运行需要安装 Node 环境，自行网络搜索安装 Node 环境

2. 安装依赖
```
npm install
```
### 6. 运行脚本
```bash
node ./index.js

```

## 二、飞书开放接口

* [电子表格>单元格>追加数据](https://open.feishu.cn/document/server-docs/docs/sheets-v3/data-operation/append-data)
* [电子表格>单元格>写入图片](https://open.feishu.cn/document/server-docs/docs/sheets-v3/data-operation/write-images)
