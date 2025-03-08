/**
 * 主程序和初始化功能
 */

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

// 初始化标签页
function initTabs() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有active类
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active', 'bg-white', 'dark:bg-gray-800', 'shadow-sm');
                btn.classList.add('text-gray-500', 'dark:text-gray-400');
            });
            
            // 隐藏所有内容
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            // 激活当前标签
            button.classList.add('active', 'bg-white', 'dark:bg-gray-800', 'shadow-sm');
            button.classList.remove('text-gray-500', 'dark:text-gray-400');
            
            // 显示当前内容
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.remove('hidden');
        });
    });
}

// 初始化主题展示
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

// 设置事件监听器
function setupEventListeners() {
    // API设置相关
    document.getElementById('saveApiSettingsBtn')?.addEventListener('click', saveAndTestApiConfig);
    
    // 下拉框主题选择与卡片联动
    document.getElementById('articleTheme')?.addEventListener('change', function() {
        const selectedTheme = this.value;
        
        // 更新主题卡片选择
        document.querySelectorAll('.theme-card').forEach(card => {
            if (card.getAttribute('data-theme') === selectedTheme) {
                card.click();
            }
        });
    });
    
    // 图片来源切换
    document.querySelectorAll('input[name="imageSource"]')?.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'extract') {
                document.getElementById('imageExtractSettings').classList.remove('hidden');
                document.getElementById('imageGenerateSettings').classList.add('hidden');
            } else if (this.value === 'generate') {
                document.getElementById('imageExtractSettings').classList.add('hidden');
                document.getElementById('imageGenerateSettings').classList.remove('hidden');
            }
        });
    });
    
    // 验证链接按钮
    document.getElementById('validateLinksBtn')?.addEventListener('click', handleLinkValidation);
    
    // 网页导入工具
    document.getElementById('fetchContentBtn')?.addEventListener('click', handleWebScraping);
    document.getElementById('clearResultsBtn')?.addEventListener('click', function() {
        document.getElementById('scrapeResult').classList.add('hidden');
        document.getElementById('scrapeUrl').value = '';
    });
    
    // 文件上传处理
    document.getElementById('referenceFiles')?.addEventListener('change', function(e) {
        const uploadedFilesDiv = document.getElementById('uploadedFiles');
        if (!uploadedFilesDiv) return;
        
        uploadedFilesDiv.innerHTML = '';
        
        Array.from(this.files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'flex items-center justify-between py-1.5 px-3 bg-apple-lightgray dark:bg-gray-800 rounded-lg';
            fileItem.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-file-alt text-apple-blue dark:text-apple-darkblue mr-2"></i>
                    <span class="text-sm truncate max-w-[200px]">${file.name}</span>
                    <span class="text-xs text-gray-500 ml-2">(${(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button class="remove-file text-gray-400 hover:text-red-500">
                    <i class="fas fa-times"></i>
                </button>
            `;
            uploadedFilesDiv.appendChild(fileItem);
        });
        
        // 为移除按钮添加事件
        document.querySelectorAll('.remove-file').forEach(button => {
            button.addEventListener('click', function() {
                this.closest('div').remove();
            });
        });
    });
    
    // 生成文章按钮
    document.getElementById('generateBtn')?.addEventListener('click', handleArticleGeneration);
    
    // 复制按钮
    document.getElementById('copyBtn')?.addEventListener('click', function() {
        const articleOutput = document.getElementById('articleOutput');
        if (!articleOutput) return;
        
        // 创建一个临时元素用于选择和复制
        const tempElement = document.createElement('div');
        tempElement.innerHTML = articleOutput.innerHTML;
        
        document.body.appendChild(tempElement);
        tempElement.style.position = 'absolute';
        tempElement.style.left = '-9999px';
        tempElement.style.opacity = '0';
        
        // 选择并复制
        const range = document.createRange();
        range.selectNodeContents(tempElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
        
        // 清理
        selection.removeAllRanges();
        document.body.removeChild(tempElement);
        
        // 显示成功提示
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check mr-1.5"></i>已复制!';
        setTimeout(() => {
            this.innerHTML = originalText;
        }, 2000);
    });
    
    // Markdown编辑工具栏
    document.getElementById('formatBoldBtn')?.addEventListener('click', function() {
        const textarea = document.getElementById('articleEditArea');
        if (textarea) markdownHelper.formatBold(textarea);
    });
    
    document.getElementById('formatItalicBtn')?.addEventListener('click', function() {
        const textarea = document.getElementById('articleEditArea');
        if (textarea) markdownHelper.formatItalic(textarea);
    });
    
    document.getElementById('formatLinkBtn')?.addEventListener('click', function() {
        const textarea = document.getElementById('articleEditArea');
        if (textarea) markdownHelper.formatLink(textarea);
    });
    
    document.getElementById('formatH2Btn')?.addEventListener('click', function() {
        const textarea = document.getElementById('articleEditArea');
        if (textarea) markdownHelper.formatH2(textarea);
    });
    
    document.getElementById('formatQuoteBtn')?.addEventListener('click', function() {
        const textarea = document.getElementById('articleEditArea');
        if (textarea) markdownHelper.formatQuote(textarea);
    });
    
    // 编辑文章模态框
    const editModal = document.getElementById('editArticleModal');
    
    document.getElementById('editArticleBtn')?.addEventListener('click', function() {
        const articleOutput = document.getElementById('articleOutput');
        if (!articleOutput || !editModal) return;
        
        const turndownService = new TurndownService();
        const markdown = turndownService.turndown(articleOutput.innerHTML);
        
        document.getElementById('articleEditArea').value = markdown;
        editModal.classList.remove('hidden');
    });
    
    document.getElementById('closeEditBtn')?.addEventListener('click', () => {
        if (editModal) editModal.classList.add('hidden');
    });
    
    document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
        if (editModal) editModal.classList.add('hidden');
    });
    
    document.getElementById('saveEditBtn')?.addEventListener('click', function() {
        const articleOutput = document.getElementById('articleOutput');
        const markdownContent = document.getElementById('articleEditArea')?.value;
        
        if (articleOutput && markdownContent) {
            articleOutput.innerHTML = DOMPurify.sanitize(marked.parse(markdownContent));
            if (editModal) editModal.classList.add('hidden');
        }
    });
    
    // 重新生成按钮
    document.getElementById('regenerateBtn')?.addEventListener('click', function() {
        // 切换到内容创作页面
        document.querySelector('[data-tab="content"]')?.click();
        // 点击生成按钮
        document.getElementById('generateBtn')?.click();
    });
}
