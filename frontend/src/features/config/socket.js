import io from "socket.io-client";

const SOCKET_SERVER_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

console.log("[Socket] Connecting to:", SOCKET_SERVER_URL);

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.listeners = new Map();
  }

  /**
   * Initialize socket connection with authentication token
   * @param {string} token - JWT authentication token
   * @returns {Promise<void>}
   */
  connect(token) {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      try {
        this.socket = io(SOCKET_SERVER_URL, {
          auth: {
            token: `Bearer ${token}`,
          },
          reconnection: true,
          reconnectionDelay: this.reconnectDelay,
          reconnectionDelayMax: 10000,
          reconnectionAttempts: this.maxReconnectAttempts,
          transports: ["websocket", "polling"],
        });

        this.setupEventListeners();

        this.socket.on("connect", () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log("[Socket] Connected:", this.socket.id);
          resolve();
        });

        this.socket.on("connect_error", (error) => {
          console.error("[Socket] Connection error:", error);
          reject(error);
        });
      } catch (error) {
        console.error("[Socket] Initialization error:", error);
        reject(error);
      }
    });
  }

  /**
   * Join a specific chat room
   * @param {string} chatId - The chat ID to join
   */
  joinChatRoom(chatId) {
    if (!this.socket?.connected) {
      console.error("[Socket] Not connected. Cannot join room.");
      return;
    }

    this.socket.emit("join_room", { chatId }, (acknowledgment) => {
      if (acknowledgment?.success) {
        console.log(`[Socket] Joined chat room: ${chatId}`);
      } else {
        console.error(
          `[Socket] Failed to join chat room: ${acknowledgment?.error}`,
        );
      }
    });
  }

  /**
   * Leave a specific chat room
   * @param {string} chatId - The chat ID to leave
   */
  leaveChatRoom(chatId) {
    if (!this.socket?.connected) {
      console.error("[Socket] Not connected. Cannot leave room.");
      return;
    }

    this.socket.emit("leave_room", { chatId }, (acknowledgment) => {
      if (acknowledgment?.success) {
        console.log(`[Socket] Left chat room: ${chatId}`);
      }
    });
  }

  /**
   * Send a message in the chat
   * @param {string} chatId - The chat ID
   * @param {string} content - Message content
   */
  sendMessage(chatId, content) {
    if (!this.socket?.connected) {
      console.error("[Socket] Not connected. Cannot send message.");
      return;
    }

    this.socket.emit("send_message", { chatId, content }, (acknowledgment) => {
      if (!acknowledgment?.success) {
        console.error(
          `[Socket] Failed to send message: ${acknowledgment?.error}`,
        );
      }
    });
  }

  /**
   * Request access to a chat
   * @param {string} chatId - The chat ID
   */
  requestChatAccess(chatId) {
    if (!this.socket?.connected) {
      console.error("[Socket] Not connected. Cannot request access.");
      return;
    }

    this.socket.emit("request_access", { chatId });
  }

  /**
   * Listen for incoming messages
   * @param {Function} callback - Callback function with message data
   */
  onMessageReceived(callback) {
    this.addListener("message", callback);
  }

  /**
   * Listen for access requests
   * @param {Function} callback - Callback function with access request data
   */
  onAccessRequest(callback) {
    this.addListener("access_request_received", callback);
  }

  /**
   * Listen for access granted notifications
   * @param {Function} callback - Callback function
   */
  onAccessGranted(callback) {
    this.addListener("access_granted", callback);
  }

  /**
   * Listen for access rejected notifications
   * @param {Function} callback - Callback function
   */
  onAccessRejected(callback) {
    this.addListener("access_rejected", callback);
  }

  /**
   * Listen for permission updates
   * @param {Function} callback - Callback function with permission data
   */
  onPermissionUpdated(callback) {
    this.addListener("permission_updated", callback);
  }

  /**
   * Listen for user typing events
   * @param {Function} callback - Callback function with typing data
   */
  onUserTyping(callback) {
    this.addListener("user_typing", callback);
  }

  /**
   * Emit typing event
   * @param {string} chatId - The chat ID
   * @param {string} userId - The user ID
   * @param {boolean} isTyping - Whether user is typing
   */
  emitTyping(chatId, userId, isTyping) {
    if (this.socket?.connected) {
      this.socket.emit("user_typing", { chatId, userId, isTyping });
    }
  }

  /**
   * Add a listener for a specific event
   * @private
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   */
  addListener(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
      // Set up socket listener only once
      this.socket?.on(eventName, (data) => {
        this.listeners.get(eventName).forEach((cb) => cb(data));
      });
    }
    this.listeners.get(eventName).push(callback);
  }

  /**
   * Remove a specific listener
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function to remove
   */
  removeListener(eventName, callback) {
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Setup core socket event listeners
   * @private
   */
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("disconnect", () => {
      this.isConnected = false;
      console.log("[Socket] Disconnected");
    });

    this.socket.on("reconnect", () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log("[Socket] Reconnected");
    });

    this.socket.on("reconnect_attempt", () => {
      this.reconnectAttempts++;
      console.log(
        `[Socket] Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`,
      );
    });

    this.socket.on("error", (error) => {
      console.error("[Socket] Error:", error);
    });
  }

  /**
   * Disconnect the socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this.listeners.clear();
      this.socket = null;
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
    };
  }
}

// Singleton instance
const socketManager = new SocketManager();

export default socketManager;
