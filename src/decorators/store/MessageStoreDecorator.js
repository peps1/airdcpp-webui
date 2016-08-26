import update from 'react-addons-update';

import MessageUtils from 'utils/MessageUtils';
import SocketSubscriptionDecorator from 'decorators/SocketSubscriptionDecorator';


export default function (store, actions, sessionStore, access) {
	let messages = {};

	const addMessage = (sessionId, message) => {
		messages[sessionId] = update(messages[sessionId], { $push: [ message ] });
		store.trigger(messages[sessionId], sessionId);
	};

	const onFetchMessagesCompleted = (sessionId, data) => {
		messages[sessionId] = data;
		store.trigger(messages[sessionId], sessionId);
	};

	const onMessageReceived = (sessionId, message, type) => {
		if (!messages[sessionId]) {
			// Don't store messages before the initial fetch has completed
			return;
		}

		// Messages can arrive simultaneously when the cached messages are fetched, don't add duplicates
		const sectionMessages = messages[sessionId];
		if (sectionMessages.length > 0) {
			const lastMessage = sectionMessages[sectionMessages.length-1];
			if (lastMessage.chat_message ? lastMessage.chat_message.id >= message.id : lastMessage.log_message.id >= message.id) {
				return;
			}
		}

		// Active tab?
		if (!message.is_read && sessionId === sessionStore.getActiveSession()) {
			message.is_read = true;
		}

		addMessage(sessionId, { [type]: message });
	};

	store._onChatMessage = (data, sessionId) => {
		onMessageReceived(sessionId, data, 'chat_message');
	};

	store._onStatusMessage = (data, sessionId) => {
		onMessageReceived(sessionId, data, 'log_message');
	};

	store._onSessionUpdated = (session, sessionId) => {
		// Message limit exceed or messages were cleared?
		messages[sessionId] = MessageUtils.checkSplice(messages[sessionId], session.total_messages);
		store.trigger(messages[sessionId], sessionId);
	};

	store._onSessionRemoved = (session) => {
		delete messages[session.id];
	};

	store.onSocketDisconnected = () => {
		messages = {};
	};

	store.getMessages = () => messages;

	store.listenTo(actions.fetchMessages.completed, onFetchMessagesCompleted);
	return SocketSubscriptionDecorator(store, access);
}
