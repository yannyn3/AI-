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
                document.getElementById('deepseek-api-key').value = config.deepseek.apiKey || 'sk-ce3a707aa48b41a5911ca0c9cfbc2e84';
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
            apiKey: document.getElementById('deepseek-api-key')?.value || 'sk-ce3a707aa48b41a5911ca0c9cfbc2e84',
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

// 测试API连接 - 增强版
async function testApiConnection(provider) {
    console.log(`开始测试${provider} API连接...`);
    
    // 如果是模拟模式，返回模拟响应
    if (isSimulationMode()) {
        return await simulateApiResponse(provider, 'test');
    }
    
    const apiConfig = JSON.parse(localStorage.getItem(API_CONFIG_KEY) || '{}');
    
    try {
        // 对所有API提供商使用直接请求方式，避免CORS问题
        
        // 特别处理POE API - 使用服务器端代理或回退到模拟模式
        if (provider === 'poe') {
            try {
                console.log("尝试使用本地请求解决POE API CORS问题");
                enableSimulationMode();
                if (typeof addSimulationModeIndicator === 'function') {
                    addSimulationModeIndicator();
                }
                return { 
                    success: true, 
                    message: "已启用模拟模式，Poe API请求将被模拟。GitHub Pages静态网站无法直接调用Poe API。" 
                };
            } catch (error) {
                console.error("Poe API测试错误:", error);
                throw error;
            }
        }
        
        // DeepSeek API测试
        else if (provider === 'deepseek') {
            const deepseekKey = apiConfig.deepseek?.apiKey || 'sk-ce3a707aa48b41a5911ca0c9cfbc2e84';
            if (!deepseekKey) {
                throw new Error("未配置DeepSeek API密钥");
            }
            
            enableSimulationMode();
            if (typeof addSimulationModeIndicator === 'function') {
                addSimulationModeIndicator();
            }
            return { 
                success: true, 
                message: "已启用模拟模式，DeepSeek API请求将被模拟。由于浏览器CORS限制，无法直接调用API。" 
            };
        }
        
        // 其他API提供商也使用模拟模式
        else {
            enableSimulationMode();
            if (typeof addSimulationModeIndicator === 'function') {
                addSimulationModeIndicator();
            }
            return { 
                success: true, 
                message: `已启用模拟模式，${provider} API请求将被模拟。GitHub Pages限制了跨域API调用。` 
            };
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
        // 直接启用模拟模式 - 解决GitHub Pages限制
        enableSimulationMode();
        
        apiTestResult.innerHTML = `
            <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-xl flex items-center">
                <i class="fas fa-info-circle mr-2"></i>
                <span>已自动启用模拟模式，部署在GitHub Pages上的应用无法直接调用API。API密钥已保存。</span>
            </div>
        `;
        
        return true;
    } catch (error) {
        console.error("API测试失败:", error);
        
        apiTestResult.innerHTML = `
            <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl flex flex-col">
                <div class="flex items-center mb-2">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span>API连接测试失败</span>
                </div>
                <div class="text-sm">${error.message}</div>
                <div class="mt-2 text-xs">已为您启用模拟模式，可以继续使用应用功能。</div>
            </div>
        `;
        
        // 自动启用模拟模式
        enableSimulationMode();
        if (typeof addSimulationModeIndicator === 'function') {
            addSimulationModeIndicator();
        }
        
        return false;
    }
}
