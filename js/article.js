// 生成文章 - 增强版
async function generateArticle(title, prompt, length, referenceLinks, referenceText) {
    console.log('开始生成文章:', {title, prompt, length});
    
    // 如果是模拟模式，返回模拟响应
    if (isSimulationMode()) {
        return (await simulateApiResponse('当前提供商', 'generate_article', {
            title, 
            prompt, 
            length, 
            theme: document.getElementById('articleTheme')?.value || 'modern'
        })).content;
    }
    
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
        console.log(`使用${provider}生成文章...`);
        
        if (provider === 'poe') {
            // Poe API实现
            const poeKey = apiConfig.poe?.apiKey;
            if (!poeKey) {
                throw new Error("未配置Poe API密钥");
            }
            
            const model = apiConfig.poe?.textModel || 'Claude-3.7-Sonnet';
            
            // 使用代理服务来避免CORS问题
            const proxyUrl = addCorsProxy('https://api.poe.com/chat/completions');
            console.log(`使用Poe API端点: ${proxyUrl}`);
            
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
            
            console.log('Poe响应状态:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Poe API响应错误:', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(`Poe API错误: ${errorData.error?.message || response.statusText || '未知错误'}`);
                } catch (e) {
                    if (e instanceof SyntaxError) {
                        throw new Error(`Poe API错误: 状态码 ${response.status} (${response.statusText})`);
                    }
                    throw e;
                }
            }
            
            const data = await response.json();
            console.log('Poe API响应数据:', data);
            
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
                console.log("使用用户提供的OpenAI API代理:", apiProxy);
                apiEndpoint = apiProxy;
            } else {
                // 使用CORS代理
                apiEndpoint = addCorsProxy(apiEndpoint);
            }
            
            console.log(`使用OpenAI API端点: ${apiEndpoint}`);
            
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
            
            console.log('OpenAI响应状态:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('OpenAI API响应错误:', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(`OpenAI API错误: ${errorData.error?.message || response.statusText || '未知错误'}`);
                } catch (e) {
                    if (e instanceof SyntaxError) {
                        throw new Error(`OpenAI API错误: 状态码 ${response.status} (${response.statusText})`);
                    }
                    throw e;
                }
            }
            
            const data = await response.json();
            console.log('OpenAI API响应数据:', data);
            
            const content = data.choices?.[0]?.message?.content || '';
            
            // 添加标题，如果还没有标题且用户提供了标题
            if (title && !content.startsWith('# ')) {
                return `# ${title}\n\n${content}`;
            }
            
            return content;
        }
        else if (provider === 'deepseek') {
            // DeepSeek API实现
            const deepseekKey = apiConfig.deepseek?.apiKey;
            if (!deepseekKey) {
                throw new Error("未配置DeepSeek API密钥");
            }
            
            const model = apiConfig.deepseek?.model || 'deepseek-chat';
            const temperature = apiConfig.deepseek?.temperature || 0.7;
            const maxTokens = apiConfig.deepseek?.maxTokens || 4000;
            
            // 确定API端点
            let apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
            const apiProxy = apiConfig.deepseek?.apiProxy;
            
            if (apiProxy) {
                console.log("使用用户提供的DeepSeek API代理:", apiProxy);
                apiEndpoint = apiProxy;
            } else {
                // 使用CORS代理
                apiEndpoint = addCorsProxy(apiEndpoint);
            }
            
            console.log(`使用DeepSeek API端点: ${apiEndpoint}`);
            
            // 调用DeepSeek API
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${deepseekKey}`
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
            
            console.log('DeepSeek响应状态:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('DeepSeek API响应错误:', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(`DeepSeek API错误: ${errorData.error?.message || response.statusText || '未知错误'}`);
                } catch (e) {
                    if (e instanceof SyntaxError) {
                        throw new Error(`DeepSeek API错误: 状态码 ${response.status} (${response.statusText})`);
                    }
                    throw e;
                }
            }
            
            const data = await response.json();
            console.log('DeepSeek API响应数据:', data);
            
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
        
        // 如果API调用失败且不是模拟模式，提示用户切换到模拟模式
        if (!isSimulationMode()) {
            const useSimulation = confirm(`生成文章时出错: ${error.message}\n\n是否启用模拟模式以演示功能？`);
            if (useSimulation) {
                enableSimulationMode();
                addSimulationModeIndicator();
                return (await simulateApiResponse('当前提供商', 'generate_article', {
                    title, 
                    prompt, 
                    length, 
                    theme: document.getElementById('articleTheme')?.value || 'modern'
                })).content;
            }
        }
        
        throw error;
    }
}
