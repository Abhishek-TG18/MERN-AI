import { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { IKImage } from "imagekitio-react";
import model from "../../lib/gemini";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

const NewPrompt = ({ data }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  const recognitionRef = useRef(null);
  const inputRef = useRef(null);
  const endRef = useRef(null);
  const formRef = useRef(null);
  const hasRun = useRef(false);
  const queryClient = useQueryClient();

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (inputRef.current) {
          inputRef.current.value = transcript; // Update input field with the transcript
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      recognition.onend = () => {
        if (inputRef.current && inputRef.current.value.trim()) {
          formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true })); // Auto-submit the form
        }
        setListening(false); // Stop listening state
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech recognition is not supported in this browser.");
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const initialHistory = data?.history?.map(({ role, parts }) => ({
    role,
    parts: [{ text: parts[0]?.text || "" }],
  })) || [];

  if (initialHistory.length === 0) {
    initialHistory.push({
      role: "user",
      parts: [{ text: "" }], // Initialize with an empty user message
    });
  }

  const chat = model.startChat({
    history: initialHistory,
    generationConfig: {},
  });

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data, question, answer, img.dbData]);

  const mutation = useMutation({
    mutationFn: () => {
      return fetch(`http://localhost:3000/api/chats/${data._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.length ? question : undefined,
          answer,
          img: img.dbData?.filePath || undefined,
        }),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", data._id] }).then(() => {
        formRef.current.reset();
        setQuestion("");
        setAnswer("");
        setImg({
          isLoading: false,
          error: "",
          dbData: {},
          aiData: {},
        });
      });
    },
    onError: (err) => {
      console.error("Mutation error:", err);
    },
  });

  const add = async (text, isInitial) => {
    if (!text) {
      console.error("Empty text provided to 'add' function.");
      return;
    }

    if (!isInitial) setQuestion(text);

    try {
      const result = await chat.sendMessageStream(
        Object.entries(img.aiData).length ? [img.aiData, text] : [text]
      );

      let accumulatedText = "";
      for await (const chunk of result.stream) {
        accumulatedText += chunk.text();
        setAnswer((prev) => prev + chunk.text()); // Prevent state clearing
      }

      mutation.mutate();
    } catch (err) {
      console.error("Error in sendMessageStream:", err);
      alert("An error occurred while fetching the response. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value.trim(); // Trim input to remove accidental spaces

    if (!text) {
      alert("Please enter a valid question.");
      return;
    }

    add(text, false);
  };

  useEffect(() => {
    if (!hasRun.current && data?.history?.length === 1) {
      const initialText = data.history[0]?.parts?.[0]?.text || "";
      if (initialText) add(initialText, true);
      hasRun.current = true;
    }
  }, [data]);

  return (
    <>
      {img.isLoading && <div>Loading...</div>}
      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint="https://ik.imagekit.io/mernAi03" // Replace with your endpoint
          path={img.dbData?.filePath}
          width="380"
          transformation={[{ width: 380 }]}
        />
      )}
      {question && <div className="message user">{question}</div>}
      {answer && (
        <div className="message">
          <Markdown>{answer}</Markdown>
        </div>
      )}
      <div className="endChat" ref={endRef}></div>
      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
        <Upload setImg={setImg} />
        <input id="file" type="file" multiple={false} hidden />
        <input
          type="text"
          name="text"
          placeholder="Ask anything..."
          ref={inputRef}
        />
        <span
          id="voice"
          className={`voice ${listening ? "listening" : ""}`}
          onClick={toggleListening}
        >
          <GraphicEqIcon />
        </span>
        <button>
          <img src="/arrow.png" alt="" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;
