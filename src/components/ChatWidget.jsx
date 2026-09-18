import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: 'Assalam-o-Alaikum! 👋 Main aap ka School ERP assistant hoon. Kya madad chahiye?',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post('/chatbot/', { message: userMsg });
            setMessages((prev) => [
                ...prev,
                { sender: 'bot', text: res.data.reply },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    sender: 'bot',
                    text: 'Sorry, kuch masla ho gaya. Dobara try karein. ❌',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    fontSize: '28px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)',
                    zIndex: 9999,
                }}
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '100px',
                        right: '24px',
                        width: '380px',
                        height: '550px',
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 9998,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '16px 20px',
                            fontWeight: '600',
                            fontSize: '16px',
                        }}
                    >
                        🤖 School ERP Assistant
                    </div>

                    <div
                        style={{
                            flex: 1,
                            padding: '16px',
                            overflowY: 'auto',
                            backgroundColor: '#f7fafc',
                        }}
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    marginBottom: '12px',
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '75%',
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                        backgroundColor: msg.sender === 'user' ? '#667eea' : 'white',
                                        color: msg.sender === 'user' ? 'white' : '#2d3748',
                                        fontSize: '14px',
                                        lineHeight: '1.4',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ color: '#718096', fontSize: '13px', padding: '8px' }}>
                                🤖 Typing...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form
                        onSubmit={sendMessage}
                        style={{
                            display: 'flex',
                            padding: '12px',
                            borderTop: '1px solid #e2e8f0',
                            backgroundColor: 'white',
                        }}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Apna sawal likhein..."
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                fontSize: '14px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                outline: 'none',
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginLeft: '8px',
                                padding: '10px 18px',
                                background: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
