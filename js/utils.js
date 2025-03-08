// 全局常量
const API_CONFIG_KEY = 'ai_writer_api_config_v2'; // 更新版本号以避免旧配置兼容性问题

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

// 使用一个代理服务器来处理API请求，解决CORS问题
const CORS_PROXY = 'https://corsproxy.io/?';
// 可以替换为其他可用的CORS代理服务
// const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
// const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// 检测URL是否需要加代理前缀
function addCorsProxy(url) {
    const hostname = new URL(url).hostname;
    // 如果是外部API URL且不是常见CDN，添加代理
    if (!hostname.includes('localhost') && 
        !hostname.includes('127.0.0.1') && 
        !hostname.endsWith('github.io') &&
        !hostname.includes('jsdelivr.net') &&
        !hostname.includes('cloudflare.com') &&
        !hostname.includes('unpkg.com') &&
        !hostname.includes('tailwindcss.com')) {
        return `${CORS_PROXY}${encodeURIComponent(url)}`;
    }
    return url;
}

// 处理API响应的通用函数
async function handleApiResponse(response) {
    if (!response.ok) {
        try {
            const errorData = await response.json();
            throw new Error(`API错误: ${errorData.error?.message || response.statusText || '未知错误'}`);
        } catch (e) {
            if (e instanceof SyntaxError) {
                throw new Error(`API错误: 状态码 ${response.status} (${response.statusText})`);
            }
            throw e;
        }
    }
    return await response.json();
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
