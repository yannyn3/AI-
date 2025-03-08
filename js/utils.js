/**
 * 工具函数集合
 */

// 全局常量
const API_CONFIG_KEY = 'ai_writer_api_config_v2'; // 更新版本号以避免旧配置兼容性问题

// 提供多个CORS代理选项
const CORS_PROXIES = {
    none: '', // 无代理直接调用(默认模式)
    allorigins: 'https://api.allorigins.win/raw?url=',
    corsproxy: 'https://corsproxy.io/?',
    corsanywhere: 'https://cors-anywhere.herokuapp.com/',
    thingproxy: 'https://thingproxy.freeboard.io/fetch/'
};

// 默认代理 - 默认设为"none"即无代理模式
let currentProxy = 'none';

// 设置当前使用的代理
function setCorsProxy(proxyName) {
    if (CORS_PROXIES.hasOwnProperty(proxyName)) {
        currentProxy = proxyName;
        localStorage.setItem('preferred_cors_proxy', proxyName);
        console.log(`代理设置已更改为: ${proxyName} ${proxyName === 'none' ? '(直接连接)' : ''}`);
        return true;
    }
    return false;
}

// 初始化代理设置
function initCorsProxy() {
    const savedProxy = localStorage.getItem('preferred_cors_proxy');
    if (savedProxy && CORS_PROXIES.hasOwnProperty(savedProxy)) {
        currentProxy = savedProxy;
    } else {
        // 默认设为无代理模式
        currentProxy = 'none';
        localStorage.setItem('preferred_cors_proxy', 'none');
    }
    console.log(`当前代理模式: ${currentProxy} ${currentProxy === 'none' ? '(直接连接)' : ''}`);
}

// 检测URL是否需要加代理前缀
function addCorsProxy(url) {
    try {
        // 如果设置为无代理模式，直接返回原始URL
        if (currentProxy === 'none') {
            return url;
        }
        
        // 使用当前选择的代理
        return `${CORS_PROXIES[currentProxy]}${encodeURIComponent(url)}`;
    } catch (e) {
        console.error('添加CORS代理出错:', e);
        return url;
    }
}

/**
 * 通过Vercel API代理发送请求
 * @param {string} targetUrl - 目标API URL
 * @param {Object} options - 请求选项
 * @returns {Promise<Object>} - API响应
 */
async function sendViaProxy(targetUrl, options = {}) {
    // 替换为您的Vercel代理URL
    const PROXY_URL = "https://ai-wenzhang-git-main-printyang0gmailcoms-projects.vercel.app/";
    
    try {
        console.log(`通过代理发送请求到: ${targetUrl}`);
        
        // 准备代理请求数据
        const proxyData = {
            targetUrl: targetUrl,
            method: options.method || "POST",
            headers: options.headers || {},
            body: options.body || null
        };
        
        // 发送请求到代理
        const response = await fetch(PROXY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(proxyData)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`代理请求失败: ${response.status} ${errorData.error || ''}`);
        }
        
        const result = await response.json();
        
        // 检查API响应状态
        if (result.status >= 400) {
            throw new Error(`API错误: ${result.status} ${result.statusText || ''}`);
        }
        
        return result.data;
    } catch (error) {
        console.error("代理请求失败:", error);
        throw error;
    }
}

// 直接请求API而不使用代理
async function directApiRequest(url, options = {}) {
    try {
        console.log('尝试直接API请求:', url);
        const response = await fetch(url, options);
        return response;
    } catch (error) {
        console.error('直接API请求失败:', error);
        throw error;
    }
}

// 带回退策略的API请求
// 先尝试直接请求，失败后尝试代理
async function apiRequestWithFallback(url, options = {}, preferredProxies = ['none', 'allorigins', 'corsproxy']) {
    let lastError = null;
    
    // 先尝试直接连接，再尝试依次使用各代理
    for (const proxy of preferredProxies) {
        try {
            let proxyUrl = url;
            
            // 应用当前代理
            if (proxy !== 'none') {
                proxyUrl = `${CORS_PROXIES[proxy]}${encodeURIComponent(url)}`;
            }
            
            console.log(`使用${proxy === 'none' ? '直接连接' : proxy + '代理'}尝试请求:`, proxyUrl);
            const response = await fetch(proxyUrl, options);
            
            if (response.ok) {
                console.log(`请求成功(使用${proxy === 'none' ? '直接连接' : proxy})`);
                // 记住成功的代理以便将来使用
                if (currentProxy !== proxy) {
                    setCorsProxy(proxy);
                }
                return response;
            } else {
                console.warn(`请求返回非成功状态码: ${response.status} (${proxy})`);
                lastError = new Error(`HTTP错误: ${response.status}`);
                // 继续尝试下一个代理
            }
        } catch (error) {
            console.warn(`使用${proxy}请求失败:`, error);
            lastError = error;
            // 继续尝试下一个代理
        }
    }
    
    // 所有尝试都失败，尝试使用代理服务
    try {
        console.log("所有直接请求失败，尝试使用Vercel代理服务...");
        const response = await sendViaProxy(url, options);
        // 创建一个类似fetch响应的对象
        return {
            ok: true,
            status: 200,
            statusText: "OK",
            json: async () => response
        };
    } catch (error) {
        console.error("Vercel代理请求也失败:", error);
        throw lastError || new Error('所有API连接方式都失败');
    }
}

