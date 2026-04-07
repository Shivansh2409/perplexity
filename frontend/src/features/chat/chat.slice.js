import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// Import chatAPI at runtime to avoid circular dependencies
const { chatAPI } = await import("../chat/service/chat.api.js");

// Async Thunks
export const createChat = createAsyncThunk(
  "chat/createChat",
  async (content, { rejectWithValue }) => {
    try {
      const response = await chatAPI.createChat(content);
      // Extract data from axios response
      const responseData = response.data || response;
      return {
        _id: responseData.chatId,
        title: responseData.title,
        ...responseData,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const loadChat = createAsyncThunk(
  "chat/loadChat",
  async (chatId, { rejectWithValue }) => {
    try {
      const chatResponse = await chatAPI.getChat(chatId);
      const chatData = chatResponse.data || chatResponse;
      const messages = chatData.message || [];
      const chat = chatData.chat || {};
      console.log("fromslic", messages);
      return {
        chatId,
        messages: messages,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: [], // List of chats for sidebar
    currentChat: null,
    currentMessages: [],
    loading: false,
    error: null,
  },
  reducers: {
    addChat: (state, action) => {
      state.chats.unshift(action.payload);
      state.currentChat = action.payload;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    addMessage: (state, action) => {
      state.currentMessages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.currentMessages = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Chat
      .addCase(createChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.loading = false;
        state.chats.unshift(action.payload);
        state.currentChat = action.payload;
      })
      .addCase(createChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Load Chat
      .addCase(loadChat.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadChat.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChat = action.payload;
        state.currentMessages = action.payload.messages;
      })
      .addCase(loadChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addChat,
  setCurrentChat,
  addMessage,
  setMessages,
  clearError,
  setChats,
  setLoading,
} = chatSlice.actions;

export default chatSlice.reducer;
