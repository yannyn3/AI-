export default async function handler(req, res) {
  // 允许CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 仅允许POST方法
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允许POST请求' });
  }

  try {
    const { targetUrl, headers = {}, method = 'POST', body } = req.body;

    if (!targetUrl) {
      return res.status(400).json({ error: '缺少目标URL' });
    }

    // 构建请求头
    const fetchHeaders = new Headers();
    Object.entries(headers).forEach(([key, value]) => {
      fetchHeaders.append(key, value);
    });

    // 构建fetch选项
    const fetchOptions = {
      method,
      headers: fetchHeaders,
    };

    // 添加请求体
    if (body && method !== 'GET') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // 发送请求
    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();

    // 返回响应
    return res.status(200).json({
      status: response.status,
      statusText: response.statusText,
      data
    });
  } catch (error) {
    console.error('代理请求失败:', error);
    return res.status(500).json({ error: error.message || '代理请求失败' });
  }
}
