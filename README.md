<h1 align="center">速派用车云平台司机端</h1>

## 介绍

速派会务司机端使用了 `Vue3`、`Vite4`、`Vant3`、`Pinia`、`TypeScript`、`UnoCSS`、`jsBridge` 等技术开发。

## 特性

- **技术栈**：使用 Vue3/Vite4/Vant3 等前端技术开发
- **TypeScript**：应用程序级 JavaScript 的语言
- **特性**：支持使用 Vue 和 TSX 编写组件
- **Android交互** H5与Native的通信

## 基础知识

- [Git](https://git-scm.com/) - 熟悉 `GIT` 使用
- [Vite](https://cn.vitejs.dev/) - 熟悉 `Vite` 特性
- [Vue3](https://v3.vuejs.org/) - 熟悉 `Vue3` 基础语法
- [Vant3](https://youzan.github.io/vant/v3/#/zh-CN) - 掌握 `vant3` 组件基本使用
- [Vue-Router-Next](https://router.vuejs.org/) - 熟悉 `Vue-Router`基本使用
- [Postcss-Mobile-Forever](https://github.com/wswmsword/postcss-mobile-forever) - 了解手机端 `px` 转 `viewport` 插件的作用
- [Lodash-es](https://www.lodashjs.com/) - `JS`高性能工具库
- [UnoCSS](https://unocss.dev/) - 原子化 `CSS`，熟悉 `UnoCSS` 基本使用
- [Mock.js](https://github.com/nuysoft/Mock) - 了解 `Mockjs` 基本语法
- [ES6+](http://es6.ruanyifeng.com/) - 熟悉 `ES6` 基本语法
- [JsBridge](https://github.com/uknownothingsnow/JsBridge) - 熟悉 `JsBridge` 基本用法

## 环境准备

本地环境需要安装 [Pnpm](https://www.pnpm.cn/)、[Node.js](http://nodejs.org/) 和 [Git](https://git-scm.com/)

- 必须使用 [pnpm>=8.6.10](https://www.pnpm.cn/)，否则依赖可能安装不上。
- [Node.js](http://nodejs.org/) 版本要求`18.x`以上，且不能为`13.x`版本，这里推荐 `^20.9.0 || >=21.1.0`。

## VS Code 配套插件

如果你使用的 IDE 是 [VS Code](https://code.visualstudio.com/)（推荐）的话，可以安装以下工具来提高开发效率及代码格式化

- [UnoCSS](https://marketplace.visualstudio.com/items?itemName=antfu.unocss) - UnoCSS 提示插件
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 开发必备
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) - 用于 TypeScript 服务器的 Vue 插件
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - 脚本代码检查
- [DotENV](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv) - `.env` 文件 高亮
- [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) - 更好的错误定位
- [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) - 不同 IDE 维护一致的编码样式
- [File Nesting Updater](https://marketplace.visualstudio.com/items?itemName=antfu.file-nesting) - 使用 VS Code 的文件嵌套功能使文件树更干净的配置
- [Pretty TypeScript Errors](https://marketplace.visualstudio.com/items?itemName=antfu.file-nesting) - 使 VSCode 中的 TypeScript 错误更漂亮、更易于理解
- [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree) - 在树视图中显示 TODO、FIXME 等注释标签
- [Trailing Spaces](https://marketplace.visualstudio.com/items?itemName=shardulm94.trailing-spaces) - 突出显示尾随空格并立即将其删除

## 安装使用

- 获取项目代码

```bash
git clone http://git.hntohere.com/web/car-soybean-web.git
```

- 安装依赖

```bash
pnpm install
```

- 运行

```bash
pnpm run dev
```

- 打包

```bash
pnpm run build
```

## Git 提交规范

### 提交规范

参考 [vue](https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md) 规范 ([Angular](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular))

- `feat` 增加新功能
- `fix` 修复问题/BUG
- `style` 代码风格相关无影响运行结果的
- `perf` 优化/性能提升
- `refactor` 重构
- `revert` 撤销修改
- `test` 测试相关
- `docs` 文档/注释
- `chore` 依赖更新/脚手架配置修改等
- `workflow` 工作流改进
- `ci` 持续集成
- `types` 类型定义文件更改
- `wip` 开发中

### 提交校验

## 注意事项

- 装上 volar 插件后更好的支持模板开发
- 项目开发时请锁定依赖版本
- 大项目可以不用对 vant 启用按需加载，直接全部引入
- 所有路由均为一级，不使用嵌套写法

## 待处理

- tsx + css-modules 不支持媒体查询 [issue](https://github.com/vitejs/vite-plugin-vue/issues/200)
- 打包时 lightningcss 不会处理字体文件，目前仍然使用 postcss 处理样式

## 调用安卓

```
/**
 * @des 打电话
 * 设置属性为tel + ":" + 电话号码
 */
<a href="tel:10086">打电话</a>


/**
* @des 发短信
* 设置属性为sms + ":" + 电话号码 + "_" + 内容
*/
<a href="sms:10086_查话费">打电话</a>

```

## 调用 weixin-JS-SDK
```
/**
* @des 发短信
* 设置属性为sms + ":" + 电话号码 + "?body=" + 内容
*/
<a href="sms:10086?body="查话费"">打电话</a>
```

## 浏览器支持

本地开发推荐使用`Chrome 80+` 浏览器

支持现代浏览器, 不支持 IE

| [![Edge](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png)](http://godban.github.io/browsers-support-badges/) IE | [![Edge](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png)](http://godban.github.io/browsers-support-badges/) Edge | [![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png)](http://godban.github.io/browsers-support-badges/) Firefox | [![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png)](http://godban.github.io/browsers-support-badges/) Chrome | [![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png)](http://godban.github.io/browsers-support-badges/) Safari |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| not support                                                                                                                                           | last 2 versions                                                                                                                                         | last 2 versions                                                                                                                                                    | last 2 versions                                                                                                                                                | last 2 versions                                                                                                                                                |

```bash
page.json
 "simple-git-hooks": {
    "pre-commit": "npx lint-staged",
    "commit-msg": "npx commitlint --edit $1"
  },
```
