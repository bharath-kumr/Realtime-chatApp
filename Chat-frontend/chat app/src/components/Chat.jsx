import React, { useState, useEffect } from 'react';
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

const Chat = () => {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [room, setRoom] = useState('room1');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);
    fetchMessages();
    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
  }, [room]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://127.0.0.1:8000/api/messages/${room}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setChatLog(response.data);
    } catch (error) {
      console.error('Error fetching messages', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://127.0.0.1:8000/api/send/', {
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
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="profile"></div>
        ****
      </div>

      <div className="chat-box">
        {chatLog.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === username ? 'align-right' : 'align-left'}`}
          >
            <div
              className={`chat-message ${
                msg.sender === username ? 'you' : 'other'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-bar">
        <FaPlus className="input-icon" />
        <FaSmile className="input-icon" />
        <FaPaperclip className="input-icon" />
        <FaImage className="input-icon" />
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="send-button" onClick={sendMessage}>
          <FaPaperPlane />
        </button>
        <VoiceRecorder room={room} onUploadSuccess={fetchMessages} />
      </div>
    </div>
  );
};

export default Chat;
