import React from 'react';
import Reflux from 'reflux';

import TextDecorator from 'components/TextDecorator';

import SessionLayout from 'routes/Sidebar/components/SessionLayout';

import HubSessionStore from 'stores/HubSessionStore';
import HubActions from 'actions/HubActions';

import TypeConvert from 'utils/TypeConvert';
import AccessConstants from 'constants/AccessConstants';

import { ActionMenu } from 'components/menu/DropdownMenu';
import HubIcon from 'components/icon/HubIcon';


const ItemHandler = {
	itemNameGetter(session) {
		return session.identity.name;
	},

	itemStatusGetter(session) {
		return TypeConvert.hubOnlineStatusToColor(session.connect_state.id);
	},

	itemDescriptionGetter(session) {
		return (
			<TextDecorator
				text={ session.identity.description }
				emojify={ true }
			/>
		);
	},

	itemIconGetter(session) {
		return <HubIcon size="large" hub={session} />;
	},
};

const Hubs = React.createClass({
	mixins: [ Reflux.connect(HubSessionStore, 'hubSessions') ],

	_getActiveId() {
		if (!this.props.params) {
			return null;
		}

		return parseInt(this.props.params['id']);
	},

	render() {
		return (
			<SessionLayout 
				activeId={this._getActiveId()}
				baseUrl="hubs"
				itemUrl="hubs/session"
				location={this.props.location} 
				items={this.state.hubSessions} 
				newButtonCaption="Connect"
				editAccess={ AccessConstants.HUBS_EDIT }
				actions={ HubActions } 
				actionIds={ [ 'reconnect', 'favorite', 'clear' ] }

				unreadInfoStore={ HubSessionStore }
				{ ...ItemHandler }
			>
				{ this.props.children }
			</SessionLayout>
		);
	}
});

export default Hubs;
