import Reflux from 'reflux';

import PrivateChatConstants from 'constants/PrivateChatConstants';
import PrivateChatActions from 'actions/PrivateChatActions';

import MessageStoreDecorator from 'decorators/store/MessageStoreDecorator';
import PrivateChatSessionStore from 'stores/PrivateChatSessionStore';

import AccessConstants from 'constants/AccessConstants';


const PrivateChatMessageStore = Reflux.createStore({
	getInitialState: function () {
		return this.getMessages();
	},

	onSocketConnected(addSocketListener) {
		const url = PrivateChatConstants.MODULE_URL;
		addSocketListener(url, PrivateChatConstants.MESSAGE, this._onChatMessage);
		addSocketListener(url, PrivateChatConstants.STATUS, this._onStatusMessage);

		addSocketListener(url, PrivateChatConstants.SESSION_REMOVED, this._onSessionRemoved);
		addSocketListener(url, PrivateChatConstants.SESSION_UPDATED, this._onSessionUpdated);
	},
});

export default MessageStoreDecorator(PrivateChatMessageStore, PrivateChatActions, PrivateChatSessionStore, AccessConstants.PRIVATE_CHAT_VIEW)
;
