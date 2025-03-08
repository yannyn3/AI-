/**
 * API配置和调用功能
 */

// 加载保存的API配置
function loadApiConfig() {
    const savedConfig = localStorage.getItem(API_CONFIG_KEY);
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            
            // 设置选中的API提供商
            const providerRadio = document.querySelector(`input[name="apiProvider"][value="${config.provider}"]`);
            if (providerRadio) {
                providerRadio.checked = true;
                // 手动设置单选按钮的样式
                updateProviderRadioStyle(providerRadio);
                // 触发提供商切换事件
                toggleApiSettings(config.provider);
            }
            
            // OpenAI配置
            if (config.openai) {
                document.getElementById('openai-api-key').value = config.openai.apiKey || '';
                document.getElementById('openai-text-model').value = config.openai.textModel || 'gpt-4o';
                document.getElementById('openai-image-model').value = config.openai.imageModel || 'dall-e-3';
                document.getElementById('openai-temperature').value = config.openai.temperature || 0.7;
                document.getElementById('openai-max-tokens').value = config.openai.maxTokens || 4000;
                document.getElementById('openai-api-proxy').value = config.openai.apiProxy || '';
            }
            
            // Poe配置
            if (config.poe) {
                document.getElementById('poe-api-key').value = config.poe.apiKey || '';
                document.getElementById('poe-text-model').value = config.poe.textModel || 'Claude-3.7-Sonnet';
                document.getElementById('poe-image-model').value = config.poe.imageModel || 'FLUX-pro-1.1';
            }
            
            // DeepSeek配置
            if (config.deepseek) {
                document.getElementById('deepseek-api-key').value = config.deepseek.apiKey || '';
                document.getElementById('deepseek-model').value = config.deepseek.model || 'deepseek-chat';
                document.getElementById('deepseek-temperature').value = config.deepseek.temperature || 0.7;
                document.getElementById('deepseek-max-tokens').value = config.deepseek.maxTokens || 4000;
                document.getElementById('deepseek-api-proxy').value = config.deepseek.apiProxy || '';
            }
            
            // Anthropic配置
            if (config.anthropic) {
                document.getElementById('anthropic-api-key').value = config.anthropic.apiKey || '';
                document.getElementById('anthropic-model').value = config.anthropic.model || 'claude-3-sonnet-20240229';
                document.getElementById('anthropic-temperature').value = config.anthropic.temperature || 0.7;
                document.getElementById('anthropic-max-tokens').value = config.anthropic.maxTokens || 4000;
            }
            
            // 百度文心一言配置
            if (config.baidu) {
                document.getElementById('baidu-api-key').value = config.baidu.apiKey || '';
                document.getElementById('baidu-secret-key').value = config.baidu.secretKey || '';
                document.getElementById('baidu-model').value = config.baidu.model || 'ernie-bot-4';
                document.getElementById('baidu-temperature').value = config.baidu.temperature || 0.7;
            }
            
            // 月之暗面配置
            if (config.moonshot) {
                document.getElementById('moonshot-api-key').value = config.moonshot.apiKey || '';
                document.getElementById('moonshot-model').value = config.moonshot.model || 'moonshot-v1-8k';
                document.getElementById('moonshot-temperature').value = config.moonshot.temperature || 0.7;
            }
            
        } catch (error) {
            console.error("加载API配置时出错:", error);
        }
    }
}

// 保存API配置
function saveApiConfig() {
    // 获取当前选中的API提供商
    let provider = 'openai'; // 默认值
    const selectedProvider = document.querySelector('input[name="apiProvider"]:checked');
    if (selectedProvider) {
        provider = selectedProvider.value;
    }
    
    // 创建基本配置对象
    const config = {
        provider,
        openai: {
            apiKey: document.getElementById('openai-api-key')?.value || '',
            textModel: document.getElementById('openai-text-model')?.value || 'gpt-4o',
            imageModel: document.getElementById('openai-image-model')?.value || 'dall-e-3',
            temperature: parseFloat(document.getElementById('openai-temperature')?.value || '0.7'),
            maxTokens: parseInt(document.getElementById('openai-max-tokens')?.value || '4000'),
            apiProxy: document.getElementById('openai-api-proxy')?.value || ''
        },
        poe: {
            apiKey: document.getElementById('poe-api-key')?.value || '',
            textModel: document.getElementById('poe-text-model')?.value || 'Claude-3.7-Sonnet',
            imageModel: document.getElementById('poe-image-model')?.value || 'FLUX-pro-1.1'
        },
        deepseek: {
            apiKey: document.getElementById('deepseek-api-key')?.value || '',
            model: document.getElementById('deepseek-model')?.value || 'deepseek-chat',
            temperature: parseFloat(document.getElementById('deepseek-temperature')?.value || '0.7'),
            maxTokens: parseInt(document.getElementById('deepseek-max-tokens')?.value || '4000'),
            apiProxy: document.getElementById('deepseek-api-proxy')?.value || ''
        },
        anthropic: {
            apiKey: document.getElementById('anthropic-api-key')?.value || '',
            model: document.getElementById('anthropic-model')?.value || 'claude-3-sonnet-20240229',
            temperature: parseFloat(document.getElementById('anthropic-temperature')?.value || '0.7'),
            maxTokens: parseInt(document.getElementById('anthropic-max-tokens')?.value || '4000')
        },
        baidu: {
            apiKey: document.getElementById('baidu-api-key')?.value || '',
            secretKey: document.getElementById('baidu-secret-key')?.value || '',
            model: document.getElementById('baidu-model')?.value || 'ernie-bot-4',
            temperature: parseFloat(document.getElementById('baidu-temperature')?.value || '0.7')
        },
        moonshot: {
            apiKey: document.getElementById('moonshot-api-key')?.value || '',
            model: document.getElementById('moonshot-model')?.value || 'moonshot-v1-8k',
            temperature: parseFloat(document.getElementById('moonshot-temperature')?.value || '0.7')
        }
    };
    
    // 保存到本地存储
    localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
    console.log('API配置已保存:', config);
    return config;
}

