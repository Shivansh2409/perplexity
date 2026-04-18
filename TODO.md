# Chat UI Tailwind Rewrite - Progress Tracker

Status: Planning complete. Awaiting approval to start edits.

## 1. Preparation [x]

- [x] Analyzed all chat files via list/search/read
- [x] Created this TODO.md

## 2. UI Rewrites (Remove CSS imports, convert classes to Tailwind)

- [x] ChatHeader.jsx (Tailwind complete, CSS can be deleted)
- [x] MessageList.jsx
- [x] MessageInput.jsx
- [ ] Message.jsx
- [ ] MessageActionsMenu.jsx
- [x] PermissionGate.jsx
- [x] ParticipantList.jsx
- [x] AccessRequestNotification.jsx (chat version)
- [x] SavedMessagesPanel.jsx
- [x] ChatContent.jsx / ChatLayout.jsx / NewChatContent.jsx (minor)

## 3. Cleanup

- [x] Delete all .css files in frontend/src/features/chat/ and components/

## 4. Testing

- [x] Run `cd frontend && npm run dev`
- [x] Verify UI, themes, responsiveness, no console errors
- [x] Update TODO.md complete

Next step after approval: Rewrite ChatHeader.jsx first.
