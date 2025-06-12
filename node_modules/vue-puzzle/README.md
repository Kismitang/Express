
@[TOC](vue-puzzle文档)


# 文档地址

[vue-puzzle-文档地址1](https://slailcp.github.io/vuePuzzle-document/index.html)

[vue-puzzle-文档地址2](https://blog.csdn.net/sllailcp/article/details/139597472?spm=1001.2014.3001.5502)

# 案例地址

[vue-puzzle-案例地址](https://slailcp.github.io/vuePuzzle/index.html)

# 源码地址

[vue-puzzle-源码地址](https://github.com/slailcp/puzzle/blob/main/puzzle1.vue)



# npm 安装
npm i --save vue-puzzle

# 引入
import {Puzzle1} from 'vue-puzzle';

import 'vue-puzzle/vuePuzzle.css';

# 使用

```js
<Puzzle1 />
```


# props

| name | 描述 | 类型  | 默认值 |
|-|---|--|--|
| bgColor  | 背景色 | String | "#F2F2F3" |
| borderColor  | 边框色 | String | "#3E5185" |
| borderWidth  | 边框宽度 | [Number, String] | 2 |
| index  | 索引 | [Number, String] | 0 |
| shadowColor  | 阴影色 | String | 无 |
| shadowRatio  | 阴影明显程度 | [Number, String] | 0.2 |
| shadowSpread  | 阴影扩散程度 | [Number, String] | 125 |
| colors  | 渐变色数组 | Array | [] |
| total  | 如果是一个列表的话，一共多少个 | [Number, String] | 0 |
| linenum  | 如果是一个列表的话，一行多少个 | [Number, String] | 6 |
| size  | 拼图大小 | String | 100px |
| mark  | 当前拼图的标识，防止内部使用特效重复 | String | 'one' |
| imgpath  | 背景图片 | String | '' |
| gradient  | 渐变配置 | gradientObj | - |



## gradientObj

| name | 描述 | 类型  | 默认值 | 备注|
|-|---|--|--|--|
| type (linear/radial)  | 渐变类型 | String | linear |linear:线性渐变， radial:径向渐变 |
| opacity  | 渐变透明度 | [Number, String] | 1 | - |
| point  | 渐变起始点 | Object | {  x1: "362.5",y1: "725",x2: "362.5",y2: "0" } |  |

```
注意：
线性渐变格式类型：{x1: "362.5", y1: "725", x2: "362.5", y2: "0"}
径向渐变格式类型：{ cx: '40%', cy: '60%', r: '50%', fx: '50%', fy: '50%' }
```


