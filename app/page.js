'use client';

import { useState } from "react";
import { Box, Stack, Paper, AppBar, Toolbar, Typography, IconButton, TextField, Button, useMediaQuery, useTheme } from "@mui/material";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SendIcon from '@mui/icons-material/Send';
import { ToastContainer } from 'react-toastify';

export default function Home() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm the Rate My Professor AI assistant. How can I help you today?"
    }
  ]);
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: '' }
    ]);
    setMessage('');
    const response = fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, { role: "user", content: message }])
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = '';
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  const restartChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hi! I'm the Rate My Professor AI assistant. How can I help you today?"
      }
    ]);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#e0f7fa"
      p={isSmallScreen ? 2 : 0}
    >
      <Stack
        direction="column"
        width={isSmallScreen ? '100%' : '600px'}
        height={isSmallScreen ? '80vh' : '700px'}
        component={Paper}
        elevation={3}
        borderRadius={4}
        position="relative"
      >
        <AppBar position="static" sx={{ bgcolor: '#00796b', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
          <Toolbar>
            <img src="icon.jpg.png" alt="Bot Icon" style={{ width: 40, height: 40, marginRight: 8 }} />
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Rate My Professor AI
            </Typography>
            <IconButton color="inherit" onClick={restartChat}>
              <RestartAltIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Stack
          direction="column"
          flexGrow={1}
          overflow="auto"
          p={2}
          spacing={2}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              {message.role === 'assistant' && (
                <img src="icon.jpg" alt="Bot Icon" style={{ width: 30, height: 30, marginRight: 8 }} />
              )}
              <Box
                bgcolor={
                  message.role === 'assistant' ? '#b2dfdb' : '#00796b'
                }
                color={message.role === 'assistant' ? 'black' : 'white'}
                borderRadius={16}
                p={2}
                maxWidth="80%"
                boxShadow={3}
              >
                <Typography variant="body1" whiteSpace="pre-wrap">
                  {message.content}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          p={2}
          borderTop="1px solid #e0e0e0"
        >
          <TextField
            label="Type your message..."
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#00796b',
                },
                '&:hover fieldset': {
                  borderColor: '#00796b',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00796b',
                },
              },
            }}
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={sendMessage}
            endIcon={<SendIcon />}
            sx={{
              bgcolor: 'transparent',
              borderRadius: '5%',
              borderColor: '#00796b',
              color: '#00796b',
              '&:hover': {
                bgcolor: '#00796b',
                color: 'white',
                borderColor: '#00796b',
              },
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>

      <ToastContainer />
    </Box>
  );
}