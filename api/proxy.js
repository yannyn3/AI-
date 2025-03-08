export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允许POST请求' });
  }

  try {
    const { targetUrl, headers = {}, method = 'POST', body } = req.body;

    if (!targetUrl) {
      return res.status(400).json({ error: '缺少目标URL' });
    }

    // 构建请求
    const fetchOptions = {
      method,
      headers: { ...headers },
    };

    if (body && method !== 'GET') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // 发送代理请求
    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();

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
