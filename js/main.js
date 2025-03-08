// 在main.js初始化函数中添加以下代码：

// 页面加载完成后执行初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化CORS代理
    initCorsProxy();
    
    // 初始化模拟模式
    initSimulationMode();
    
    // 初始化暗色模式
    setupDarkMode();
    
    // 初始化标签页
    initTabs();
    
    // 初始化主题展示
    initThemeShowcase();
    
    // 初始化API配置
    loadApiConfig();
    initApiProviderSelection();
    
    // 初始化事件监听器
    setupEventListeners();
    
    // 添加模拟模式指示器（如果启用）
    if (isSimulationMode()) {
        addSimulationModeIndicator();
    }
    
    // 初始设置为第一个标签页激活
    document.querySelector('.tab-button').click();
    
    // 设置版本信息
    document.getElementById('app-version')?.textContent = '版本 1.1.0';
});

// 添加模拟模式指示器
function addSimulationModeIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'fixed top-2 right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold z-50 flex items-center';
    indicator.innerHTML = '<i class="fas fa-robot mr-1"></i>模拟模式';
    document.body.appendChild(indicator);
    
    // 添加关闭模拟模式的提示
    indicator.title = '点击关闭模拟模式';
    indicator.style.cursor = 'pointer';
    indicator.addEventListener('click', function() {
        if (confirm('确定要关闭模拟模式吗？关闭后将尝试使用真实API。')) {
            disableSimulationMode();
            document.body.removeChild(indicator);
        }
    });
}

// 更新主题展示函数 - 增加新主题
function initThemeShowcase() {
    const themeShowcase = document.getElementById('themeShowcase');
    if (!themeShowcase) return;
    
    // 更新这个数组，加入新主题
    const themes = [
        { id: 'modern', name: '现代简约风' },
        { id: 'magazine', name: '杂志排版风' },
        { id: 'tech', name: '科技风格' },
        { id: 'business', name: '优雅商务风' },
        { id: 'creative', name: '创意设计风' },
        { id: 'tutorial', name: '教程指南风' },  // 新增教程主题
        { id: 'entertainment', name: '娱乐风格' }, // 新增娱乐主题
        { id: 'academic', name: '学术论文风' },
        { id: 'media', name: '自媒体风格' }
    ];
    
    // 清空现有内容
    themeShowcase.innerHTML = '';
    
    // 添加主题卡片
    themes.forEach(theme => {
        const card = document.createElement('div');
        card.className = `theme-card bg-white dark:bg-gray-900 rounded-2xl shadow-apple dark:shadow-apple-dark overflow-hidden cursor-pointer hover:ring-2 ring-apple-blue dark:ring-apple-darkblue transition-shadow ${theme.id === 'modern' ? 'theme-card-selected' : ''}`;
        card.setAttribute('data-theme', theme.id);
        
        card.innerHTML = `
            <div class="p-4 border-b border-gray-100 dark:border-gray-800 font-medium">${theme.name}</div>
            <div class="p-4 h-48 overflow-hidden">
                <div class="theme-${theme.id} scale-[0.6] origin-top-left">
                    <h1>${theme.name}标题</h1>
                    <p>这是一款${theme.name}的排版设计，特点是结构清晰、风格鲜明，适合不同类型的文章内容展示。</p>
                    <h2>小标题展示</h2>
                    <p>每种主题风格都有独特的设计元素和排版特色，能够为您的文章增添专业感和美观度。</p>
                </div>
            </div>
        `;
        
        themeShowcase.appendChild(card);
        
        // 添加点击事件
        card.addEventListener('click', function() {
            // 取消所有卡片选择
            document.querySelectorAll('.theme-card').forEach(c => {
                c.classList.remove('theme-card-selected', 'ring-2');
            });
            
            // 选中当前卡片
            this.classList.add('theme-card-selected', 'ring-2');
            
            // 更新主题选择下拉框
            const themeValue = this.getAttribute('data-theme');
            const themeSelect = document.getElementById('articleTheme');
            if (themeSelect) {
                themeSelect.value = themeValue;
            }
            
            // 更新文章预览区域的主题
            const articleOutput = document.getElementById('articleOutput');
            if (articleOutput) {
                articleOutput.className = '';
                articleOutput.classList.add(
                    `theme-${themeValue}`, 
                    'prose', 'dark:prose-invert', 'max-w-none', 
                    'border', 'border-gray-100', 'dark:border-gray-800', 
                    'p-6', 'rounded-xl', 'bg-white', 'dark:bg-gray-950', 
                    'overflow-auto'
                );
            }
        });
    });
}
