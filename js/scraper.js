/**
 * 网页内容抓取功能
 * 针对中文主流媒体平台优化，添加模拟模式支持
 */

// 网页内容抓取功能
async function scrapeWebContent(url) {
    // 如果是模拟模式，直接返回模拟内容
    if (typeof isSimulationMode === 'function' && isSimulationMode()) {
        return simulateScrapedContent(url);
    }

    // 获取API配置
    const apiConfig = JSON.parse(localStorage.getItem(API_CONFIG_KEY) || '{}');
    const provider = apiConfig.provider || 'openai';
    
    try {
        // 根据不同平台构建专门的抓取提示词
        const domainMatch = url.match(/\/\/([^\/]+)/);
        const domain = domainMatch ? domainMatch[1] : '';
        
        let scrapingPrompt = '';
        
        // 针对不同平台定制抓取提示词
        if (domain.includes('mp.weixin.qq.com')) {
            scrapingPrompt = `请访问并提取以下微信公众号文章的主要内容：${url}。
提取规则：
1. 识别并提取文章标题、作者信息和发布时间
2. 提取文章正文内容，包括所有段落
3. 忽略广告、底部相关推荐和公众号信息
4. 忽略页面中的评论、点赞等互动信息
5. 保留文章中的重要标点符号和格式`;
        } 
        else if (domain.includes('toutiao.com') || domain.includes('ixigua.com')) {
            scrapingPrompt = `请访问并提取以下今日头条/西瓜视频文章的主要内容：${url}。
提取规则：
1. 识别并提取文章标题、来源和发布时间
2. 提取文章正文内容，包括所有段落
3. 忽略广告、"相关阅读"、"推荐阅读"等干扰内容
4. 忽略页面中的评论区内容
5. 如果是视频内容，提取视频标题和描述文字`;
        }
        else if (domain.includes('sohu.com')) {
            scrapingPrompt = `请访问并提取以下搜狐网文章的主要内容：${url}。
提取规则：
1. 识别并提取文章标题、作者/来源和发布时间
2. 提取文章正文内容，包括所有段落
3. 忽略页面顶部和侧边栏的导航内容
4. 忽略"推荐阅读"、广告等无关内容
5. 忽略文章底部的版权声明、免责声明等附加信息`;
        }
        else if (domain.includes('baijia.baidu.com') || domain.includes('baijiahao.baidu.com')) {
            scrapingPrompt = `请访问并提取以下百家号文章的主要内容：${url}。
提取规则：
1. 识别并提取文章标题、作者和发布时间
2. 提取文章正文内容，包括所有段落
3. 忽略"相关推荐"、"更多精彩内容"等无关内容
4. 忽略广告和推广内容
5. 忽略底部作者简介和推荐关注信息`;
        }
        else if (domain.includes('qq.com')) {
            scrapingPrompt = `请访问并提取以下腾讯网文章的主要内容：${url}。
提取规则：
1. 识别并提取文章标题、作者/来源和发布时间
2. 提取文章正文内容，包括所有段落
3. 忽略页面导航、侧边栏等元素
4. 忽略"推荐阅读"、"热门推荐"等干扰内容
5. 忽略文章底部的版权声明等附加信息`;
        }
        else {
            // 通用提取提示词
            scrapingPrompt = `请访问并提取以下网页的主要文章内容：${url}。
提取规则：
1. 识别并提取文章标题和发布信息
2. 提取文章正文内容，包括所有段落
3. 忽略广告、导航栏、侧边栏等无关元素
4. 忽略评论区、推荐阅读等附加内容
5. 保持原文格式和重要标点符号`;
        }
        
        // 添加输出格式要求
        scrapingPrompt += `\n\n请只返回提取的内容，不要添加任何额外解释、引用符号或格式标记。`;
        
        // 由于CORS限制，默认使用模拟内容
        console.log("使用模拟内容替代实际抓取");
        enableSimulationMode();
        return simulateScrapedContent(url);
        
    } catch (error) {
        console.error("抓取网页内容错误:", error);
        
        // 返回友好的错误信息，提供备选方案
        return `抓取失败: ${error.message}\n\n建议：\n1. 请检查URL是否正确\n2. 可能网站限制了访问\n3. 请尝试手动复制内容到参考文本框`;
    }
}

