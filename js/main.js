/**
 * 主程序和初始化功能
 */

// 验证页面必要元素是否存在
function validatePageElements() {
    const criticalElements = [
        { id: 'app-tabs', name: '标签导航容器' },
        { id: 'content-tab', name: '内容创作面板' },
        { id: 'api-tab', name: 'API配置面板' },
        { id: 'preview-tab', name: '预览排版面板' },
        { id: 'generateBtn', name: '生成文章按钮' },
        { id: 'articleTheme', name: '文章主题选择' }
    ];
    
    let allFound = true;
    criticalElements.forEach(element => {
        const el = document.getElementById(element.id);
        if (!el) {
            console.error(`❌ 关键元素缺失: ${element.name} (ID: ${element.id})`);
            allFound = false;
        }
    });
    
    // 检查标签按钮
    const tabButtons = document.querySelectorAll('.tab-button');
    if (tabButtons.length === 0) {
        console.error('❌ 找不到任何标签按钮 (.tab-button)');
        allFound = false;
    } else {
        debug(`✓ 找到 ${tabButtons.length} 个标签按钮`);
    }
    
    return allFound;
}

// 页面加载完成后执行初始化
document.addEventListener('DOMContentLoaded', function() {
    debug('页面加载完成，开始初始化应用...');
    
    // 验证页面元素
    const pageValid = validatePageElements();
    if (!pageValid) {
        console.error('页面结构验证失败，某些功能可能无法正常工作');
    }
    
    // 初始化CORS代理
    if (typeof initCorsProxy === 'function') {
        initCorsProxy();
    }
    
    // 始终禁用模拟模式
    if (typeof disableSimulationMode === 'function') {
        disableSimulationMode();
    }
    localStorage.setItem('simulation_mode', 'false');
    
    // 初始化暗色模式
    setupDarkMode();
    
    // 初始化标签页
    initTabs();
    
    // 初始化主题展示
    initThemeShowcase();
    
    // 初始化API配置
    if (typeof loadApiConfig === 'function') {
        loadApiConfig();
    }
    
    if (typeof initApiProviderSelection === 'function') {
        initApiProviderSelection();
    }
    
    // 扩展编辑器功能
    extendMarkdownHelper();
    
    // 初始化事件监听器
    setupEventListeners();
    
    // 确保至少有一个标签被激活 - 直接调用强制激活功能
    forceActivateFirstTab();
    
    // 设置版本信息
    const versionElement = document.getElementById('app-version');
    if (versionElement) {
        versionElement.textContent = '版本 1.2.1';
    }
    debug('应用初始化完成');
});

// 扩展Markdown编辑助手功能
function extendMarkdownHelper() {
    if (typeof markdownHelper !== 'object') {
        debug('markdownHelper对象不存在，无法扩展');
        return;
    }
    
    // 添加图片插入功能
    if (!markdownHelper.formatImage) {
        markdownHelper.formatImage = function(textarea) {
            const imageUrl = prompt('请输入图片URL:', 'https://example.com/image.jpg');
            if (imageUrl) {
                const altText = prompt('请输入图片描述:', '图片描述');
                this.wrapSelectedText(textarea, `![${altText || '图片'}](`, `${imageUrl})`);
            }
        };
    }
    
    // 添加列表功能
    if (!markdownHelper.formatList) {
        markdownHelper.formatList = function(textarea) {
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
        };
    }
}

// 强制激活第一个标签
function forceActivateFirstTab() {
    debug('强制激活第一个标签');
    
    // 1. 先尝试正常的点击事件
    const firstTabButton = document.querySelector('.tab-button');
    if (firstTabButton) {
        try {
            firstTabButton.click();
            debug('已通过点击事件激活第一个标签');
            return;
        } catch (e) {
            console.error('点击第一个标签出错:', e);
        }
    }
    
    // 2. 如果点击失败，手动更新DOM
    debug('尝试手动激活第一个标签');
    
    // 移除所有标签按钮的激活状态
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'bg-white', 'dark:bg-gray-800', 'shadow-sm');
        btn.classList.add('text-gray-500', 'dark:text-gray-400');
    });
    
    // 隐藏所有内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // 激活第一个标签按钮
    const firstButton = document.querySelector('.tab-button');
    if (firstButton) {
        firstButton.classList.add('active', 'bg-white', 'dark:bg-gray-800', 'shadow-sm');
        firstButton.classList.remove('text-gray-500', 'dark:text-gray-400');
        
        // 显示对应内容
        const tabId = firstButton.getAttribute('data-tab');
        if (tabId) {
            const targetContent = document.getElementById(`${tabId}-tab`);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                debug(`已手动激活内容面板: #${tabId}-tab`);
            } else {
                debug(`找不到内容面板: #${tabId}-tab`);
            }
        } else {
            debug('标签按钮没有data-tab属性');
        }
    } else {
        debug('找不到任何标签按钮');
        
        // 直接显示第一个内容面板作为后备方案
        const contentTab = document.getElementById('content-tab');
        if (contentTab) {
            contentTab.classList.remove('hidden');
            debug('已直接显示内容创作面板');
        }
    }
}

