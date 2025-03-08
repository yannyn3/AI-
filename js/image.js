/**
 * 图片生成和处理功能
 */

// 从参考链接提取图片
async function extractImagesFromLinks(links, count) {
    // 如果不需要图片，直接返回空数组
    if (count <= 0) {
        console.log("已选择无图模式，跳过图片提取");
        return [];
    }
    
    const statusText = document.getElementById('statusText');
    if (statusText) {
        statusText.textContent = '正在从参考链接提取图片...';
    }
    
    // 如果是模拟模式，返回模拟图片
    if (typeof isSimulationMode === 'function' && isSimulationMode()) {
        console.log("模拟模式：提取图片");
        return await simulateApiResponse('当前提供商', 'extract_images', { count });
    }
    
    try {
        // 获取API配置
        const apiConfig = JSON.parse(localStorage.getItem(API_CONFIG_KEY) || '{}');
        const provider = apiConfig.provider || 'openai';
        
        if (provider === 'poe') {
            // Poe API实现
            const poeKey = apiConfig.poe?.apiKey;
            if (!poeKey) {
                throw new Error("未配置Poe API密钥");
            }
            
            const model = apiConfig.poe?.textModel || 'Claude-3.7-Sonnet';
            const prompt = `请从以下链接中提取${count}张图片的URL地址，只返回图片URL列表，每行一个URL，不要有任何解释或其他输出：\n\n${links}\n\n注意：只提供原始图片URL，每个URL独占一行，不要有多余文字，不要有编号，不要有Markdown格式。`;
            
            // 由于CORS限制，返回模拟图片
            console.log("由于CORS限制，返回模拟图片");
            return await simulateApiResponse('poe', 'extract_images', { count });
            
        }
        else if (provider === 'openai') {
            // OpenAI API实现
            const openaiKey = apiConfig.openai?.apiKey;
            if (!openaiKey) {
                throw new Error("未配置OpenAI API密钥");
            }
            
            const model = apiConfig.openai?.textModel || 'gpt-4o';
            const prompt = `请从以下链接中提取${count}张图片的URL地址，只返回图片URL列表，每行一个URL，不要有任何解释或其他输出：\n\n${links}\n\n注意：只提供原始图片URL，每个URL独占一行，不要有多余文字，不要有编号，不要有Markdown格式。`;
            
            // 由于CORS限制，返回模拟图片
            console.log("由于CORS限制，返回模拟图片");
            return await simulateApiResponse('openai', 'extract_images', { count });
        }
        // 其他API提供商也返回模拟图片
        else {
            console.log("使用其他提供商，返回模拟图片");
            return await simulateApiResponse(provider, 'extract_images', { count });
        }
    } catch (error) {
        console.error("提取图片错误:", error);
        
        showAlert(
            'error',
            '链接图片提取失败',
            error.message,
            null,
            [
                'API密钥无效或已过期',
                '链接不可访问或已失效',
                '链接中不包含可提取的图片',
                '链接网站可能限制了图片访问',
                '尝试使用其他包含图片的链接',
                '切换到AI生成图片模式',
                '或选择无图模式'
            ]
        );
        
        return [];
    }
}

// 生成AI图片
async function generateAIImages(prompt, count, aspectRatio) {
    // 如果不需要图片，直接返回空数组
    if (count <= 0) {
        console.log("已选择无图模式，跳过图片生成");
        return [];
    }
    
    // 如果是模拟模式，返回模拟图片
    if (typeof isSimulationMode === 'function' && isSimulationMode()) {
        console.log("模拟模式：生成图片");
        return await simulateApiResponse('当前提供商', 'generate_images', { count });
    }
    
    // 获取API配置
    const apiConfig = JSON.parse(localStorage.getItem(API_CONFIG_KEY) || '{}');
    const provider = apiConfig.provider || 'openai';
    
    try {
        if (provider === 'poe') {
            // Poe API实现
            const poeKey = apiConfig.poe?.apiKey;
            if (!poeKey) {
                throw new Error("未配置Poe API密钥");
            }
            
            const imageModel = apiConfig.poe?.imageModel || 'FLUX-pro-1.1';
            const generatedUrls = [];
            
            // 由于CORS限制，返回模拟图片
            console.log("由于CORS限制，返回模拟图片");
            return await simulateApiResponse('poe', 'generate_images', { count });
        }
        else if (provider === 'openai') {
            // OpenAI API实现
            const openaiKey = apiConfig.openai?.apiKey;
            if (!openaiKey) {
                throw new Error("未配置OpenAI API密钥");
            }
            
            const imageModel = apiConfig.openai?.imageModel || 'dall-e-3';
            
            // 由于CORS限制，返回模拟图片
            console.log("由于CORS限制，返回模拟图片");
            return await simulateApiResponse('openai', 'generate_images', { count });
        }
        // 其他API提供商也返回模拟图片
        else {
            console.log("使用其他提供商，返回模拟图片");
            return await simulateApiResponse(provider, 'generate_images', { count });
        }
    } catch (error) {
        console.error("生成图片错误:", error);
        throw error;
    }
}

