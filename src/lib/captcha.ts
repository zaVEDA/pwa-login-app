const CAPTCHA_URL = "https://functions.poehali.dev/bb30535c-bf59-42ce-aece-96541196bec9";

export interface CaptchaChallenge {
  token: string;
  background: string;
  piece: string;
  canvas_width: number;
  canvas_height: number;
  piece_width: number;
  piece_height: number;
  piece_y: number;
}

async function call(action: string, payload: Record<string, unknown> = {}) {
  const res = await fetch(CAPTCHA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

export const captchaApi = {
  generate: () => call("generate") as Promise<{ status: number; data: CaptchaChallenge & { error?: string } }>,
  verify: (token: string, x: number) =>
    call("verify", { token, x }) as Promise<{ status: number; data: { ok?: boolean; pass_token?: string; attempts_left?: number; error?: string } }>,
};
