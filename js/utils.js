// 将以下代码替换到 utils.js 文件中对应位置

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
