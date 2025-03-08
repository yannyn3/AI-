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
            
            // 其他API配置...
            
        } catch (error) {
            console.error("加载API配置时出错:", error);
        }
    }
}

// 保存API配置
function saveApiConfig() {
    const provider = document.querySelector('input[name="apiProvider"]:checked').value;
    
    const config = {
        provider,
        openai: {
            apiKey: document.getElementById('openai-api-key').value,
            textModel: document.getElementById('openai-text-model').value,
            imageModel: document.getElementById('openai-image-model').value,
            temperature: parseFloat(document.getElementById('openai-temperature').value),
            maxTokens: parseInt(document.getElementById('openai-max-tokens').value),
            apiProxy: document.getElementById('openai-api-proxy').value
        },
        poe: {
            apiKey: document.getElementById('poe-api-key').value,
            textModel: document.getElementById('poe-text-model').value,
            imageModel: document.getElementById('poe-image-model').value
        }
        // 其他API配置...
    };
    
    localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
    return config;
}

// 测试API连接
async function testApiConnection(provider) {
    const apiConfig = JSON.parse(localStorage.getItem(API_CONFIG_KEY) || '{}');
    
    try {
        if (provider === 'poe') {
            const poeKey = apiConfig.poe?.apiKey;
            if (!poeKey) {
                throw new Error("未配置Poe API密钥");
            }
            
            // 使用代理服务来避免CORS问题
            const proxyUrl = addCorsProxy('https://api.poe.com/chat/completions');
            
            // 发送简单请求测试API连接
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${poeKey}`
                },
                body: JSON.stringify({
                    model: "Claude-3.7-Sonnet",
                    messages: [
                        { role: "user", content: "Hello, just testing the API connection. Please respond with 'API connection successful'." }
                    ]
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Poe API错误: ${errorData.error?.message || response.statusText || '未知错误'}`);
            }
            
            return true;
        }
        else if (provider === 'openai') {
            const openaiKey = apiConfig.openai?.apiKey;
            if (!openaiKey) {
                throw new Error("未配置OpenAI API密钥");
            }
            
            // 根据是否设置了代理来确定API端点
            let apiEndpoint = 'https://api.openai.com/v1/chat/completions';
            const apiProxy = apiConfig.openai?.apiProxy;
            
            if (apiProxy) {
                apiEndpoint = apiProxy;
            } else {
                // 使用CORS代理
                apiEndpoint = addCorsProxy(apiEndpoint);
            }
            
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
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`OpenAI API错误: ${errorData.error?.message || response.statusText || '未知错误'}`);
            }
            
            return true;
        }
        // 可以添加其他API提供商的测试实现...
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
    // 获取所有提供商卡片
    document.querySelectorAll('.api-provider-card').forEach(card => {
        const cardRadio = card.querySelector('input[type="radio"]');
        const radioOutline = card.querySelector('.provider-radio');
        const radioDot = card.querySelector('.provider-radio-dot');
        
        // 重置样式
        radioOutline.classList.remove('border-apple-blue', 'dark:border-apple-darkblue');
        radioOutline.classList.add('border-gray-300', 'dark:border-gray-600');
        radioDot.classList.add('hidden');
        card.querySelector('label').classList.remove('border-apple-blue', 'dark:border-apple-darkblue');
    });
    
    // 设置选中的提供商卡片样式
    const card = radio.closest('.api-provider-card');
    const radioOutline = card.querySelector('.provider-radio');
    const radioDot = card.querySelector('.provider-radio-dot');
    
    radioOutline.classList.remove('border-gray-300', 'dark:border-gray-600');
    radioOutline.classList.add('border-apple-blue', 'dark:border-apple-darkblue');
    radioDot.classList.remove('hidden');
    card.querySelector('label').classList.add('border-apple-blue', 'dark:border-apple-darkblue');
}

// 切换API设置面板
function toggleApiSettings(provider) {
    // 隐藏所有API设置
    document.querySelectorAll('.api-settings').forEach(setting => {
        setting.classList.add('hidden');
    });
    
    // 显示选中的API设置
    document.getElementById(`${provider}-settings`).classList.remove('hidden');
}

// 初始化API提供商选择器事件
function initApiProviderSelection() {
    document.querySelectorAll('.api-provider-card input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            // 更新单选按钮样式
            updateProviderRadioStyle(this);
            
            // 切换API设置面板
            const provider = this.value;
            toggleApiSettings(provider);
            
            // 隐藏测试结果
            document.getElementById('apiTestResult').classList.add('hidden');
        });
    });
}

// 保存API配置并测试连接
async function saveAndTestApiConfig() {
    // 保存API配置
    saveApiConfig();
    
    // 测试API连接
    const provider = document.querySelector('input[name="apiProvider"]:checked').value;
    const apiTestResult = document.getElementById('apiTestResult');
    
    apiTestResult.innerHTML = `
        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl flex items-center">
            <div class="apple-spinner mr-2"></div>
            <span>正在测试 ${provider} API 连接...</span>
        </div>
    `;
    apiTestResult.classList.remove('hidden');
    
    try {
        // 使用实际API测试
        await testApiConnection(provider);
        
        apiTestResult.innerHTML = `
            <div class="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl flex items-center">
                <i class="fas fa-check-circle mr-2"></i>
                <span>${provider} API 连接测试成功！API密钥有效。</span>
            </div>
        `;
        return true;
    } catch (error) {
        apiTestResult.innerHTML = `
            <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl flex flex-col">
                <div class="flex items-center mb-2">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span>API连接测试失败</span>
                </div>
                <div class="text-sm">${error.message}</div>
                <div class="mt-2 text-xs">请检查API密钥是否正确，并确保网络连接正常。</div>
            </div>
        `;
        return false;
    }
}
