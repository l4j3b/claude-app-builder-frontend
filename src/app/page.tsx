"use client";

import { useState, useEffect, useRef } from "react";

const GITPOD_URL = process.env.NEXT_PUBLIC_BASE_GITPOD_URL;
const DEV_SERVER_URL = `https://${process.env.NEXT_PUBLIC_DEV_SERVER_PORT}-${GITPOD_URL}`;
const CODE_API_URL = `https://${process.env.NEXT_PUBLIC_CODE_API_PORT}-${GITPOD_URL}`;

console.log("GITPOD_URL", GITPOD_URL);
console.log("DEV_SERVER_URL", DEV_SERVER_URL);
console.log("CODE_API_URL", CODE_API_URL);

export default function Home() {
  const [prompt, setPrompt] = useState(
    "Change the app main title (not the page title) to something funny and that looks nice."
  );
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [styledMessages, setStyledMessages] = useState(true);
  const [messages, setMessages] = useState<unknown[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const callClaude = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse("");
    setMessages([]);

    try {
      const res = await fetch(`${CODE_API_URL}/claude/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          max_turns: 30,
          system_prompt:
            "You are a helpful coding assistant. Follow the user instructions carefully.",
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setLoading(false);
              return;
            }

            try {
              const message = JSON.parse(data);
              setMessages((prev) => [...prev, message]);
              setResponse((prev) => prev + JSON.stringify(message, null, 2) + "\n");
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom when messages or response updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, response]);

  const renderMessage = (message: unknown, index: number) => {
    // Type guard to ensure message has the expected structure
    if (
      !message ||
      typeof message !== "object" ||
      !("type" in message) ||
      !("content" in message)
    ) {
      return (
        <div
          key={index}
          className="mb-2 p-2 rounded bg-red-50 border-l-4 border-red-400 text-red-800"
        >
          <div className="font-semibold text-xs mb-1">Invalid Message</div>
          <div className="text-sm">Message format is invalid</div>
        </div>
      );
    }

    const typedMessage = message as { type: string; content: string };

    const getMessageStyle = (type: string) => {
      switch (type) {
        case "SystemMessage":
          return "bg-gray-100 border-l-4 border-gray-400 text-gray-700";
        case "AssistantMessage":
          return "bg-blue-50 border-l-4 border-blue-400 text-blue-800";
        case "UserMessage":
          return "bg-green-50 border-l-4 border-green-400 text-green-800";
        case "ResultMessage":
          return "bg-purple-50 border-l-4 border-purple-400 text-purple-800";
        default:
          return "bg-gray-50 border-l-4 border-gray-300 text-gray-600";
      }
    };

    const formatContent = (content: string) => {
      // Handle SystemMessage init data
      if (content.includes("SystemMessage(subtype='init'")) {
        const sessionMatch = content.match(/session_id': '([^']*?)'/);
        const toolsMatch = content.match(/tools': \[([^\]]*?)\]/);
        const modelMatch = content.match(/model': '([^']*?)'/);

        let result = "🚀 Session started";
        if (sessionMatch) result += `\nSession ID: ${sessionMatch[1].substring(0, 8)}...`;
        if (modelMatch) result += `\nModel: ${modelMatch[1]}`;
        if (toolsMatch) {
          const tools = toolsMatch[1]
            .split("'")
            .filter((t) => t.includes("_"))
            .map((t) => t.replace(/[^a-zA-Z]/g, ""));
          result += `\nTools: ${tools.slice(0, 5).join(", ")}${tools.length > 5 ? "..." : ""}`;
        }
        return result;
      }

      // Handle TextBlock content
      if (content.includes("TextBlock(text=")) {
        const match = content.match(/TextBlock\(text="(.*?)"\)/);
        if (match) {
          return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\'/g, "'");
        }
      }

      // Handle ToolUseBlock with more details
      if (content.includes("ToolUseBlock(")) {
        const nameMatch = content.match(/name='([^']*?)'/);
        const inputMatch = content.match(/input=\{([^}]*?)\}/);

        let result = nameMatch ? `🔧 ${nameMatch[1]}` : "🔧 Tool use";

        if (inputMatch) {
          const input = inputMatch[1];
          // Extract command from Bash tool
          if (input.includes("'command':")) {
            const cmdMatch = input.match(/'command': '([^']*?)'/);
            if (cmdMatch) result += `\n$ ${cmdMatch[1]}`;
          }
          // Extract file path from Read/Edit tools
          if (input.includes("'file_path':")) {
            const fileMatch = input.match(/'file_path': '([^']*?)'/);
            if (fileMatch) result += `\n📁 ${fileMatch[1]}`;
          }
          // Extract pattern from Grep tool
          if (input.includes("'pattern':")) {
            const patternMatch = input.match(/'pattern': '([^']*?)'/);
            if (patternMatch) result += `\n🔍 "${patternMatch[1]}"`;
          }
        }

        return result;
      }

      // Handle tool results in UserMessage
      if (content.includes("tool_result")) {
        const contentMatch = content.match(/'content': '([^']*?)'/);
        const errorMatch = content.match(/'is_error': (True|False)/);

        if (contentMatch) {
          const result = contentMatch[1]
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'");

          const isError = errorMatch && errorMatch[1] === "True";
          return `${isError ? "❌" : "✅"} ${
            result.length > 200 ? result.substring(0, 200) + "..." : result
          }`;
        }
      }

      // Handle ResultMessage
      if (content.includes("ResultMessage(")) {
        const statusMatch = content.match(/subtype='([^']*?)'/);
        const durationMatch = content.match(/duration_ms=(\d+)/);
        const turnsMatch = content.match(/num_turns=(\d+)/);
        const costMatch = content.match(/total_cost_usd=([0-9.]+)/);

        let result = statusMatch ? `📊 ${statusMatch[1]}` : "📊 Complete";
        if (durationMatch) result += `\n⏱️ ${Math.round(parseInt(durationMatch[1]) / 1000)}s`;
        if (turnsMatch) result += `\n🔄 ${turnsMatch[1]} turns`;
        if (costMatch) result += `\n💰 $${parseFloat(costMatch[1]).toFixed(4)}`;

        return result;
      }

      // Fallback - return first 200 chars
      return content.length > 200 ? content.substring(0, 200) + "..." : content;
    };

    return (
      <div key={index} className={`mb-2 p-2 rounded ${getMessageStyle(typedMessage.type)}`}>
        <div className="font-semibold text-xs mb-1">{typedMessage.type}</div>
        <div className="text-sm">{formatContent(typedMessage.content)}</div>
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <div className="w-[460px] bg-gray-100 border-r flex flex-col">
        <h2 className="text-lg font-semibold p-4 pb-2">Claude Assistant</h2>

        {/* Response area that takes remaining height */}
        <div className="flex-1 p-4 pt-2 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Response:</h3>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={styledMessages}
                onChange={(e) => setStyledMessages(e.target.checked)}
                className="mr-2"
              />
              Styled
            </label>
          </div>
          <div ref={scrollRef} className="bg-gray-50 p-2 rounded text-xs overflow-y-scroll h-full">
            {styledMessages ? (
              <div>
                {messages.length > 0 ? (
                  messages.map((message, index) => renderMessage(message, index))
                ) : (
                  <div className="text-gray-500">No messages yet...</div>
                )}
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{response || "No response yet..."}</div>
            )}
          </div>
        </div>

        {/* Input area at the bottom */}
        <div className="p-4 border-t bg-white">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            className="w-full h-20 p-2 border rounded resize-none mb-2"
          />
          <button
            onClick={callClaude}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Send to Claude"}
          </button>
        </div>
      </div>

      <div className="flex-1">
        <iframe
          src={DEV_SERVER_URL}
          style={{ border: "none", width: "100%", height: "100%" }}
          title="App Output"
        />
      </div>
    </div>
  );
}
