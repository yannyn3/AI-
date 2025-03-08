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
            
            // 其他API配置...
            
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
        }
        // 其他API配置...
    };
    
    // 保存到本地存储
    localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
    console.log('API配置已保存:', config);
    return config;
}

// 模拟API调用响应（当真实API不可用时）
function simulateApiResponse(provider, type, params = {}) {
    return new Promise((resolve) => {
        console.log(`[模拟模式] 使用${provider}进行${type}操作`, params);
        setTimeout(() => {
            switch (type) {
                case 'test':
                    resolve({ success: true, message: "API连接测试成功（模拟模式）" });
                    break;
                case 'generate_article':
                    resolve({
                        content: `# ${params.title || '示例文章标题'}

## 引言

这是一篇由AI创作的示例文章。在实际使用中，这里将显示基于您的提示词和参考资料生成的内容。当前运行在**模拟模式**下，API调用被模拟而非实际执行。

## 主要内容

模拟模式适用于以下情况：
- API密钥不可用或暂时失效
- 网络连接存在问题
- 希望在无API环境下演示功能
- 开发和测试应用功能

## 使用方法

要使用真实API功能，请确保：
1. 已正确配置API密钥
2. 网络连接正常
3. 已禁用模拟模式

> 本内容仅作为模拟示例，不代表实际生成的文章质量。真实API将根据您的具体需求创建定制内容。

### 配置说明

当前配置：
- API提供商: ${provider}
- 文章长度: ${params.length || '中等'}
- 主题: ${params.theme || '现代简约风'}

## 结论

感谢使用AI文章创作系统。要获取最佳体验，请配置正确的API密钥并禁用模拟模式。`
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
                    resolve(`这是从URL抓取的示例内容（模拟模式）。

在实际使用中，这里将显示从您提供的URL中提取的真实内容。当前因为处于模拟模式，所以显示此占位内容。

模拟的网页标题: ${params.url ? '来自 ' + new URL(params.url).hostname + ' 的文章' : '示例文章'}

模拟的文章内容:
这是模拟的文章第一段。在真实环境下，API会访问您提供的URL并提取其中的主要内容，过滤掉广告、导航和其他无关元素。

这是模拟的文章第二段。实际抓取的内容会保留原文的格式、标点和结构，使您能够将其用作参考资料。`);
                    break;
                default:
                    resolve({ success: false, message: "未知的模拟操作类型" });
            }
        }, 1500); // 模拟网络延迟
    });
}

// 测试API连接 - 增强版
async function testApiConnection(provider) {
    console.log(`开始测试${provider} API连接...`);
    
    // 如果是模拟模式，返回模拟响应
    if (isSimulationMode()) {
        return await simulateApiResponse(provider, 'test');
    }
    
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
                    <button id="enableSimulationBtn" class="text-xs px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                        启用模拟模式
                    </button>
                    <button id="try-other-proxy" class="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full ml-2">
                        尝试其他代理
                    </button>
                </div>
            </div>
        `;
        
        // 添加启用模拟模式按钮的事件
        document.getElementById('enableSimulationBtn')?.addEventListener('click', function() {
            enableSimulationMode();
            apiTestResult.innerHTML = `
                <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-xl flex items-center">
                    <i class="fas fa-robot mr-2"></i>
                    <span>已启用模拟模式，API调用将被模拟。您可以继续使用应用的所有功能，但结果将是模拟的。</span>
                </div>
            `;
        });
        
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
