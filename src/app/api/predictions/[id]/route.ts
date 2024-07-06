import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const prediction = await replicate.predictions.get(params.id);

    if (prediction?.error) {
      return new Response(
        JSON.stringify({ detail: prediction.error.detail }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify(prediction),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching prediction:', error);

    let errorMessage = 'Failed to fetch prediction';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({ detail: errorMessage }),
      { status: 500 }
    );
  }
}