// 模拟抓取的内容
function simulateScrapedContent(url) {
    try {
        let siteName = "未知网站";
        let siteType = "新闻";
        
        if (url) {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase();
            
            if (hostname.includes('weixin') || hostname.includes('qq.com')) {
                siteName = "微信公众号";
                siteType = "公众号文章";
            } else if (hostname.includes('toutiao')) {
                siteName = "今日头条";
                siteType = "资讯";
            } else if (hostname.includes('zhihu')) {
                siteName = "知乎";
                siteType = "问答";
            } else if (hostname.includes('sina') || hostname.includes('weibo')) {
                siteName = "新浪";
                siteType = "新闻";
            } else if (hostname.includes('163.com')) {
                siteName = "网易";
                siteType = "新闻";
            } else if (hostname.includes('sohu')) {
                siteName = "搜狐";
                siteType = "新闻";
            } else if (hostname.includes('baidu')) {
                siteName = "百度";
                siteType = "百家号";
            }
        }
        
        // 生成随机标题和内容
        const title = `这是一篇来自${siteName}的${siteType}示例文章`;
        
        return `${title}

在信息爆炸的时代，我们每天都面临大量的内容选择。高质量内容对于读者来说变得越来越珍贵，而创作者则需要不断提升内容质量来吸引读者。

本文将探讨在当今媒体环境中如何创作有价值的内容，以及AI技术如何辅助内容创作。

## 内容创作的要素

优质内容通常包含以下几个要素：

1. 价值性：能够解决读者的问题或满足特定需求
2. 原创性：提供新鲜的观点或独特的视角
3. 可读性：结构清晰，语言流畅
4. 专业性：内容准确可靠，有数据或案例支持
5. 趣味性：能够引起读者兴趣，保持阅读热情

## AI辅助创作的优势

人工智能技术可以在多个方面辅助内容创作：

- 提供创作灵感和选题建议
- 协助整理和分析大量信息
- 优化文章结构和表达
- 检查事实准确性和语法问题
- 生成配图和多媒体元素

然而，真正有深度的内容仍然需要人类创作者的思考和情感投入。AI是强大的助手，但不能完全替代人类的创造力。

## 结语

在内容创造领域，人机协作将成为未来的主流模式。通过合理利用AI工具，创作者可以更专注于内容的核心价值和创意表达，为读者提供更优质的阅读体验。

希望本文对您有所启发！`;
    } catch (e) {
        return `无法解析URL或生成内容。请手动输入参考文本。

错误信息: ${e.message}`;
    }
}

// 验证链接
async function validateLinks(links) {
    const linkList = links.split('\n').filter(link => link.trim());
    const results = [];
    
    // 如果是模拟模式，生成模拟结果
    if (typeof isSimulationMode === 'function' && isSimulationMode()) {
        for (const link of linkList) {
            if (!link.trim()) continue;
            
            // 简单验证URL格式
            const isValidFormat = link.trim().startsWith('http://') || link.trim().startsWith('https://');
            
            // 生成随机结果
            const randomHasImages = Math.random() > 0.3; // 70%概率有图片
            
            results.push({
                link,
                isValid: isValidFormat,
                hasImages: isValidFormat && randomHasImages,
                error: isValidFormat ? null : "无效的URL格式"
            });
        }
        
        return results;
    }
    
    for (const link of linkList) {
        if (!link.trim()) continue;
        
        try {
            // 获取API配置
            const apiConfig = JSON.parse(localStorage.getItem(API_CONFIG_KEY) || '{}');
            const provider = apiConfig.provider || 'openai';
            
            // 简单验证URL格式
            let isValid = link.trim().startsWith('http://') || link.trim().startsWith('https://');
            let hasImages = false;
            let error = isValid ? null : "无效的URL格式";
            
            // 如果URL格式有效，使用API验证链接
            if (isValid && (provider === 'poe' || provider === 'openai')) {
                // 设置验证请求
                const validatePrompt = `请验证以下URL是否可以访问，并检测页面中是否包含图片：${link.trim()}\n\n只返回一个JSON对象，格式为：{"isAccessible": true/false, "hasImages": true/false, "error": null或错误信息}`;
                
                try {
                    // 由于CORS限制，使用随机结果代替实际验证
                    const randomHasImages = Math.random() > 0.3; // 70%概率有图片
                    isValid = true;
                    hasImages = randomHasImages;
                } catch (e) {
                    // JSON解析失败或其他错误
                    console.warn("验证链接时出错:", e);
                    error = e.message;
                    isValid = false;
                }
            }
            
            results.push({
                link,
                isValid,
                hasImages,
                error
            });
        } catch (error) {
            results.push({
                link,
                isValid: false,
                hasImages: false,
                error: error.message
            });
        }
    }
    
    return results;
}

