# AI文章创作室

一个功能强大的AI文章创作工具，可以根据简单的提示词和参考资料生成高质量文章，并支持图片生成和提取。

## 功能特点

- 支持多个AI提供商API（OpenAI、Poe、DeepSeek等）
- 基于参考链接和文本生成文章
- 七种精美的文章排版主题
- 支持从参考链接提取图片和AI图片生成
- 优化的网页内容抓取功能，支持主流中文媒体平台
- 文章在线编辑和Markdown支持
- 深色模式支持
- 响应式设计，适配移动和桌面设备

## 部署说明

### 方法1: 使用GitHub Pages部署

1. Fork本仓库
2. 启用GitHub Pages（设置 -> Pages -> Source选择"main"分支）
3. 访问生成的GitHub Pages URL

### 方法2: 部署到其他静态托管服务

1. 下载本仓库所有文件
2. 上传到任何静态网站托管服务（Netlify, Vercel, Cloudflare Pages等）
3. 部署到netlify[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://yannyn3.github.io/AI-/)

### 方法3: 部署到自己的服务器

1. 下载本仓库所有文件
2. 将文件上传到您的web服务器目录
3. 确保服务器配置正确的MIME类型

## 使用方法

1. 在"API配置"标签页中设置您的API密钥
2. 切换到"内容创作"标签页，输入文章标题和提示词
3. 可选：添加参考链接和文本
4. 选择图片设置（提取或AI生成）
5. 点击"创作精彩文章"按钮
6. 文章生成后，可以在"预览排版"标签页查看、编辑和复制文章

## 解决常见问题

- **跨域问题**: 如果遇到API调用失败（CORS错误），应用会自动使用代理服务解决
- **API密钥错误**: 确保您输入了正确的API密钥，可以使用"测试API连接"功能验证
- **链接抓取失败**: 某些网站可能限制了内容抓取，尝试其他链接或直接复制文本到参考文本框
- **图片提取失败**: 有些网站可能阻止图片提取，可以尝试AI生成图片模式

## 隐私说明

- 所有API密钥仅保存在您的浏览器本地存储中
- 不会将您的API密钥或生成的内容发送到除您选择的API提供商以外的任何地方

## 支持的API提供商

- OpenAI (GPT-4/3.5, DALL·E)
- Poe API (Claude, GPT模型)
- Anthropic Claude (直接API)
- DeepSeek
- 百度文心一言
- 月之暗面

## 许可证

MIT