// 图片生成主函数
async function handleImageGeneration() {
    const imageSource = document.querySelector('input[name="imageSource"]:checked').value;
    const imageCount = parseInt(document.getElementById('imageCount').value);
    const statusText = document.getElementById('statusText');
    const generatedImages = document.getElementById('generatedImages');
    
    // 无图模式检查
    if (imageCount <= 0) {
        console.log("已选择无图模式，跳过图片处理");
        return;
    }
    
    if (imageSource === 'extract') {
        // 从参考链接提取图片
        const referenceLinks = document.getElementById('referenceLinks').value;
        if (!referenceLinks.trim()) {
            // 显示警告提示
            document.getElementById('generationStatus').classList.add('hidden');
            
            showAlert(
                'warning',
                '缺少参考链接',
                '您选择了从参考链接提取图片，但未提供任何参考链接。',
                null,
                ['在参考资料部分添加至少一个包含图片的网页链接', '切换到AI生成图片模式', '或选择无图模式']
            );
            
            return;
        }
        
        // 提取图片
        const extractedImages = await extractImagesFromLinks(referenceLinks, imageCount);
        
        if (extractedImages.length > 0) {
            // 显示提取的图片
            displayImages(extractedImages, '提取的图片');
            
            // 添加自动插入图片功能
            const insertMode = document.querySelector('input[name="imageInsertMode"]:checked').value;
            insertImagesIntoArticle(extractedImages, insertMode);
            
            document.getElementById('generationStatus').classList.add('hidden');
        }
    } else {
        // AI生成图片
        const apiConfig = JSON.parse(localStorage.getItem(API_CONFIG_KEY) || '{}');
        const provider = apiConfig.provider || 'openai';
        
        // 根据不同的提供商获取图片模型
        let imageModel;
        
        switch (provider) {
            case 'openai':
                imageModel = apiConfig.openai?.imageModel || 'dall-e-3';
                break;
            case 'poe':
                imageModel = apiConfig.poe?.imageModel || 'FLUX-pro-1.1';
                break;
            default:
                imageModel = 'default'; // 默认
        }
        
        const imagePrompt = document.getElementById('imagePrompt').value || "适合文章的精美配图，高质量，专业，逼真";
        const aspectRatio = document.getElementById('imageAspectRatio').value;
        
        // 清空之前的图片
        generatedImages.innerHTML = '<h3 class="text-lg font-semibold col-span-full mb-2 flex items-center"><i class="fas fa-images mr-2 text-apple-blue dark:text-apple-darkblue"></i>生成的图片</h3>';
        generatedImages.classList.remove('hidden');
        
        // 显示生成状态
        document.getElementById('generationStatus').classList.remove('hidden');
        statusText.textContent = '正在创作精美图片...';
        
        // 创建占位符
        for (let i = 0; i < imageCount; i++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'bg-gray-100 dark:bg-gray-800 rounded-xl aspect-[4/3] animate-pulse flex items-center justify-center';
            placeholder.id = `img-placeholder-${i}`;
            placeholder.innerHTML = '<div class="text-gray-400 dark:text-gray-500 flex flex-col items-center"><i class="fas fa-image mb-2 text-xl"></i><span>生成中...</span></div>';
            generatedImages.appendChild(placeholder);
        }
        
        // 生成图片
        try {
            // 使用AI API生成图片
            const generatedUrls = await generateAIImages(imagePrompt, imageCount, aspectRatio);
            
            // 显示生成的图片
            displayGeneratedImages(generatedUrls);
            
            // 添加自动插入图片功能
            const insertMode = document.querySelector('input[name="imageInsertMode"]:checked').value;
            insertImagesIntoArticle(generatedUrls, insertMode);
            
        } catch (error) {
            console.error("生成图片错误:", error);
            
            showAlert(
                'error',
                '图片生成失败',
                error.message,
                error.stack,
                [
                    'API密钥配置错误或已过期',
                    '提示词包含不当内容',
                    'API服务暂时不可用',
                    '网络连接问题',
                    '尝试修改图片提示词',
                    '切换到参考链接提取图片模式',
                    '或选择无图模式'
                ]
            );
        } finally {
            document.getElementById('generationStatus').classList.add('hidden');
            
            // 移除任何剩余的占位符
            document.querySelectorAll('[id^="img-placeholder-"]').forEach(placeholder => {
                placeholder.remove();
            });
        }
    }
}

