/**
 * 工具函数集合
 */

// 全局常量
const API_CONFIG_KEY = 'ai_writer_api_config_v2'; // 更新版本号以避免旧配置兼容性问题

// 提供多个CORS代理选项
const CORS_PROXIES = {
    allorigins: 'https://api.allorigins.win/raw?url=',
    corsproxy: 'https://corsproxy.io/?',
    corsanywhere: 'https://cors-anywhere.herokuapp.com/',
    thingproxy: 'https://thingproxy.freeboard.io/fetch/',
    local: '' // 无代理直接调用(本地测试模式)
};

// 默认代理
let currentProxy = 'allorigins';

// 设置当前使用的代理
function setCorsProxy(proxyName) {
    if (CORS_PROXIES[proxyName]) {
        currentProxy = proxyName;
        localStorage.setItem('preferred_cors_proxy', proxyName);
        return true;
    }
    return false;
}

// 初始化代理设置
function initCorsProxy() {
    const savedProxy = localStorage.getItem('preferred_cors_proxy');
    if (savedProxy && CORS_PROXIES[savedProxy]) {
        currentProxy = savedProxy;
    }
    
    // 如果网站运行在localhost或127.0.0.1，自动切换到本地模式
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        currentProxy = 'local';
    }
}

// 检测URL是否需要加代理前缀
function addCorsProxy(url) {
    try {
        // 本地模式不添加代理
        if (currentProxy === 'local') {
            return url;
        }
        
        const hostname = new URL(url).hostname;
        // 如果是外部API URL且不是常见CDN，添加当前选择的代理
        if (!hostname.includes('localhost') && 
            !hostname.includes('127.0.0.1') && 
            !hostname.endsWith('github.io') &&
            !hostname.includes('jsdelivr.net') &&
            !hostname.includes('cloudflare.com') &&
            !hostname.includes('unpkg.com') &&
            !hostname.includes('tailwindcss.com')) {
            console.log(`使用CORS代理: ${currentProxy} 访问: ${url}`);
            return `${CORS_PROXIES[currentProxy]}${encodeURIComponent(url)}`;
        }
        return url;
    } catch (e) {
        console.error('添加CORS代理出错:', e);
        return url;
    }
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

// 启用模拟模式（当API不可用时）
let simulationMode = false;

function enableSimulationMode() {
    simulationMode = true;
    localStorage.setItem('simulation_mode', 'true');
    console.log('已启用模拟模式 - API调用将被模拟');
}

function disableSimulationMode() {
    simulationMode = false;
    localStorage.setItem('simulation_mode', 'false');
    console.log('已禁用模拟模式 - 将使用真实API');
}

function isSimulationMode() {
    return simulationMode;
}

// 初始化模拟模式设置
function initSimulationMode() {
    const savedMode = localStorage.getItem('simulation_mode');
    if (savedMode === 'true') {
        simulationMode = true;
    }
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
