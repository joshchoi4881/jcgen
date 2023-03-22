import { useState, useEffect } from "react";
import Head from "next/head";

const DEFAULT_INPUT = "";
const DEFAULT_PROMPT = "";
const DEFAULT_IMAGE = "";
const DEFAULT_RETRY = 0;
const DEFAULT_IS_LOADING = false;

const MAX_RETRIES = 20;

const Home = () => {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [image, setImage] = useState(DEFAULT_IMAGE);
  const [retry, setRetry] = useState(DEFAULT_RETRY);
  const [retryCount, setRetryCount] = useState(MAX_RETRIES);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (retry === 0) {
      return;
    }
    runRetry();
  }, [retry]);

  const runRetry = async () => {
    if (retryCount === 0) {
      console.log(
        `model still loading after ${MAX_RETRIES} retries - please try request again in 5 minutes`
      );
      setRetryCount(MAX_RETRIES);
      return;
    }
    console.log(`trying again in ${retry} seconds`);
    await sleep(retry * 1000);
    await generate();
  };

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  const generate = async () => {
    if (isLoading && retry === 0) {
      return;
    }
    setIsLoading(true);
    if (retry > 0) {
      setRetryCount((prev) => {
        if (prev === 0) {
          return 0;
        } else {
          return prev - 1;
        }
      });
      setRetry(0);
    }
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: JSON.stringify({ input }),
    });
    const data = await res.json();
    if (res.status === 503) {
      setRetry(data.estimated_time);
      return;
    }
    if (!res.ok) {
      console.log(`error: ${data.error}`);
      setIsLoading(DEFAULT_IS_LOADING);
      return;
    }
    setPrompt(input);
    setInput(DEFAULT_INPUT);
    setImage(data.image);
    setIsLoading(DEFAULT_IS_LOADING);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  return (
    <div className="root">
      <Head>
        <title>jcgen</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>jcgen</h1>
          </div>
          <div className="header-subtitle">
            <h2>
              generate images of me using ai - make sure you refer to me as
              "jclvsh" in the prompt
            </h2>
            <p>
              ex: jclvsh as a secret agent in a James Bond film, highly
              detailed, 8k, uhd, studio lighting, beautiful
            </p>
          </div>
          <div className="prompt-container">
            <input
              className="prompt-box"
              value={input}
              onChange={handleInputChange}
            />
            <div className="prompt-buttons">
              <a
                className={
                  isLoading ? "generate-button loading" : "generate-button"
                }
                onClick={generate}
              >
                <div className="generate">
                  {isLoading ? (
                    <span className="loader"></span>
                  ) : (
                    <p>generate</p>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
        {image && (
          <div className="output-content">
            <img src={image} width={512} height={512} alt={prompt} />
            <p>{prompt}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
