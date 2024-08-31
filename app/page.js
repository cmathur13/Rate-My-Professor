'use client';

import { useState } from 'react';
import { Box, Stack, TextField, Button, Typography, Paper, AppBar, Toolbar, IconButton, useMediaQuery } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm the Rate My Professor support assistant. How can I help you today?"
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

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f5f5f5"
      p={isSmallScreen ? 2 : 0}
    >
      {chatOpen && (
        <Stack
          direction="column"
          width={isSmallScreen ? '100%' : '600px'}
          height={isSmallScreen ? '80vh' : '700px'}
          component={Paper}
          elevation={3}
          borderRadius={4}
          position="relative"
        >
          <AppBar position="static" sx={{ bgcolor: '#6a1b9a', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
            <Toolbar>
              <img src="/images/bot.png" alt="Bot Icon" style={{ width: 40, height: 40, marginRight: 8 }} />
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                PharmaAI
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
                  <img src="/images/bot.png" alt="Bot Icon" style={{ width: 30, height: 30, marginRight: 8 }} />
                )}
                <Box
                  bgcolor={
                    message.role === 'assistant' ? '#e0e0e0' : '#6a1b9a'
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
                    borderColor: '#6a1b9a',
                  },
                  '&:hover fieldset': {
                    borderColor: '#6a1b9a',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6a1b9a',
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
                borderColor: '#6a1b9a',
                color: '#6a1b9a',
                '&:hover': {
                  bgcolor: '#6a1b9a',
                  color: 'white',
                  borderColor: '#6a1b9a',
                },
              }}
            >
              Send
            </Button>
          </Stack>
        </Stack>
      )}

      {!chatOpen && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setChatOpen(true)}
        >
          Open Chat
        </Button>
      )}

      <Box
        position="fixed"
        bottom={isSmallScreen ? 8 : 16}
        right={isSmallScreen ? 8 : 16}
        bgcolor="#6a1b9a"
        borderRadius={4}
        p={2}
        color="white"
        onClick={() => setFeedbackOpen(true)}
        sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <Typography variant="button">Give Feedback</Typography>
      </Box>

      {feedbackOpen && (
        <Box
          position="fixed"
          bottom={isSmallScreen ? 8 : 16}
          right={isSmallScreen ? 8 : 16}
          bgcolor="#ffffff"
          borderRadius={4}
          p={2}
          boxShadow={3}
          width={isSmallScreen ? '90%' : '300px'}
        >
          <Typography variant="h6" mb={2}>Feedback</Typography>
          <Stack direction="row" spacing={2} mb={2}>
            <Button
              variant={feedbackRating === 'Good' ? 'contained' : 'outlined'}
              color="success"
              onClick={() => setFeedbackRating('Good')}
              sx={{ width: '100px' }}
            >
              Good
            </Button>
            <Button
              variant={feedbackRating === 'Bad' ? 'contained' : 'outlined'}
              color="error"
              onClick={() => setFeedbackRating('Bad')}
              sx={{ width: '100px' }}
            >
              Bad
            </Button>
            <Button
              variant={feedbackRating === 'Not Sure' ? 'contained' : 'outlined'}
              color="info"
              onClick={() => setFeedbackRating('Not Sure')}
              sx={{ width: '100px' }}
            >
              Not Sure
            </Button>
          </Stack>
          <TextField
            label="Comments"
            multiline
            rows={4}
            value={feedbackComments}
            onChange={(e) => setFeedbackComments(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#6a1b9a',
                },
                '&:hover fieldset': {
                  borderColor: '#6a1b9a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6a1b9a',
                },
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={submitFeedback}
            fullWidth
          >
            Submit
          </Button>
        </Box>
      )}

      <ToastContainer />
    </Box>
  );
}