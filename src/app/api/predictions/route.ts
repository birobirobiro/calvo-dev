import Replicate from "replicate";

const FREEIMAGE_API_URL = "https://freeimage.host/api/1/upload";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const replicateApiKey = data.get("replicateApiKey") as string;
    const imageApiKey = data.get("imageApiKey") as string;
    const imageFile = data.get("image") as File;
    const prompt = "Remove hair from the uploaded image to make the person appear bald";
    const checkpoint_model = "realistic - sdxlUnstableDiffusers_nihilmania";

    if (!replicateApiKey || !imageApiKey || !imageFile || !prompt) {
      throw new Error("API keys and image are required.");
    }

    const replicate = new Replicate({
      auth: replicateApiKey,
    });

    const imageUrl = await uploadImageToFreeimageHost(imageFile, imageApiKey);
    if (!imageUrl) {
      throw new Error("Failed to upload image.");
    }

    const prediction = await replicate.predictions.create({
      version: "65ea75658bf120abbbdacab07e89e78a74a6a1b1f504349f4c4e3b01a655ee7a",
      input: { face_image: imageUrl, prompt, checkpoint_model },
    });

    if (prediction?.error) {
      throw new Error(prediction.error.detail);
    }

    return new Response(JSON.stringify(prediction), { status: 201 });

  } catch (error) {
    console.error('Error creating prediction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ detail: errorMessage }), { status: 500 });
  }
}

async function uploadImageToFreeimageHost(imageFile: File, imageApiKey: string) {
  const formData = new FormData();
  formData.append("key", imageApiKey);
  formData.append("action", "upload");
  formData.append("source", imageFile);
  formData.append("format", "json");

  const response = await fetch(FREEIMAGE_API_URL, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  if (result.status_code === 200) {
    return result.image.url;
  } else {
    console.error("Image upload failed:", result);
    return null;
  }
}