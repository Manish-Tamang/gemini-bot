"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [generatingAnswer, setGeneratingAnswer] = useState(false);

  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    const parsedMessages = savedMessages ? JSON.parse(savedMessages) : [];
    setMessages(parsedMessages);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  async function generateAnswer(e) {
    setGeneratingAnswer(true);
    e.preventDefault();
    const newMessage = { sender: "user", text: question };
    setMessages((prev) => [...prev, newMessage]);
    setQuestion("");

    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_API_GENERATIVE_LANGUAGE_CLIENT}`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: newMessage.text }] }],
        },
      });

      const botMessage = {
        sender: "bot",
        text: response.data.candidates[0].content.parts[0].text,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.log(error);
      const errorMessage = {
        sender: "bot",
        text: "Sorry - Something went wrong. Please try again!",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setGeneratingAnswer(false);
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col h-[90vh] max-w-md w-full bg-white dark:bg-gray-950 rounded-2xl shadow-lg overflow-hidden">
        <header className="bg-gray-100 dark:bg-gray-900 px-4 py-3 flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M230.92 212c-15.23-26.33-38.7-45.21-66.09-54.16a72 72 0 1 0-73.66 0c-27.39 8.94-50.86 27.82-66.09 54.16a8 8 0 1 0 13.85 8c18.84-32.56 52.14-52 89.07-52s70.23 19.44 89.07 52a8 8 0 1 0 13.85-8ZM72 96a56 56 0 1 1 56 56 56.06 56.06 0 0 1-56-56Z"></path>
          </svg>
          <div className="text-lg font-medium">Chatbot</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800"
                } px-4 py-3 rounded-2xl max-w-xs`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={generateAnswer}
          className="flex items-center gap-2 p-4 bg-gray-100 dark:bg-gray-900"
        >
          <Input
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-transparent"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={generatingAnswer}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="text-blue-500"
            disabled={generatingAnswer}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
