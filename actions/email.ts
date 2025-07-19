'use server';

const BEARER_TOKEN = process.env.USEPLUNK_BEARER_TOKEN || '';

export async function sendEmail({ email }: { email: string }): Promise<{ error: any; status: number } | void> {
  if (!email) {
    return { error: 'Email required', status: 401 };
  }

  await fetch('https://api.useplunk.com/v1/track', {
    method: 'POST',
    body: JSON.stringify({
      event: 'user-waitlist',
      email,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${BEARER_TOKEN}`,
    },
  })
    .then((res) => {
      return { error: null, status: res.status };
    })
    .catch((err) => {
      return { error: err, status: 400 };
    });
}
