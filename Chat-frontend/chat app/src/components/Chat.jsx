import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [room, setRoom] = useState('room1');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef(null); // ✅ auto scroll ref

  useEffect(() => {
    // ✅ Get username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);

    fetchMessages();
    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
  }, [room]);

  // ✅ Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/messages/${room}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setChatLog(response.data);
    } catch (error) {
      console.error('Error fetching messages', error);
      // ✅ If token expired, redirect to login
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return; // ✅ prevent empty messages
    setSending(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/api/sent/`, {
        room: room,
        content: message
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 201) {
        setMessage('');
        fetchMessages(); // ✅ refresh messages after sending
      }

    } catch (error) {
      console.error('Error sending message', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/login';
      } else {
        alert('Failed to send message. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  // ✅ Send message on Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
          style={{ marginLeft: 'auto', padding: '4px 8px', borderRadius: '8px' }}
        >
          <option value="room1">Room 1</option>
          <option value="room2">Room 2</option>
          <option value="room3">Room 3</option>
        </select>
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
            className={`chat-message ${msg.sender === username ? 'align-right' : 'align-left'}`}
          >
            {/* ✅ Show sender name for other people's messages */}
            {msg.sender !== username && (
              <span className="sender-name">{msg.sender}</span>
            )}

            <div className={`bubble ${msg.sender === username ? 'you' : 'other'}`}>
              {/* ✅ Show voice message if exists */}
              {msg.voice ? (
                <audio controls src={`${BASE_URL}${msg.voice}`} />
              ) : (
                msg.content
              )}
            </div>

            {/* ✅ Show timestamp */}
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
          onKeyDown={handleKeyDown} // ✅ Enter to send
        />
        <button
          className="send-button"
          onClick={sendMessage}
          disabled={sending} // ✅ prevent double send
        >
          {sending ? '...' : <FaPaperPlane />}
        </button>
        <VoiceRecorder room={room} onUploadSuccess={fetchMessages} />
      </div>
    </div>
  );
};

export default Chat;