// 初始化标签页 - 修复版
function initTabs() {
    debug('开始初始化标签页');
    const tabButtons = document.querySelectorAll('.tab-button');
    
    if (tabButtons.length === 0) {
        console.error('❌ 找不到任何标签按钮，请检查HTML结构');
        return;
    }
    
    debug(`找到 ${tabButtons.length} 个标签按钮`);
    
    // 首先清除可能的旧事件监听器
    tabButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // 重新获取按钮并设置事件监听器
    document.querySelectorAll('.tab-button').forEach(button => {
        debug(`设置标签按钮事件: ${button.textContent.trim()}`);
        
        button.addEventListener('click', function(e) {
            debug(`点击了标签: ${this.textContent.trim()}`);
            
            // 获取目标标签ID
            const tabId = this.getAttribute('data-tab');
            if (!tabId) {
                console.error(`❌ 标签按钮缺少 data-tab 属性: ${this.outerHTML}`);
                return;
            }
            
            // 查找目标内容区域
            const targetContent = document.getElementById(`${tabId}-tab`);
            if (!targetContent) {
                console.error(`❌ 找不到对应内容区域: #${tabId}-tab`);
                return;
            }
            
            // 移除所有active类
            tabButtons.forEach(btn => {
                btn.classList.remove('active', 'bg-white', 'dark:bg-gray-800', 'shadow-sm');
                btn.classList.add('text-gray-500', 'dark:text-gray-400');
            });
            
            // 隐藏所有内容
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            // 激活当前标签
            this.classList.add('active', 'bg-white', 'dark:bg-gray-800', 'shadow-sm');
            this.classList.remove('text-gray-500', 'dark:text-gray-400');
            
            // 显示当前内容
            targetContent.classList.remove('hidden');
            debug(`标签内容显示成功: #${tabId}-tab`);
        });
    });
    
    debug('标签页初始化完成');
}