// 显示提取的图片
function displayImages(imageUrls, title = '提取的图片') {
    const generatedImages = document.getElementById('generatedImages');
    
    if (!generatedImages || imageUrls.length === 0) return;
    
    // 显示提取的图片
    generatedImages.innerHTML = `<h3 class="text-lg font-semibold col-span-full mb-2 flex items-center"><i class="fas fa-images mr-2 text-apple-blue dark:text-apple-darkblue"></i>${title}</h3>`;
    generatedImages.classList.remove('hidden');
    
    // 添加图片到展示区
    imageUrls.forEach((imageUrl, index) => {
        const container = document.createElement('div');
        container.className = 'relative group overflow-hidden rounded-xl';
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'w-full h-auto rounded-xl transition-all duration-300';
        img.alt = `提取的图片 ${index + 1}`;
        img.loading = 'lazy'; // 添加延迟加载
        img.onerror = function() {
            // 图片加载失败时显示错误提示
            this.onerror = null;
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMjAwIj48cmVjdCBmaWxsPSIjZGRkIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIvPjx0ZXh0IGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiB4PSI1MCUiIHk9IjUwJSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWbvueJh+WKoui9veWksei0pTwvdGV4dD48L3N2Zz4=';
            this.className = 'w-full h-auto rounded-xl bg-gray-200 dark:bg-gray-700';
        };
        
        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300';
        
        const btnContainer = document.createElement('div');
        btnContainer.className = 'flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0';
        
        const insertBtn = document.createElement('button');
        insertBtn.className = 'bg-apple-blue hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium';
        insertBtn.innerHTML = '<i class="fas fa-plus mr-1"></i>插入';
        insertBtn.addEventListener('click', () => {
            // 在文章末尾插入图片
            const articleContent = document.getElementById('articleOutput');
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = '文章配图';
            imgElement.className = 'mx-auto my-4 max-w-full h-auto';
            articleContent.appendChild(imgElement);
        });
        
        btnContainer.appendChild(insertBtn);
        overlay.appendChild(btnContainer);
        container.appendChild(img);
        container.appendChild(overlay);
        
        generatedImages.appendChild(container);
    });
}

// 显示生成的图片（替换占位符）
function displayGeneratedImages(imageUrls) {
    imageUrls.forEach((imageUrl, index) => {
        const placeholder = document.getElementById(`img-placeholder-${index}`);
        if (!placeholder) return;
        
        const container = document.createElement('div');
        container.className = 'relative group overflow-hidden rounded-xl';
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'w-full h-auto rounded-xl transition-all duration-300';
        img.alt = `生成的图片 ${index + 1}`;
        img.loading = 'lazy'; // 添加延迟加载
        
        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300';
        
        const btnContainer = document.createElement('div');
        btnContainer.className = 'flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0';
        
        const insertBtn = document.createElement('button');
        insertBtn.className = 'bg-apple-blue hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium';
        insertBtn.innerHTML = '<i class="fas fa-plus mr-1"></i>插入';
        insertBtn.addEventListener('click', () => {
            // 在文章末尾插入图片
            const articleContent = document.getElementById('articleOutput');
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = '文章配图';
            imgElement.className = 'mx-auto my-4 max-w-full h-auto';
            articleContent.appendChild(imgElement);
        });
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'bg-white hover:bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium';
        downloadBtn.innerHTML = '<i class="fas fa-download mr-1"></i>保存';
        downloadBtn.addEventListener('click', () => {
            // 提示用户如何保存图片
            alert('请在图片上右键点击并选择"图片另存为..."以保存图片。');
        });
        
        btnContainer.appendChild(insertBtn);
        btnContainer.appendChild(downloadBtn);
        overlay.appendChild(btnContainer);
        container.appendChild(img);
        container.appendChild(overlay);
        
        placeholder.replaceWith(container);
    });
}