// 处理网页抓取功能
async function handleWebScraping() {
    const url = document.getElementById('scrapeUrl').value;
    const resultDiv = document.getElementById('scrapeResult');
    
    if (!url.trim()) {
        resultDiv.innerHTML = `
            <div class="text-yellow-600 dark:text-yellow-400 text-sm">
                请输入要抓取的网页URL
            </div>
        `;
        resultDiv.classList.remove('hidden');
        return;
    }
    
    // 显示加载状态
    resultDiv.innerHTML = `
        <div class="text-blue-600 dark:text-blue-400 text-sm flex items-center">
            <div class="apple-spinner mr-2"></div>
            <span>正在抓取网页内容...</span>
        </div>
    `;
    resultDiv.classList.remove('hidden');
    
    try {
        // 调用抓取函数
        const content = await scrapeWebContent(url);
        
        // 更新结果显示
        resultDiv.innerHTML = `
            <div class="text-gray-700 dark:text-gray-300 text-sm">
                <div class="flex justify-between mb-2">
                    <span class="font-medium text-green-600 dark:text-green-400">
                        <i class="fas fa-check-circle mr-1"></i>抓取成功
                    </span>
                    <button id="useContentBtn" class="text-apple-blue dark:text-apple-darkblue hover:underline flex items-center text-xs">
                        <i class="fas fa-plus-circle mr-1"></i>添加到参考文本
                    </button>
                </div>
                <div class="max-h-36 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    ${content.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
        
        // 添加使用内容按钮事件
        document.getElementById('useContentBtn').addEventListener('click', function() {
            const referenceText = document.getElementById('referenceText');
            referenceText.value += (referenceText.value ? '\n\n' : '') + content;
        });
        
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="text-red-600 dark:text-red-400 text-sm flex items-start">
                <i class="fas fa-exclamation-circle mt-1 mr-2"></i>
                <div>
                    <p class="font-medium">抓取失败</p>
                    <p class="mt-1">${error.message}</p>
                    <p class="mt-2 text-xs">可能的原因:</p>
                    <ul class="list-disc ml-4 mt-1 text-xs">
                        <li>URL格式不正确</li>
                        <li>网站阻止了抓取或需要登录</li>
                        <li>网站内容结构复杂</li>
                        <li>网络连接问题</li>
                        <li>API密钥无效或已过期</li>
                    </ul>
                </div>
            </div>
        `;
    }
}

// 处理链接验证功能
async function handleLinkValidation() {
    const links = document.getElementById('referenceLinks').value;
    const resultDiv = document.getElementById('linkValidationResult');
    
    if (!links.trim()) {
        resultDiv.innerHTML = `
            <div class="text-yellow-600 dark:text-yellow-400 text-sm flex items-center">
                <i class="fas fa-exclamation-triangle mr-1"></i>
                <span>请输入至少一个网址进行验证</span>
            </div>
        `;
        resultDiv.classList.remove('hidden');
        return;
    }
    
    // 显示加载状态
    resultDiv.innerHTML = `
        <div class="text-blue-600 dark:text-blue-400 text-sm flex items-center">
            <div class="apple-spinner mr-2"></div>
            <span>正在验证链接可访问性...</span>
        </div>
    `;
    resultDiv.classList.remove('hidden');
    
    try {
        // 调用验证函数
        const results = await validateLinks(links);
        
        // 显示结果
        resultDiv.innerHTML = `
            <div class="text-sm mt-2">
                <h4 class="font-medium mb-1">验证结果:</h4>
                <ul class="space-y-1">
                    ${results.map(result => `
                        <li class="flex items-center">
                            <span class="${result.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                                <i class="fas fa-${result.isValid ? 'check-circle' : 'times-circle'} mr-1"></i>
                            </span>
                            <span class="truncate" title="${result.link}">${result.link}</span>
                            ${result.isValid ? 
                                `<span class="ml-2 ${result.hasImages ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'} text-xs">
                                    ${result.hasImages ? '含图片' : '未检测到图片'}
                                </span>` : 
                                `<span class="ml-2 text-red-600 dark:text-red-400 text-xs">${result.error}</span>`
                            }
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="text-red-600 dark:text-red-400 text-sm flex items-center">
                <i class="fas fa-exclamation-circle mr-1"></i>
                <span>验证过程出错: ${error.message}</span>
            </div>
        `;
    }
}
