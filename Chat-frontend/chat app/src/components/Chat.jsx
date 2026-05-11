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
    const storedUsername = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    // ✅ If not logged in redirect immediately
    if (!token) {
      navigate('/login');
      return;
    }

    if (storedUsername) setUsername(storedUsername);

    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 8000);

    return () => clearInterval(intervalRef.current);
  }, [room]);

  // ✅ Auto scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        clearInterval(intervalRef.current);
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          navigate('/login');
        }
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/api/messages/${room}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 60000 // ✅ 60s timeout for Render cold start
        }
      );
      setChatLog(response.data);

    } catch (error) {
      console.error('Error fetching messages', error);

      if (error.response?.status === 401) {
        // ✅ Stop polling and redirect once — no alert
        clearInterval(intervalRef.current);
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          localStorage.clear();
          navigate('/login');
        }
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
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/api/sent/`,
        {
          room,
          content: message
        },
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
        clearInterval(intervalRef.current);
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          localStorage.clear();
          navigate('/login');
        }
      } else {
        alert('Failed to send message. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  // ✅ Send on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ✅ Logout function
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

        {/* ✅ Room switcher */}
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

        {/* ✅ Loading state */}
        {loading && (
          <p style={{ textAlign: 'center', color: '#aaa' }}>
            Loading messages...
          </p>
        )}

        {/* ✅ Empty state */}
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
            {/* ✅ Show sender name for others */}
            {msg.sender !== username && (
              <span className="sender-name">{msg.sender}</span>
            )}

            <div
              className={`bubble ${
                msg.sender === username ? 'you' : 'other'
              }`}
            >
              {/* ✅ Voice message or text */}
              {msg.voice ? (
                <audio controls src={`${BASE_URL}${msg.voice}`} />
              ) : (
                msg.content
              )}
            </div>

            {/* ✅ Timestamp */}
            <span className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        ))}

        {/* ✅ Scroll anchor */}
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