// 如果API调用失败，尝试模拟响应
function simulateApiResponse(provider, type, params = {}) {
    return new Promise((resolve) => {
        console.log(`[API调用失败]尝试生成示例响应，类型: ${type}`);
        setTimeout(() => {
            switch (type) {
                case 'test':
                    resolve({ success: true, message: "API连接测试成功（示例响应）" });
                    break;
                case 'generate_article':
                    resolve({
                        content: `# ${params.title || '示例文章标题'}

## 引言

API调用失败，无法生成真实内容。以下是示例内容，仅用于演示界面。请检查API配置和网络连接。

## API调用失败可能的原因

1. API密钥无效或过期
2. 网络连接问题
3. API服务暂时不可用
4. API调用参数错误

## 建议解决方案

1. 验证您的API密钥是否正确
2. 检查网络连接
3. 稍后再试
4. 检查API日志以获取详细错误信息

> 这是示例内容，不代表实际API生成结果。

## 请尝试以下操作

- 检查控制台以获取详细错误信息
- 重新配置API密钥
- 更换不同的API提供商
- 联系支持获取帮助

祝您使用愉快！`
                    });
                    break;
                case 'extract_images':
                    resolve([
                        'https://picsum.photos/800/600?random=1',
                        'https://picsum.photos/800/600?random=2',
                        'https://picsum.photos/800/600?random=3'
                    ].slice(0, params.count || 3));
                    break;
                case 'generate_images':
                    resolve([
                        'https://picsum.photos/800/600?random=4',
                        'https://picsum.photos/800/600?random=5',
                        'https://picsum.photos/800/600?random=6'
                    ].slice(0, params.count || 3));
                    break;
                case 'scrape_content':
                    resolve(`这是示例抓取内容。API调用失败，无法获取真实内容。

在真实使用中，此处会显示从您提供的URL中提取的内容。请检查网络连接和API配置。

示例内容：
可能原因包括CORS限制、API密钥问题或网络连接问题。请查看控制台以获取详细错误信息。`);
                    break;
                default:
                    resolve({ success: false, message: "未知的操作类型" });
            }
        }, 1000);
    });
}

