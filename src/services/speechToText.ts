// 百度语音识别服务
const API_KEY = 'owHUAhObYKpEECcLex9oj2t8';
const SECRET_KEY = 'EnHwrrNGQlLiHevSrN296ntANECrU01b';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const res = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`
  );
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error_description || '获取百度 token 失败');
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 3600) * 1000,
  };

  return cachedToken.token;
}

export async function recognizeSpeech(audioBase64: string, size: number): Promise<string> {
  const token = await getAccessToken();

  const res = await fetch('https://vop.baidu.com/server_api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      format: 'amr',
      rate: 16000,
      channel: 1,
      cuid: 'ebbinghaus_app',
      token,
      speech: audioBase64,
      len: size,
    }),
  });

  const data = await res.json();

  if (data.err_no !== 0) {
    throw new Error(data.err_msg || '语音识别失败');
  }

  return data.result?.[0] ?? '';
}
