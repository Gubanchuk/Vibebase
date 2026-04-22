/**
 * Helpers to bridge the kernel's ReadableStream<string> to a fetch Response
 * and to a client-side async iterator.
 */

export function toTextStreamResponse(stream: ReadableStream<string>, extraHeaders?: Record<string, string>) {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(ctrl) {
      const reader = stream.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          ctrl.enqueue(encoder.encode(value));
        }
        ctrl.close();
      } catch (err) {
        ctrl.error(err);
      }
    },
  });
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      ...(extraHeaders ?? {}),
    },
  });
}

export async function* readTextStream(res: Response): AsyncGenerator<string> {
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) yield decoder.decode(value, { stream: true });
  }
}
