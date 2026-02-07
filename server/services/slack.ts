export async function notifySlack(text: string): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) {
    console.warn("[Slack] SLACK_WEBHOOK_URL not set, skipping notification:", text);
    return;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      console.error(`[Slack] Webhook returned ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    console.error("[Slack] Notification failed:", err);
  }
}
