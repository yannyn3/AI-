/**
 * 文章生成相关功能
 */

// 生成文章 - 实际API实现
async function generateArticle(title, prompt, length, referenceLinks, referenceText) {
    // 获取API配置
    const apiConfig = JSON.parse(localStorage.getItem(API_CONFIG_KEY) || '{}');
    const provider = apiConfig.provider || 'openai';
    
    // 构建提示词
    let fullPrompt = `我需要你帮我写一篇专业的文章`;
    
    if (title) {
        fullPrompt += `，标题是：${title}`;
    }
    
    fullPrompt += `\n\n我希望这篇文章是`;
    switch (length) {
        case 'short': fullPrompt += '短文（800-1200字）'; break;
        case 'medium': fullPrompt += '中等长度（1500-2500字）'; break;
        case 'long': fullPrompt += '长文（3000字以上）'; break;
    }
    
    if (prompt) {
        fullPrompt += `\n\n文章需求：${prompt}`;
    }
    
    if (referenceLinks || referenceText) {
        fullPrompt += '\n\n以下是参考资料：\n';
        
        if (referenceLinks) {
            fullPrompt += `\n参考链接：\n${referenceLinks}\n`;
        }
        
        if (referenceText) {
            fullPrompt += `\n参考文本：\n${referenceText}\n`;
        }
    }
    
    fullPrompt += `\n请按照以下要求输出：
1. 使用Markdown格式
2. 正文内容包含引人入胜的开头、清晰的论点和总结
3. 加入小标题和分段，使文章结构清晰
4. 适当加入引用、列表等元素增加可读性
5. 不需要顶部标题，我会单独处理`;
    
    try {
        if (provider === 'poe') {
            // Poe API实现
            const poeKey = apiConfig.poe?.apiKey;
            if (!poeKey) {
                throw new Error("未配置Poe API密钥");
            }
            
            const model = apiConfig.poe?.textModel || 'Claude-3.7-Sonnet';
            
            // 使用代理服务来避免CORS问题
            const proxyUrl = addCorsProxy('https://api.poe.com/chat/completions');
            
            // 调用Poe API
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${poeKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "user", content: fullPrompt }
                    ]
                })
            });
            
            const data = await handleApiResponse(response);
            const content = data.choices?.[0]?.message?.content || '';
            
            // 添加标题，如果还没有标题且用户提供了标题
            if (title && !content.startsWith('# ')) {
                return `# ${title}\n\n${content}`;
            }
            
            return content;
        }
        else if (provider === 'openai') {
            // OpenAI API实现
            const openaiKey = apiConfig.openai?.apiKey;
            if (!openaiKey) {
                throw new Error("未配置OpenAI API密钥");
            }
            
            const model = apiConfig.openai?.textModel || 'gpt-4o';
            const temperature = apiConfig.openai?.temperature || 0.7;
            const maxTokens = apiConfig.openai?.maxTokens || 4000;
            
            // 确定API端点
            let apiEndpoint = 'https://api.openai.com/v1/chat/completions';
            const apiProxy = apiConfig.openai?.apiProxy;
            
            if (apiProxy) {
                apiEndpoint = apiProxy;
            } else {
                // 使用CORS代理
                apiEndpoint = addCorsProxy(apiEndpoint);
            }
            
            // 调用OpenAI API
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "user", content: fullPrompt }
                    ],
                    temperature: temperature,
                    max_tokens: maxTokens
                })
            });
            
            const data = await handleApiResponse(response);
            const content = data.choices?.[0]?.message?.content || '';
            
            // 添加标题，如果还没有标题且用户提供了标题
            if (title && !content.startsWith('# ')) {
                return `# ${title}\n\n${content}`;
            }
            
            return content;
        }
        // 可以添加其他API提供商的实现...
        else {
            throw new Error(`不支持的API提供商: ${provider}`);
        }
    } catch (error) {
        console.error("生成文章错误:", error);
        throw error;
    }
}

// 生成文章主函数
async function handleArticleGeneration() {
    const generationStatus = document.getElementById('generationStatus');
    const statusText = document.getElementById('statusText');
    const outputSection = document.getElementById('outputSection');
    const generateBtn = document.getElementById('generateBtn');
    
    // 切换到预览标签页
    document.querySelector('[data-tab="preview"]').click();
    
    // 显示生成状态
    generationStatus.classList.remove('hidden');
    statusText.textContent = '正在收集创作素材...';
    outputSection.classList.add('hidden');
    
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<div class="apple-spinner mr-2"></div>创作中...';
    
    try {
        // 收集表单数据
        const title = document.getElementById('articleTitle').value;
        const articlePrompt = document.getElementById('articlePrompt').value;
        const referenceLinks = document.getElementById('referenceLinks').value;
        const referenceText = document.getElementById('referenceText').value;
        const articleLength = document.querySelector('input[name="articleLength"]:checked').value;
        const articleTheme = document.getElementById('articleTheme').value;
        
        // 加载API配置
        const apiConfig = JSON.parse(localStorage.getItem(API_CONFIG_KEY) || '{}');
        const provider = apiConfig.provider || 'openai';
        
        // 验证API配置
        switch (provider) {
            case 'openai':
                if (!apiConfig.openai?.apiKey) {
                    throw new Error("请先配置OpenAI API密钥");
                }
                break;
            case 'poe':
                if (!apiConfig.poe?.apiKey) {
                    throw new Error("请先配置Poe API密钥");
                }
                break;
            // 其他API提供商的验证...
            default:
                throw new Error(`尚未实现对${provider}的支持`);
        }
        
        // 使用真实API生成文章
        statusText.textContent = '正在创作文章内容...';
        
        const articleContent = await generateArticle(title, articlePrompt, articleLength, referenceLinks, referenceText);
        
        // 显示文章内容
        const articleOutput = document.getElementById('articleOutput');
        articleOutput.innerHTML = DOMPurify.sanitize(marked.parse(articleContent));
        
        // 应用选中的主题
        articleOutput.className = '';
        articleOutput.classList.add(
            `theme-${articleTheme}`, 
            'prose', 'dark:prose-invert', 'max-w-none', 
            'border', 'border-gray-100', 'dark:border-gray-800', 
            'p-6', 'rounded-xl', 'bg-white', 'dark:bg-gray-950', 
            'overflow-auto'
        );
        
        outputSection.classList.remove('hidden');
        
        // 处理图片生成或提取
        await handleImageGeneration();
        
        generationStatus.classList.add('hidden');
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>创作精彩文章';
        
        // 滚动到输出部分
        outputSection.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        generationStatus.classList.add('hidden');
        
        showAlert(
            'error',
            '文章生成失败',
            error.message,
            error.stack,
            [
                'API密钥无效或已过期',
                'API服务暂时不可用',
                '网络连接问题',
                '提示词太长或包含不当内容',
                '请检查参考资料是否过多'
            ]
        );
        
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>创作精彩文章';
    }
}