// 初始化主题展示
function initThemeShowcase() {
    const themeShowcase = document.getElementById('themeShowcase');
    if (!themeShowcase) {
        debug('找不到主题展示区域 #themeShowcase');
        return;
    }
    
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
        card.className = `theme-card bg-white dark:bg-gray-900 rounded-2xl shadow-apple dark:shadow-apple-dark overflow-hidden cursor-pointer hover:ring-2 ring-apple-blue dark:ring-apple-darkblue transition-shadow hover-card-effect ${theme.id === 'modern' ? 'theme-card-selected' : ''}`;
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
    const saveApiSettingsBtn = document.getElementById('saveApiSettingsBtn');
    if (saveApiSettingsBtn && typeof saveAndTestApiConfig === 'function') {
        saveApiSettingsBtn.addEventListener('click', saveAndTestApiConfig);
    }
    
    // 下拉框主题选择与卡片联动
    const articleTheme = document.getElementById('articleTheme');
    if (articleTheme) {
        articleTheme.addEventListener('change', function() {
            const selectedTheme = this.value;
            
            // 更新主题卡片选择
            document.querySelectorAll('.theme-card').forEach(card => {
                if (card.getAttribute('data-theme') === selectedTheme) {
                    card.click();
                }
            });
        });
    }
    
    // 图片来源切换
    const imageSourceRadios = document.querySelectorAll('input[name="imageSource"]');
    if (imageSourceRadios.length > 0) {
        imageSourceRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                const imageExtractSettings = document.getElementById('imageExtractSettings');
                const imageGenerateSettings = document.getElementById('imageGenerateSettings');
                
                if (this.value === 'extract' && imageExtractSettings && imageGenerateSettings) {
                    imageExtractSettings.classList.remove('hidden');
                    imageGenerateSettings.classList.add('hidden');
                } else if (this.value === 'generate' && imageExtractSettings && imageGenerateSettings) {
                    imageExtractSettings.classList.add('hidden');
                    imageGenerateSettings.classList.remove('hidden');
                }
            });
        });
    }
    
    // 验证链接按钮
    const validateLinksBtn = document.getElementById('validateLinksBtn');
    if (validateLinksBtn && typeof handleLinkValidation === 'function') {
        validateLinksBtn.addEventListener('click', handleLinkValidation);
    }
    
    // 网页导入工具
    const fetchContentBtn = document.getElementById('fetchContentBtn');
    if (fetchContentBtn && typeof handleWebScraping === 'function') {
        fetchContentBtn.addEventListener('click', handleWebScraping);
    }
    
    const clearResultsBtn = document.getElementById('clearResultsBtn');
    if (clearResultsBtn) {
        clearResultsBtn.addEventListener('click', function() {
            const scrapeResult = document.getElementById('scrapeResult');
            const scrapeUrl = document.getElementById('scrapeUrl');
            
            if (scrapeResult) {
                scrapeResult.classList.add('hidden');
            }
            
            if (scrapeUrl) {
                scrapeUrl.value = '';
            }
        });
    }
    
    // 文件上传处理
    const referenceFiles = document.getElementById('referenceFiles');
    if (referenceFiles) {
        referenceFiles.addEventListener('change', function(e) {
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
                    const fileItem = this.closest('div');
                    if (fileItem && fileItem.parentNode) {
                        fileItem.parentNode.removeChild(fileItem);
                    }
                });
            });
        });
    }
    
    // 生成文章按钮
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn && typeof handleArticleGeneration === 'function') {
        generateBtn.addEventListener('click', handleArticleGeneration);
    }
    
    // 复制按钮
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
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
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
                document.execCommand('copy');
                
                // 清理
                selection.removeAllRanges();
            }
            document.body.removeChild(tempElement);
            
            // 显示成功提示
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check mr-1.5"></i>已复制!';
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 2000);
        });
    }
    
    // Markdown编辑工具栏
    setupMarkdownToolbar();
    
    // 编辑文章模态框
    setupEditArticleModal();
    
    // 重新生成按钮
    const regenerateBtn = document.getElementById('regenerateBtn');
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', function() {
            // 切换到内容创作页面
            const contentTabBtn = document.querySelector('[data-tab="content"]');
            if (contentTabBtn) {
                contentTabBtn.click();
            } else {
                // 直接显示内容创作标签页
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.add('hidden');
                });
                const contentTab = document.getElementById('content-tab');
                if (contentTab) {
                    contentTab.classList.remove('hidden');
                }
            }
            
            // 点击生成按钮
            const generateBtn = document.getElementById('generateBtn');
            if (generateBtn && typeof handleArticleGeneration === 'function') {
                generateBtn.click();
            }
        });
    }
}

// 设置Markdown工具栏
function setupMarkdownToolbar() {
    // 检查是否存在markdownHelper对象
    if (typeof markdownHelper !== 'object') {
        debug('markdownHelper对象不存在，无法设置Markdown工具栏');
        return;
    }
    
    const formatBoldBtn = document.getElementById('formatBoldBtn');
    if (formatBoldBtn) {
        formatBoldBtn.addEventListener('click', function() {
            const textarea = document.getElementById('articleEditArea');
            if (textarea) markdownHelper.formatBold(textarea);
        });
    }
    
    const formatItalicBtn = document.getElementById('formatItalicBtn');
    if (formatItalicBtn) {
        formatItalicBtn.addEventListener('click', function() {
            const textarea = document.getElementById('articleEditArea');
            if (textarea) markdownHelper.formatItalic(textarea);
        });
    }
    
    const formatLinkBtn = document.getElementById('formatLinkBtn');
    if (formatLinkBtn) {
        formatLinkBtn.addEventListener('click', function() {
            const textarea = document.getElementById('articleEditArea');
            if (textarea) markdownHelper.formatLink(textarea);
        });
    }
    
    const formatH2Btn = document.getElementById('formatH2Btn');
    if (formatH2Btn) {
        formatH2Btn.addEventListener('click', function() {
            const textarea = document.getElementById('articleEditArea');
            if (textarea) markdownHelper.formatH2(textarea);
        });
    }
    
    const formatQuoteBtn = document.getElementById('formatQuoteBtn');
    if (formatQuoteBtn) {
        formatQuoteBtn.addEventListener('click', function() {
            const textarea = document.getElementById('articleEditArea');
            if (textarea) markdownHelper.formatQuote(textarea);
        });
    }
    
    const formatImageBtn = document.getElementById('formatImageBtn');
    if (formatImageBtn) {
        formatImageBtn.addEventListener('click', function() {
            const textarea = document.getElementById('articleEditArea');
            if (textarea) markdownHelper.formatImage(textarea);
        });
    }
    
    const formatListBtn = document.getElementById('formatListBtn');
    if (formatListBtn) {
        formatListBtn.addEventListener('click', function() {
            const textarea = document.getElementById('articleEditArea');
            if (textarea) markdownHelper.formatList(textarea);
        });
    }
}

