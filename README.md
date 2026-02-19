# My-NBA-Schedule

一个美观、现代化的 NBA 赛程网站，使用 Vercel Serverless API 代理 ESPN 数据，支持多语言、深色模式和时区自动适配。

## ✨ 功能特性

- 📅 **日历选择**：直观的日历组件，轻松切换日期查看赛程
- ⏰ **时区自适应**：比赛时间自动转换为用户本地时区显示
- 🏆 **实时排名**：东西部球队排名实时更新
- 🌙 **深色模式**：支持明暗主题切换
- 🌍 **多语言**：中文/英文双语支持
- 📱 **响应式设计**：完美适配桌面端和移动端
- ⚡ **缓存优化**：使用 Vercel CDN 缓存，提高访问速度
- 🎨 **精美UI**：基于 Tailwind CSS，现代化设计风格

## 🚀 技术架构

### 前端技术栈
- **HTML5**：语义化标记
- **Tailwind CSS**：原子化 CSS 框架
- **Font Awesome**：图标库
- **Vanilla JavaScript**：原生 JS，无额外依赖

### 后端技术栈
- **Vercel Serverless Functions**：无服务器 API
- **ESPN API**：数据源
- **Cache-Control**：5分钟缓存 + 后台重新验证

### 项目结构
```
My-NBA-Schedule/
├── api/
│   ├── schedule.js      # 赛程数据代理接口
│   └── standings.js     # 排名数据代理接口
├── app.js               # 前端主逻辑
├── index.html           # 主页面
└── README.md
```

## 📡 API 接口

### /api/schedule
获取指定日期的 NBA 赛程数据

**请求参数：**
- `date` (必填): YYYYMMDD 格式的日期

**响应示例：**
```json
{
  "events": [...]
}
```

### /api/standings
获取 NBA 东西部排名数据

**请求参数：** 无

**响应示例：**
```json
{
  "children": [...]
}
```

## 🎯 核心功能详解

### 时区处理逻辑
为了解决全球用户的时区问题，采用以下策略：

1. **纯日期处理**：所有日期操作使用 UTC 时间，避免本地时区干扰
2. **扩展请求范围**：请求±1天的比赛数据，确保跨时区比赛被正确获取
3. **UTC日期匹配**：用比赛时间的 UTC 日期匹配用户选择的日期
4. **本地时间显示**：比赛时间使用 `toLocaleTimeString()` 转换为用户本地时区

### 日期工具函数
```javascript
// 解析日期字符串为 UTC 日期对象
parseDate('2026-02-20')

// 格式化 UTC 日期为字符串
formatDateStr(date)

// 格式化日期为 API 所需的 YYYYMMDD
formatDateForAPI(date)
```

## 🛠️ 本地开发

### 前置条件
- Node.js (推荐 18+)
- Vercel CLI (可选，用于本地测试 Serverless Functions)

### 运行项目
```bash
# 克隆项目
git clone <repository-url>
cd My-NBA-Schedule

# 启动本地服务器（使用 Python）
python -m http.server 8000

# 或者使用 Node.js
npx serve .

# 访问 http://localhost:8000
```

### 本地测试 Serverless API
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 本地开发模式
vercel dev
```

## 🚀 部署

### Vercel 部署（推荐）
1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 在 Vercel 中导入项目
3. 点击部署，Vercel 会自动识别并部署

**注意：** 由于使用 Vercel Serverless Functions，无需额外配置。

### 手动部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署到生产环境
vercel --prod
```

## 🔧 配置说明

### Tailwind 主题配置
项目自定义了 NBA 主题色：
```javascript
nba: {
  primary: '#17408B',   // NBA 官方蓝色
  secondary: '#C8102E', // NBA 官方红色
  accent: '#FFD700'      // 金色强调色
}
```

### 缓存配置
API 响应设置了 5 分钟缓存：
```javascript
res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
```

## 📄 数据来源
- 赛程和排名数据来自 [ESPN API](https://site.api.espn.com)
- 球队 Logo 来自 [NBA 官网](https://cdn.nba.com)

## 🤝 贡献
欢迎提交 Issue 和 Pull Request！

## 📝 许可证
MIT License

---

**享受 NBA 赛程！** 🏀
