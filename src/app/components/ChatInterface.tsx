import React, { useState, FormEvent, useRef, useEffect } from 'react';

interface Message {
  type: 'user' | 'ai';
  text: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { type: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage: Message = { type: 'ai', text: data.answer };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: unknown) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { type: 'ai', text: 'Error: Could not get a response.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 border border-gray-700 rounded-xl shadow-2xl bg-gray-900 text-white max-w-4xl mx-auto font-sans">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-purple-400">Digital Fingerprint AI Chat</h2>
      <div className="h-96 overflow-y-auto border border-gray-700 p-4 mb-6 bg-gray-800 rounded-lg flex flex-col space-y-4 shadow-inner">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-auto mb-auto text-lg leading-relaxed">
            Hello! I&apos;m your Digital Fingerprint AI. Ask me anything about your YouTube activity (subscriptions, liked videos, watch later, playlists). For example, try asking: <br/>
            <span className="font-semibold text-purple-300">&quot;What are my main interests based on my subscriptions?&quot;</span> or <br/>
            <span className="font-semibold text-purple-300">&quot;What does my watch later list say about my learning goals?&quot;</span>
          </p>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl shadow-lg max-w-[85%] ${msg.type === 'user' ? 'bg-blue-700 text-white self-end rounded-br-none' : 'bg-gray-700 text-gray-100 self-start rounded-bl-none'}`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="self-center text-purple-400 animate-pulse text-lg">
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your digital fingerprint..."
          className="flex-grow p-4 rounded-xl border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold transition-colors duration-200"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
