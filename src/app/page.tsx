"use client";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import { Prediction } from "replicate";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [replicateApiKey, setReplicateApiKey] = useState<string>("");
  const [imageApiKey, setImageApiKey] = useState<string>("");

  const logEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [log]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLog([]);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("replicateApiKey", replicateApiKey);
    formData.append("imageApiKey", imageApiKey);

    const response = await fetch("/api/predictions", {
      method: "POST",
      body: formData,
    });

    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      setLog((prev) => [...prev, `Error: ${prediction.detail}`]);
      return;
    }
    setPrediction(prediction);
    setLog((prev) => [...prev, `Prediction started: ${prediction.id}`]);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch(`/api/predictions/${prediction.id}`, {
        cache: "no-store",
      });
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        setLog((prev) => [...prev, `Error: ${prediction.detail}`]);
        return;
      }
      setLog((prev) => [...prev, `Prediction status: ${prediction.status}`]);
      setPrediction(prediction);
    }
  };

  return (
    <>
      <Head>
        <title>calvodev</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-3xl text-center mb-4 font-bold">
          Welcome to CalvoDev 🧑‍🦲
        </h1>
        <Card className="w-full max-w-5xl p-6 space-y-6 ">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center w-full space-y-4"
          >
            <Label htmlFor="replicateApiKey">Replicate API Key</Label>
            <Link
              href="https://replicate.com/account/api-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500"
            >
              Get your API key here
            </Link>
            <Input
              type="text"
              name="replicateApiKey"
              value={replicateApiKey}
              onChange={(e) => setReplicateApiKey(e.target.value)}
              required
              placeholder="r8_6wCt5V2k9FgwaExBZ6OMMln265BBNVm2qlFEV"
              className="placeholder:text-muted-foreground/30"
              autoFocus
              autoComplete="off"
            />
            <Label htmlFor="imageApiKey">Image API Key</Label>
            <Link
              href="https://freeimage.host/page/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 "
            >
              Get your API key here
            </Link>
            <Input
              type="text"
              name="imageApiKey"
              value={imageApiKey}
              onChange={(e) => setImageApiKey(e.target.value)}
              required
              placeholder="6d207e02198a847aa98d0a2a924485a5"
              className="placeholder:text-muted-foreground/30"
              autoComplete="off"
            />
            <Label htmlFor="picture">Upload an image</Label>
            <Input type="file" name="image" accept="image/*" required />
            <Button type="submit" className="w-full font-bold">
              Make me bald!
            </Button>
          </form>

          {error && <div className="text-red-500">{error}</div>}

          {prediction && (
            <div className="flex flex-col items-center space-y-4">
              {prediction.output && (
                <Image
                  src={prediction.output[prediction.output.length - 1]}
                  alt="output"
                  width={500}
                  height={500}
                  className="object-cover w-full h-full rounded-md border"
                />
              )}
              <p className="text-lg text-muted-foreground">
                Status: {prediction.status}
              </p>
            </div>
          )}

          {log.length > 0 && (
            <Card className="w-full p-4 border overflow-y-auto h-52">
              <ScrollArea>
                <h2 className="text-lg font-semibold mb-2">Log:</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {log.map((entry, index) => (
                    <li key={index}>{entry}</li>
                  ))}
                </ul>
                <div ref={logEndRef} />
              </ScrollArea>
            </Card>
          )}
        </Card>
      </main>
    </>
  );
}
