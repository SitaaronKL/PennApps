import React, { useState, FormEvent } from 'react';

interface Message {
  type: 'user' | 'ai';
  text: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  console.log("ChatInterface rendered. Loading state:", loading);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit called. Input:", input);
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
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { type: 'ai', text: 'Error: Could not get a response.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4">Ask About Your Digital Fingerprint</h2>
      <div className="h-64 overflow-y-auto border p-3 mb-4 bg-gray-50 rounded-md">
        {messages.length === 0 && (
          <p className="text-gray-500">Ask me anything about your YouTube activity or sent emails!</p>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg ${msg.type === 'user' ? 'bg-blue-100 text-right ml-auto' : 'bg-gray-200 text-left mr-auto'}`}
            style={{ maxWidth: '80%' }}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="text-center text-gray-500">
            Thinking...
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question here..."
          className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