// 始终返回false，强制使用真实API
function isSimulationMode() {
    return false;
}

// 这些函数保留但空实现，确保调用它们不会出错
function enableSimulationMode() {
    localStorage.setItem('simulation_mode', 'false');
}

function disableSimulationMode() {
    localStorage.setItem('simulation_mode', 'false');
}

function initSimulationMode() {
    localStorage.setItem('simulation_mode', 'false');
}

// 暗色模式检测和切换
function setupDarkMode() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (event.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    });
}

// 显示警告/错误弹窗
function showAlert(type, title, message, details = null, suggestions = null) {
    // 移除任何现有的警告
    const existingAlerts = document.querySelectorAll('.alert-modal');
    existingAlerts.forEach(alert => alert.remove());
    
    // 创建新警告
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-modal fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm';
    
    // 设置颜色主题
    const themeColors = {
        error: 'text-red-600 dark:text-red-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
        info: 'text-blue-600 dark:text-blue-300',
        success: 'text-green-600 dark:text-green-400'
    };
    
    // 设置图标
    const icons = {
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
        success: 'fa-check-circle'
    };
    
    let contentHTML = `
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-lg w-full shadow-xl animate-fade-in">
            <h3 class="text-xl font-semibold mb-4 flex items-center ${themeColors[type]}">
                <i class="fas ${icons[type]} mr-2"></i>${title}
            </h3>
            <p class="mb-4">${message}</p>
    `;
    
    // 添加详细信息（可选）
    if (details) {
        contentHTML += `
            <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4 overflow-auto max-h-32">
                <code class="text-xs whitespace-pre-wrap break-all">${details}</code>
            </div>
        `;
    }
    
    // 添加建议（可选）
    if (suggestions && suggestions.length > 0) {
        contentHTML += `
            <p class="mb-2">建议尝试：</p>
            <ul class="list-disc pl-5 mb-4">
                ${suggestions.map(s => `<li>${s}</li>`).join('')}
            </ul>
        `;
    }
    
    // 添加关闭按钮
    contentHTML += `
            <div class="flex justify-end">
                <button id="closeAlertBtn" class="px-4 py-2 bg-apple-blue text-white rounded-lg">
                    我知道了
                </button>
            </div>
        </div>
    `;
    
    alertDiv.innerHTML = contentHTML;
    document.body.appendChild(alertDiv);
    
    // 添加关闭按钮事件
    document.getElementById('closeAlertBtn').addEventListener('click', () => {
        document.body.removeChild(alertDiv);
    });
    
    // 点击背景也关闭
    alertDiv.addEventListener('click', (e) => {
        if (e.target === alertDiv) {
            document.body.removeChild(alertDiv);
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.contains(alertDiv)) {
            document.body.removeChild(alertDiv);
        }
    });
    
    return alertDiv;
}

// 创建加载状态指示器
function createLoadingIndicator(elementId, text) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = `
        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl flex items-center">
            <div class="apple-spinner mr-2"></div>
            <span>${text}</span>
        </div>
    `;
    element.classList.remove('hidden');
}

// 更新加载状态
function updateLoadingIndicator(elementId, text) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const statusText = element.querySelector('span');
    if (statusText) {
        statusText.textContent = text;
    }
}

// 处理API响应的通用函数 - 增强版
async function handleApiResponse(response, apiName = 'API') {
    try {
        if (!response.ok) {
            console.error(`${apiName} 错误状态码:`, response.status, response.statusText);
            
            try {
                const errorData = await response.json();
                console.error(`${apiName} 错误数据:`, errorData);
                throw new Error(`${apiName}错误: ${errorData.error?.message || response.statusText || '未知错误'}`);
            } catch (e) {
                if (e instanceof SyntaxError) {
                    throw new Error(`${apiName}错误: 状态码 ${response.status} (${response.statusText})`);
                }
                throw e;
            }
        }
        return await response.json();
    } catch (e) {
        console.error(`处理${apiName}响应出错:`, e);
        throw e;
    }
}

