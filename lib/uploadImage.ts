/**
 * Upload a single File to your S3 bucket via the /api/upload route.
 * Returns the public URL of the uploaded file.
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Upload failed with status ${res.status}`);
  }

  const { url } = await res.json();
  return url as string;
}

/**
 * Upload multiple files in parallel.
 * Returns an array of public URLs in the same order as the input files.
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  return Promise.all(files.map(uploadImage));
}