const chatStyles = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    maxHeight: 'calc(100vh - 100px)',
    maxWidth: 600,
    margin: '0 auto',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
    boxShadow: 2,
  },
  chatHeader: {
    p: 2,
    backgroundColor: 'background.paper',
    borderBottom: '1px solid',
    borderBottomColor: 'divider',
    display: 'flex',
    alignItems: 'center',
  },
  messagesContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    p: 2,
    backgroundColor: 'action.hover',
  },
  messageBubble: {
    mb: 1,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'flex-start',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
    ml: 'auto',
  },
  botBubble: {
    backgroundColor: 'background.paper',
    color: 'text.primary',
  },
  errorBubble: {
    backgroundColor: 'error.light',
    color: 'error.contrastText',
  },
  avatar: {
    mr: 1,
    fontSize: 20,
  },
  messageText: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  userText: {
    color: 'primary.contrastText',
  },
  botText: {
    color: 'text.primary',
  },
  inputContainer: {
    display: 'flex',
    p: 2,
    borderTop: '1px solid',
    borderTopColor: 'divider',
    backgroundColor: 'background.paper',
  },
  textField: {
    mr: 1,
  },
  sendButton: {
    ml: 'auto',
  },
};

export default chatStyles;
