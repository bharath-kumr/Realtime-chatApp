import React, { useState, useRef } from 'react';
import { FaMicrophone, FaStop, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';

const VoiceRecorder = ({ room, onUploadSuccess }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
      setAudioBlob(blob);
      audioChunks.current = [];
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('room', room);
    formData.append('voice', audioBlob, 'voice.webm');

    try {
      const response = await axios.post("https://chatapp-2o81.onrender.com/api/register/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setAudioBlob(null);
      onUploadSuccess(); // refresh messages
    } catch (error) {
      console.error('Upload failed', error);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {!isRecording ? (
        <button onClick={startRecording} title="Start Recording">
          <FaMicrophone color="white" />
        </button>
      ) : (
        <button onClick={stopRecording} title="Stop Recording">
          <FaStop color="red" />
        </button>
      )}

      {audioBlob && (
        <button onClick={uploadAudio} title="Send Voice">
          <FaPaperPlane color="lightgreen" />
        </button>
      )}
    </div>
  );
};

export default VoiceRecorder;



