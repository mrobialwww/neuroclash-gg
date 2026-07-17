/**
 * Fetch a file from a URL and return it as a Buffer
 */
export async function fetchFileBuffer(url: string, errorMessage = "Failed to download file from URL."): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(errorMessage);
    }
    return Buffer.from(await response.arrayBuffer());
}

/**
 * Fetch with timeout — prevents hanging requests (AbortController).
 * Default timeout: 15 seconds.
 */
export async function fetchWithTimeout(
    url: string,
    options: RequestInit & { timeout?: number } = {},
): Promise<Response> {
    const { timeout = 15_000, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
        });
        return response;
    } catch (error: any) {
        if (error?.name === "AbortError") {
            throw new Error(`Request timed out after ${timeout}ms: ${url.substring(0, 80)}`);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}