// 测试API连接 - 增强版
async function testApiConnection(provider) {
    console.log(`开始测试${provider} API连接...`);
    
    const apiConfig = JSON.parse(localStorage.getItem(API_CONFIG_KEY) || '{}');
    
    try {
        // OpenAI API测试
        if (provider === 'openai') {
            const openaiKey = apiConfig.openai?.apiKey;
            if (!openaiKey) {
                throw new Error("未配置OpenAI API密钥");
            }
            
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
            
            console.log(`使用端点测试OpenAI连接: ${apiEndpoint}`);
            
            // 发送简单请求测试API连接
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "user", content: "Hello, just testing the API connection. Please respond with 'API connection successful'." }
                    ],
                    max_tokens: 10
                })
            });
            
            console.log('OpenAI响应状态:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('OpenAI API响应错误详情:', errorData);
                throw new Error(`OpenAI API错误: ${errorData.error?.message || response.statusText || '未知错误'}`);
            }
            
            const result = await response.json();
            console.log('OpenAI API测试成功:', result);
            return { success: true };
        }
        
        // Poe API测试
        else if (provider === 'poe') {
            const poeKey = apiConfig.poe?.apiKey;
            if (!poeKey) {
                throw new Error("未配置Poe API密钥");
            }
            
            // 使用代理服务来避免CORS问题
            const proxyUrl = addCorsProxy('https://api.poe.com/chat/completions');
            console.log(`使用端点测试Poe连接: ${proxyUrl}`);
            
            // 发送简单请求测试API连接
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${poeKey}`
                },
                body: JSON.stringify({
                    model: "Claude-3.5-Sonnet-20240620",
                    messages: [
                        { role: "user", content: "Hello, just testing the API connection. Please respond with 'API connection successful'." }
                    ]
                })
            });
            
            console.log('Poe响应状态:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Poe API响应错误详情:', errorData);
                throw new Error(`Poe API错误: ${errorData.error?.message || response.statusText || '未知错误'}`);
            }
            
            const result = await response.json();
            console.log('Poe API测试成功:', result);
            return { success: true };
        }
        
        // DeepSeek API测试
        else if (provider === 'deepseek') {
            const deepseekKey = apiConfig.deepseek?.apiKey;
            if (!deepseekKey) {
                throw new Error("未配置DeepSeek API密钥");
            }
            
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
            
            console.log(`使用端点测试DeepSeek连接: ${apiEndpoint}`);
            
            // 发送简单请求测试API连接
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${deepseekKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        { role: "user", content: "Hello, just testing the API connection. Please respond with 'API connection successful'." }
                    ]
                })
            });
            
            console.log('DeepSeek响应状态:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('DeepSeek API响应错误详情:', errorData);
                throw new Error(`DeepSeek API错误: ${errorData.error?.message || response.statusText || '未知错误'}`);
            }
            
            const result = await response.json();
            console.log('DeepSeek API测试成功:', result);
            return { success: true };
        }
        
        // Anthropic API测试
        else if (provider === 'anthropic') {
            const anthropicKey = apiConfig.anthropic?.apiKey;
            if (!anthropicKey) {
                throw new Error("未配置Anthropic API密钥");
            }
            
            // 使用代理服务来避免CORS问题
            const proxyUrl = addCorsProxy('https://api.anthropic.com/v1/messages');
            console.log(`使用端点测试Anthropic连接: ${proxyUrl}`);
            
            // 发送简单请求测试API连接
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': anthropicKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: apiConfig.anthropic?.model || "claude-3-sonnet-20240229",
                    max_tokens: 10,
                    messages: [
                        { role: "user", content: "Hello, just testing the API connection. Please respond with 'API connection successful'." }
                    ]
                })
            });
            
            console.log('Anthropic响应状态:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Anthropic API响应错误详情:', errorData);
                throw new Error(`Anthropic API错误: ${errorData.error?.message || response.statusText || '未知错误'}`);
            }
            
            const result = await response.json();
            console.log('Anthropic API测试成功:', result);
            return { success: true };
        }
        
        // 百度文心一言API测试
        else if (provider === 'baidu') {
            const apiKey = apiConfig.baidu?.apiKey;
            const secretKey = apiConfig.baidu?.secretKey;
            if (!apiKey || !secretKey) {
                throw new Error("未配置百度文心一言API密钥");
            }
            
            // 使用代理避免CORS问题
            const tokenUrl = addCorsProxy(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`);
            
            // 获取访问令牌
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
            
            // 使用令牌进行API测试
            const apiUrl = addCorsProxy(`https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${accessToken}`);
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: apiConfig.baidu?.model || "ernie-bot-4",
                    messages: [
                        { role: "user", content: "你好，测试API连接" }
                    ]
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`百度API错误: ${errorData.error_msg || response.statusText}`);
            }
            
            const result = await response.json();
            console.log('百度API测试成功:', result);
            return { success: true };
        }
        
        // 月之暗面API测试
        else if (provider === 'moonshot') {
            const moonshotKey = apiConfig.moonshot?.apiKey;
            if (!moonshotKey) {
                throw new Error("未配置月之暗面API密钥");
            }
            
            // 使用代理服务来避免CORS问题
            const proxyUrl = addCorsProxy('https://api.moonshot.cn/v1/chat/completions');
            
            // 发送简单请求测试API连接
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${moonshotKey}`
                },
                body: JSON.stringify({
                    model: apiConfig.moonshot?.model || "moonshot-v1-8k",
                    messages: [
                        { role: "user", content: "你好，测试API连接" }
                    ]
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`月之暗面API错误: ${errorData.error?.message || response.statusText}`);
            }
            
            const result = await response.json();
            console.log('月之暗面API测试成功:', result);
            return { success: true };
        }
        
        // 其他API提供商的测试实现...
        else {
            throw new Error(`尚未实现对${provider}的支持`);
        }
    } catch (error) {
        console.error(`${provider} API连接测试失败:`, error);
        throw error;
    }
}

// 设置API提供商单选按钮样式
function updateProviderRadioStyle(radio) {
    console.log("更新API提供商样式:", radio.value);
    
    // 获取所有提供商卡片
    document.querySelectorAll('.api-provider-card').forEach(card => {
        const cardRadio = card.querySelector('input[type="radio"]');
        const radioOutline = card.querySelector('.provider-radio');
        const radioDot = card.querySelector('.provider-radio-dot');
        
        if (!cardRadio || !radioOutline || !radioDot) {
            console.error("提供商卡片结构不完整:", card);
            return;
        }
        
        // 重置样式
        radioOutline.classList.remove('border-apple-blue', 'dark:border-apple-darkblue');
        radioOutline.classList.add('border-gray-300', 'dark:border-gray-600');
        radioDot.classList.add('hidden');
        card.querySelector('label').classList.remove('border-apple-blue', 'dark:border-apple-darkblue');
    });
    
    // 设置选中的提供商卡片样式
    const card = radio.closest('.api-provider-card');
    if (card) {
        const radioOutline = card.querySelector('.provider-radio');
        const radioDot = card.querySelector('.provider-radio-dot');
        
        if (radioOutline && radioDot) {
            radioOutline.classList.remove('border-gray-300', 'dark:border-gray-600');
            radioOutline.classList.add('border-apple-blue', 'dark:border-apple-darkblue');
            radioDot.classList.remove('hidden');
            card.querySelector('label').classList.add('border-apple-blue', 'dark:border-apple-darkblue');
        }
    }
}

// 切换API设置面板
function toggleApiSettings(provider) {
    console.log("切换API设置面板:", provider);
    
    // 隐藏所有API设置
    document.querySelectorAll('.api-settings').forEach(setting => {
        setting.classList.add('hidden');
    });
    
    // 显示选中的API设置
    const settingsPanel = document.getElementById(`${provider}-settings`);
    if (settingsPanel) {
        settingsPanel.classList.remove('hidden');
    } else {
        console.warn(`未找到${provider}的设置面板`);
    }
}

// 初始化API提供商选择器事件
function initApiProviderSelection() {
    document.querySelectorAll('.api-provider-card input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            console.log("API提供商变更为:", this.value);
            // 更新单选按钮样式
            updateProviderRadioStyle(this);
            
            // 切换API设置面板
            const provider = this.value;
            toggleApiSettings(provider);
            
            // 隐藏测试结果
            const apiTestResult = document.getElementById('apiTestResult');
            if (apiTestResult) {
                apiTestResult.classList.add('hidden');
            }
        });
    });
}

// 保存API配置并测试连接
async function saveAndTestApiConfig() {
    // 保存API配置
    const config = saveApiConfig();
    
    // 测试API连接
    const provider = config.provider;
    const apiTestResult = document.getElementById('apiTestResult');
    
    if (!apiTestResult) {
        console.error("找不到apiTestResult元素");
        return false;
    }
    
    apiTestResult.innerHTML = `
        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl flex items-center">
            <div class="apple-spinner mr-2"></div>
            <span>正在测试 ${provider} API 连接...</span>
        </div>
    `;
    apiTestResult.classList.remove('hidden');
    
    try {
        // 使用实际API测试
        const result = await testApiConnection(provider);
        
        if (result.success) {
            apiTestResult.innerHTML = `
                <div class="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl flex items-center">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span>${provider} API 连接测试成功！API密钥有效。</span>
                </div>
            `;
            return true;
        } else {
            apiTestResult.innerHTML = `
                <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-xl flex flex-col">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        <span>API连接测试结果不明确</span>
                    </div>
                    <div class="text-sm">${result.message || '无详细信息'}</div>
                </div>
            `;
            return true;
        }
    } catch (error) {
        console.error("API测试失败:", error);
        
        apiTestResult.innerHTML = `
            <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl flex flex-col">
                <div class="flex items-center mb-2">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span>API连接测试失败</span>
                </div>
                <div class="text-sm">${error.message}</div>
                <div class="mt-2 text-xs">请检查API密钥是否正确，并确保网络连接正常。</div>
                <div class="mt-3">
                    <button id="try-other-proxy" class="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        尝试其他代理
                    </button>
                </div>
            </div>
        `;
        
        // 添加尝试其他代理按钮的事件
        document.getElementById('try-other-proxy')?.addEventListener('click', function() {
            // 切换到下一个代理
            const proxyKeys = Object.keys(CORS_PROXIES);
            const currentIndex = proxyKeys.indexOf(currentProxy);
            const nextIndex = (currentIndex + 1) % proxyKeys.length;
            setCorsProxy(proxyKeys[nextIndex]);
            
            apiTestResult.innerHTML = `
                <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl flex items-center">
                    <i class="fas fa-sync-alt mr-2"></i>
                    <span>已切换到代理: ${proxyKeys[nextIndex]}。请重新测试连接。</span>
                </div>
            `;
        });
        
        return false;
    }
}
