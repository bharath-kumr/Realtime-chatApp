import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import VoiceRecorder from './VoiceRecorder';
import './Chat.css';

import {
  FaSmile,
  FaPaperclip,
  FaImage,
  FaPlus,
  FaPaperPlane
} from 'react-icons/fa';

const BASE_URL = "https://chatapp-2o81.onrender.com";

const Chat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [room, setRoom] = useState('room1');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef(null);
  const intervalRef = useRef(null);
  const hasRedirected = useRef(false); // ✅ prevents multiple redirects

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');

    // ✅ Redirect to login if no token
    if (!token) {
      navigate('/login');
      return;
    }

    if (storedUsername) setUsername(storedUsername);

    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 8000);

    return () => clearInterval(intervalRef.current);
  }, [room]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const handleUnauthorized = () => {
    // ✅ Single function to handle 401 - no alert, no loop
    clearInterval(intervalRef.current);
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      localStorage.clear();
      navigate('/login');
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/api/messages/${room}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 60000
        }
      );
      setChatLog(response.data);

    } catch (error) {
      console.error('Error fetching messages', error);
      if (error.response?.status === 401) {
        handleUnauthorized(); // ✅ no alert, just redirect once
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/api/sent/`,
        { room, content: message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      if (response.status === 200 || response.status === 201) {
        setMessage('');
        fetchMessages();
      }

    } catch (error) {
      console.error('Error sending message', error);
      if (error.response?.status === 401) {
        handleUnauthorized();
      } else {
        alert('Failed to send message. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => {
    clearInterval(intervalRef.current);
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="profile"></div>
        <span>Chat Room: {room}</span>

        <select
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          style={{
            marginLeft: 'auto',
            padding: '4px 8px',
            borderRadius: '8px',
            marginRight: '10px'
          }}
        >
          <option value="room1">Room 1</option>
          <option value="room2">Room 2</option>
          <option value="room3">Room 3</option>
        </select>

        {/* ✅ Logout button */}
        <button
          onClick={handleLogout}
          style={{
            background: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Logout
        </button>
      </div>

      <div className="chat-box">
        {loading && (
          <p style={{ textAlign: 'center', color: '#aaa' }}>
            Loading messages...
          </p>
        )}

        {!loading && chatLog.length === 0 && (
          <p style={{ textAlign: 'center', color: '#aaa' }}>
            No messages yet. Say hello! 👋
          </p>
        )}

        {chatLog.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.sender === username ? 'align-right' : 'align-left'
            }`}
          >
            {msg.sender !== username && (
              <span className="sender-name">{msg.sender}</span>
            )}

            <div className={`bubble ${
              msg.sender === username ? 'you' : 'other'
            }`}>
              {msg.voice ? (
                <audio controls src={`${BASE_URL}${msg.voice}`} />
              ) : (
                msg.content
              )}
            </div>

            <span className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        ))}

        <div ref={chatBottomRef} />
      </div>

      <div className="chat-input-bar">
        <FaPlus className="input-icon" />
        <FaSmile className="input-icon" />
        <FaPaperclip className="input-icon" />
        <FaImage className="input-icon" />
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="send-button"
          onClick={sendMessage}
          disabled={sending}
        >
          {sending ? '...' : <FaPaperPlane />}
        </button>
        <VoiceRecorder room={room} onUploadSuccess={fetchMessages} />
      </div>
    </div>
  );
};

export default Chat;