// Markdown编辑助手
const markdownHelper = {
    wrapSelectedText: function(textarea, beforeText, afterText) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const replacement = beforeText + selectedText + afterText;
        
        textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        
        // 恢复选择区域
        textarea.focus();
        textarea.setSelectionRange(start + beforeText.length, start + beforeText.length + selectedText.length);
    },
    
    formatBold: function(textarea) {
        this.wrapSelectedText(textarea, '**', '**');
    },
    
    formatItalic: function(textarea) {
        this.wrapSelectedText(textarea, '*', '*');
    },
    
    formatLink: function(textarea) {
        this.wrapSelectedText(textarea, '[', '](https://example.com)');
    },
    
    formatH2: function(textarea) {
        const start = textarea.selectionStart;
        const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
        const beforeText = textarea.value.substring(0, lineStart);
        const afterText = textarea.value.substring(lineStart);
        
        textarea.value = beforeText + '## ' + afterText;
        textarea.focus();
        textarea.setSelectionRange(lineStart + 3, lineStart + 3);
    },
    
    formatQuote: function(textarea) {
        const start = textarea.selectionStart;
        const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
        const beforeText = textarea.value.substring(0, lineStart);
        const afterText = textarea.value.substring(lineStart);
        
        textarea.value = beforeText + '> ' + afterText;
        textarea.focus();
        textarea.setSelectionRange(lineStart + 2, lineStart + 2);
    },
    
    formatImage: function(textarea) {
        const imageUrl = prompt('请输入图片URL:', 'https://example.com/image.jpg');
        if (imageUrl) {
            const altText = prompt('请输入图片描述:', '图片描述');
            this.wrapSelectedText(textarea, `![${altText || '图片'}](`, `${imageUrl})`);
        }
    },
    
    formatList: function(textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        if (selectedText.trim()) {
            // 处理已选中文本，将每一行变成列表项
            const listItems = selectedText.split('\n')
                .map(line => line.trim() ? `- ${line}` : line)
                .join('\n');
            
            textarea.value = textarea.value.substring(0, start) + listItems + textarea.value.substring(end);
            textarea.focus();
            textarea.setSelectionRange(start, start + listItems.length);
        } else {
            // 没有选中文本时，插入列表模板
            const listTemplate = `- 列表项1\n- 列表项2\n- 列表项3`;
            textarea.value = textarea.value.substring(0, start) + listTemplate + textarea.value.substring(end);
            textarea.focus();
            textarea.setSelectionRange(start, start + listTemplate.length);
        }
    }
};

// 将图片插入到文章中
function insertImagesIntoArticle(images, insertMode) {
    const articleOutput = document.getElementById('articleOutput');
    if (!articleOutput || images.length === 0) return;
    
    const paragraphs = articleOutput.querySelectorAll('p, h2, h3');
    if (paragraphs.length === 0) return;
    
    if (insertMode === 'even') {
        // 均匀分布插入
        const step = Math.floor(paragraphs.length / (images.length + 1));
        let positions = [];
        
        for (let i = 1; i <= images.length; i++) {
            let pos = i * step;
            if (pos >= paragraphs.length) pos = paragraphs.length - 1;
            positions.push(pos);
        }
        
        // 插入图片
        positions.forEach((position, index) => {
            if (index < images.length && position < paragraphs.length) {
                const imgElement = document.createElement('img');
                imgElement.src = images[index];
                imgElement.alt = '文章配图';
                imgElement.className = 'mx-auto my-4 max-w-full h-auto';
                
                paragraphs[position].parentNode.insertBefore(imgElement, paragraphs[position].nextSibling);
            }
        });
    } else {
        // 随机分布插入
        let availablePositions = [...Array(paragraphs.length).keys()];
        let positions = [];
        
        // 随机选择位置
        for (let i = 0; i < images.length; i++) {
            if (availablePositions.length === 0) break;
            
            const randomIndex = Math.floor(Math.random() * availablePositions.length);
            positions.push(availablePositions[randomIndex]);
            availablePositions.splice(randomIndex, 1);
        }
        
        // 排序位置，从后往前插入，避免位置变化
        positions.sort((a, b) => b - a);
        
        // 插入图片
        positions.forEach((position, index) => {
            if (index < images.length && position < paragraphs.length) {
                const imgElement = document.createElement('img');
                imgElement.src = images[index];
                imgElement.alt = '文章配图';
                imgElement.className = 'mx-auto my-4 max-w-full h-auto';
                
                paragraphs[position].parentNode.insertBefore(imgElement, paragraphs[position].nextSibling);
            }
        });
    }
}

// 模拟API响应（仅用于调试）
async function simulateApiResponse(provider, type, params = {}) {
    return new Promise((resolve) => {
        console.log(`[模拟模式]尝试生成示例响应，类型: ${type}`);
        setTimeout(() => {
            switch (type) {
                case 'test':
                    resolve({ success: true, message: "API连接测试成功（模拟响应）" });
                    break;
                case 'generate_article':
                    resolve({
                        content: `# ${params.title || '示例文章标题'}

## 引言

这是一篇示例文章内容。在实际使用中，这里会是由AI生成的完整文章。

## 主要内容

- 这是示例内容的第一点
- 这是示例内容的第二点
- 这是示例内容的第三点

## 结论

这是示例文章的结论部分。感谢阅读！`
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
                default:
                    resolve({ success: false, message: "未知的操作类型" });
            }
        }, 500);
    });
}

// 调试日志函数
function debug(message, data = null) {
    console.log(`🔍 ${message}`, data || '');
}
