/**
 * 文章生成处理功能
 */

// 文章生成主函数
async function handleArticleGeneration() {
    // 获取用户输入
    const title = document.getElementById('articleTitle').value;
    const userPrompt = document.getElementById('articlePrompt').value;
    const referenceText = document.getElementById('referenceText').value;
    const referenceLinks = document.getElementById('referenceLinks').value;
    const length = document.querySelector('input[name="articleLength"]:checked')?.value || 'medium';
    const theme = document.getElementById('articleTheme').value;
    
    // 验证必要输入
    if (!title.trim()) {
        showAlert('warning', '标题不能为空', '请输入文章标题以继续生成。');
        return;
    }
    
    // 显示生成状态
    const generationStatus = document.getElementById('generationStatus');
    const statusText = document.getElementById('statusText');
    if (generationStatus && statusText) {
        generationStatus.classList.remove('hidden');
        statusText.textContent = '正在生成文章内容...';
    }
    
    try {
        // 调用图片处理函数
        await handleImageGeneration();
        
        // 生成文章内容
        const articleContent = await generateArticle({
            title,
            userPrompt,
            referenceText, 
            referenceLinks,
            length,
            theme
        });
        
        // 更新状态文本
        if (statusText) {
            statusText.textContent = '正在渲染文章...';
        }
        
        // 显示生成的文章
        renderArticle(articleContent, theme);
        
        // 隐藏生成状态，显示输出区域
        if (generationStatus) {
            generationStatus.classList.add('hidden');
        }
        const outputSection = document.getElementById('outputSection');
        if (outputSection) {
            outputSection.classList.remove('hidden');
        }
        
        // 切换到预览标签页
        const previewTabButton = document.querySelector('[data-tab="preview"]');
        if (previewTabButton) {
            previewTabButton.click();
        }
    } catch (error) {
        console.error("文章生成出错:", error);
        
        // 显示错误提示
        showAlert(
            'error',
            '文章生成失败',
            '生成文章内容时出现错误。',
            error.message,
            [
                'API密钥可能无效或已过期',
                '网络连接问题',
                '服务器暂时不可用',
                '请检查控制台以获取详细错误信息'
            ]
        );
        
        // 隐藏生成状态
        if (generationStatus) {
            generationStatus.classList.add('hidden');
        }
    }
}

// 生成文章
async function generateArticle({ title, userPrompt, referenceText, referenceLinks, length, theme }) {
    // 获取API配置
    const apiConfig = JSON.parse(localStorage.getItem(API_CONFIG_KEY) || '{}');
    const provider = apiConfig.provider || 'openai';
    
    // 根据长度设置文字描述
    const lengthMap = {
        'short': '短文(800-1200字)',
        'medium': '中等长度文章(1500-2500字)',
        'long': '长文(3000字以上)'
    };
    const lengthText = lengthMap[length] || '中等长度文章';
    
    // 根据主题设置风格描述
    const themeMap = {
        'modern': '现代简约风格',
        'magazine': '杂志风格排版',
        'tech': '科技类文章风格',
        'business': '商务风格',
        'creative': '创意设计风格',
        'tutorial': '教程指南风格',
        'entertainment': '娱乐风格',
        'academic': '学术论文风格',
        'media': '自媒体风格'
    };
    const themeDescription = themeMap[theme] || '现代简约风格';
    
    // 构建提示词
    const prompt = `请创作一篇高质量的${lengthText}文章，标题是"${title}"。

${userPrompt ? `以下是创作要求：${userPrompt}` : ''}

${referenceText ? `参考资料：\n${referenceText}\n\n请基于上述参考资料，但不要直接复制。` : ''}

要求：
1. 文章结构清晰，包含引言、正文和结论
2. 使用Markdown格式，包括适当的标题层级、强调和列表
3. 文章语言自然流畅，内容有深度和见解
4. 避免空洞的废话和重复内容
5. 根据主题提供有价值的信息或观点
6. 使用准确的数据和事实支持论点（如适用）
7. 适合${themeDescription}的风格呈现

请直接输出完整的文章内容，不要包含额外的解释或注释。`;
    
    try {
        // 根据不同API提供商调用不同的API
        if (provider === 'openai') {
            return await callOpenAIForArticle(prompt, apiConfig.openai);
        } 
        else if (provider === 'anthropic') {
            return await callAnthropicForArticle(prompt, apiConfig.anthropic);
        }
        else if (provider === 'deepseek') {
            return await callDeepSeekForArticle(prompt, apiConfig.deepseek);
        }
        else if (provider === 'poe') {
            return await callPoeForArticle(prompt, apiConfig.poe);
        }
        else if (provider === 'baidu') {
            return await callBaiduForArticle(prompt, apiConfig.baidu);
        }
        else if (provider === 'moonshot') {
            return await callMoonshotForArticle(prompt, apiConfig.moonshot);
        }
        else {
            throw new Error(`不支持的API提供商: ${provider}`);
        }
    } catch (error) {
        console.error("生成文章时出错:", error);
        // 尝试使用模拟响应
        console.log("API调用失败，使用模拟响应");
        const result = await simulateApiResponse(provider, 'generate_article', { title, length, theme });
        return result.content;
    }
}