// 设置编辑文章模态框
function setupEditArticleModal() {
    const editModal = document.getElementById('editArticleModal');
    if (!editModal) {
        debug('找不到编辑文章模态框 #editArticleModal');
        return;
    }
    
    const editArticleBtn = document.getElementById('editArticleBtn');
    if (editArticleBtn) {
        editArticleBtn.addEventListener('click', function() {
            const articleOutput = document.getElementById('articleOutput');
            if (!articleOutput) return;
            
            // 检查是否存在TurndownService
            if (typeof TurndownService !== 'function') {
                console.error('TurndownService未定义，无法转换HTML到Markdown');
                return;
            }
            
            const turndownService = new TurndownService({
                headingStyle: 'atx',
                codeBlockStyle: 'fenced',
                emDelimiter: '*'
            });
            
            // 增强Turndown配置
            turndownService.addRule('preserveImages', {
                filter: 'img',
                replacement: function(content, node) {
                    return `![${node.alt || '图片'}](${node.src})`;
                }
            });
            
            const markdown = turndownService.turndown(articleOutput.innerHTML);
            
            const articleEditArea = document.getElementById('articleEditArea');
            if (articleEditArea) {
                articleEditArea.value = markdown;
                
                // 自动保存功能
                let autoSaveTimer;
                articleEditArea.addEventListener('input', function() {
                    clearTimeout(autoSaveTimer);
                    autoSaveTimer = setTimeout(function() {
                        localStorage.setItem('article_draft', articleEditArea.value);
                        // 显示自动保存指示
                        const saveIndicator = document.getElementById('autoSaveIndicator');
                        if (saveIndicator) {
                            saveIndicator.textContent = '已自动保存草稿';
                            saveIndicator.classList.remove('hidden');
                            setTimeout(() => {
                                saveIndicator.classList.add('hidden');
                            }, 2000);
                        }
                    }, 1000);
                });
                
                // 打开模态框
                editModal.classList.remove('hidden');
                
                // 聚焦编辑区域
                setTimeout(() => {
                    articleEditArea.focus();
                }, 100);
                
                // 检查是否有保存的草稿
                const savedDraft = localStorage.getItem('article_draft');
                if (savedDraft && confirm('检测到有保存的草稿，是否恢复?')) {
                    articleEditArea.value = savedDraft;
                }
            }
        });
    }
    
    const closeEditBtn = document.getElementById('closeEditBtn');
    if (closeEditBtn) {
        closeEditBtn.addEventListener('click', () => {
            if (localStorage.getItem('article_draft') && 
                confirm('关闭前是否保存当前编辑内容?')) {
                document.getElementById('saveEditBtn').click();
            }
            editModal.classList.add('hidden');
        });
    }
    
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            if (localStorage.getItem('article_draft') && 
                !confirm('确定放弃当前编辑内容?')) {
                return;
            }
            localStorage.removeItem('article_draft');
            editModal.classList.add('hidden');
        });
    }
    
    const saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', function() {
            const articleOutput = document.getElementById('articleOutput');
            const articleEditArea = document.getElementById('articleEditArea');
            
            if (articleOutput && articleEditArea) {
                const markdownContent = articleEditArea.value;
                
                // 清除草稿
                localStorage.removeItem('article_draft');
                
                // 检查是否存在marked和DOMPurify
                if (typeof marked === 'object' && typeof DOMPurify === 'object') {
                    // 扩展marked选项以支持更多格式
                    const renderer = new marked.Renderer();
                    renderer.image = function(href, title, text) {
                        return `<img src="${href}" alt="${text}" title="${title || ''}" class="mx-auto my-4 max-w-full h-auto rounded-lg shadow-md">`;
                    };
                    
                    marked.setOptions({
                        renderer: renderer,
                        gfm: true,
                        breaks: true,
                        headerIds: true
                    });
                    
                    articleOutput.innerHTML = DOMPurify.sanitize(marked.parse(markdownContent));
                    
                    // 添加成功提示
                    const successToast = document.createElement('div');
                    successToast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
                    successToast.innerHTML = '<i class="fas fa-check-circle mr-2"></i>文章已成功更新';
                    document.body.appendChild(successToast);
                    
                    setTimeout(() => {
                        successToast.classList.add('animate-fade-out');
                        setTimeout(() => {
                            document.body.removeChild(successToast);
                        }, 300);
                    }, 2000);
                    
                    editModal.classList.add('hidden');
                } else {
                    console.error('marked或DOMPurify未定义，无法安全解析Markdown');
                }
            }
        });
    }
}