// 调用OpenAI API生成文章
async function callOpenAIForArticle(prompt, config) {
    if (!config?.apiKey) {
        throw new Error("未配置OpenAI API密钥");
    }
    
    // 确定API端点
    let apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    const apiProxy = config.apiProxy;
    
    if (apiProxy) {
        console.log("使用用户提供的OpenAI API代理:", apiProxy);
        apiEndpoint = apiProxy;
    } else {
        apiEndpoint = addCorsProxy(apiEndpoint);
    }
    
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: config.textModel || 'gpt-4o',
            messages: [
                { role: "system", content: "You are a professional writer and content creator. Your task is to create high-quality articles in Markdown format. Focus on substance, clear structure, and engaging style." },
                { role: "user", content: prompt }
            ],
            temperature: config.temperature || 0.7,
            max_tokens: config.maxTokens || 4000
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API错误: ${errorData.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    return result.choices[0].message.content;
}

// 调用Anthropic API生成文章
async function callAnthropicForArticle(prompt, config) {
    if (!config?.apiKey) {
        throw new Error("未配置Anthropic API密钥");
    }
    
    const apiEndpoint = addCorsProxy('https://api.anthropic.com/v1/messages');
    
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: config.model || 'claude-3-sonnet-20240229',
            max_tokens: config.maxTokens || 4000,
            temperature: config.temperature || 0.7,
            messages: [
                { role: "user", content: prompt }
            ]
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Anthropic API错误: ${errorData.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    return result.content[0].text;
}

// 调用DeepSeek API生成文章
async function callDeepSeekForArticle(prompt, config) {
    if (!config?.apiKey) {
        throw new Error("未配置DeepSeek API密钥");
    }
    
    // 确定API端点
    let apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
    const apiProxy = config.apiProxy;
    
    if (apiProxy) {
        console.log("使用用户提供的DeepSeek API代理:", apiProxy);
        apiEndpoint = apiProxy;
    } else {
        apiEndpoint = addCorsProxy(apiEndpoint);
    }
    
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: config.model || 'deepseek-chat',
            messages: [
                { role: "system", content: "你是一位专业的文章创作者，善于创作结构清晰、内容专业、语言流畅的高质量文章。请用Markdown格式输出。" },
                { role: "user", content: prompt }
            ],
            temperature: config.temperature || 0.7,
            max_tokens: config.maxTokens || 4000
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API错误: ${errorData.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    return result.choices[0].message.content;
}

// 调用百度文心一言API生成文章
async function callBaiduForArticle(prompt, config) {
    if (!config?.apiKey || !config?.secretKey) {
        throw new Error("未配置百度文心一言API密钥");
    }
    
    try {
        // 获取访问令牌
        const tokenUrl = addCorsProxy(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${config.apiKey}&client_secret=${config.secretKey}`);
        
        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json().catch(() => ({}));
            throw new Error(`百度API获取Token错误: ${errorData.error_description || tokenResponse.statusText}`);
        }
        
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        
        if (!accessToken) {
            throw new Error("未能获取有效的百度API访问令牌");
        }
        
        // 使用令牌调用文心一言API
        const apiUrl = addCorsProxy(`https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${accessToken}`);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: config.model || 'ernie-bot-4',
                messages: [
                    { role: "system", content: "你是一位专业的文章创作者，善于创作结构清晰、内容专业、语言流畅的高质量文章。请用Markdown格式输出。" },
                    { role: "user", content: prompt }
                ],
                temperature: config.temperature || 0.7
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`百度API错误: ${errorData.error_msg || response.statusText}`);
        }
        
        const result = await response.json();
        return result.result;
    } catch (error) {
        console.error('调用百度API出错:', error);
        throw error;
    }
}

// 调用Moonshot API生成文章
async function callMoonshotForArticle(prompt, config) {
    if (!config?.apiKey) {
        throw new Error("未配置月之暗面API密钥");
    }
    
    const apiEndpoint = addCorsProxy('https://api.moonshot.cn/v1/chat/completions');
    
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: config.model || 'moonshot-v1-8k',
            messages: [
                { role: "system", content: "你是一位专业的文章创作者，善于创作结构清晰、内容专业、语言流畅的高质量文章。请用Markdown格式输出。" },
                { role: "user", content: prompt }
            ],
            temperature: config.temperature || 0.7
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`月之暗面API错误: ${errorData.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    return result.choices[0].message.content;
}

// 调用Poe API生成文章
async function callPoeForArticle(prompt, config) {
    if (!config?.apiKey) {
        throw new Error("未配置Poe API密钥");
    }
    
    const apiEndpoint = addCorsProxy('https://api.poe.com/chat/completions');
    
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: config.textModel || 'Claude-3.7-Sonnet',
            messages: [
                { role: "system", content: "你是一位专业的文章创作者，善于创作结构清晰、内容专业、语言流畅的高质量文章。请用Markdown格式输出。" },
                { role: "user", content: prompt }
            ]
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Poe API错误: ${errorData.error?.message || response.statusText}`);
    }
    
    const result = await response.json();
    return result.choices[0].message.content;
}

// 渲染文章
function renderArticle(content, theme) {
    const articleOutput = document.getElementById('articleOutput');
    if (!articleOutput) return;
    
    // 确保marked和DOMPurify已加载
    if (typeof marked !== 'object' || typeof DOMPurify !== 'object') {
        console.error('marked或DOMPurify未加载，无法安全渲染Markdown');
        articleOutput.innerHTML = '<div class="text-red-500">错误：缺少必要的渲染库</div>';
        return;
    }
    
    // 配置marked选项，增强渲染效果
    const renderer = new marked.Renderer();
    
    // 增强链接渲染
    renderer.link = function(href, title, text) {
        return `<a href="${href}" title="${title || ''}" target="_blank" class="text-apple-blue dark:text-apple-darkblue hover:underline">${text}</a>`;
    };
    
    // 增强图片渲染
    renderer.image = function(href, title, text) {
        return `<img src="${href}" alt="${text}" title="${title || ''}" class="mx-auto my-4 max-w-full h-auto rounded-lg shadow-md">`;
    };
    
    // 增强列表渲染
    renderer.listitem = function(text) {
        return `<li class="my-1">${text}</li>`;
    };
    
    // 配置marked
    marked.setOptions({
        renderer: renderer,
        headerIds: true,
        gfm: true,
        breaks: true,
        pedantic: false,
        smartLists: true,
        smartypants: true
    });
    
    // 清除现有内容
    articleOutput.innerHTML = '';
    
    // 设置主题类
    articleOutput.className = '';
    articleOutput.classList.add(
        `theme-${theme}`, 
        'prose', 'dark:prose-invert', 'max-w-none', 
        'border', 'border-gray-100', 'dark:border-gray-800', 
        'p-6', 'rounded-xl', 'bg-white', 'dark:bg-gray-950', 
        'overflow-auto'
    );
    
    // 渲染Markdown内容
    articleOutput.innerHTML = DOMPurify.sanitize(marked.parse(content));
}
