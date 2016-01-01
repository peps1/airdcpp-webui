'use strict';

import React from 'react';

import ListBrowser from './ListBrowser';

import { RouteContext } from 'react-router';

import Loader from 'components/semantic/Loader';
import Message from 'components/semantic/Message';

import ValueFormat from 'utils/ValueFormat';
import { FooterItem, SessionFooter } from 'routes/Sidebar/components/SessionFooter';
import BrowserUtils from 'utils/BrowserUtils';

const FilelistSession = React.createClass({
	mixins: [ RouteContext ],

	stateToString(state) {
		switch (state) {
			case 'download_pending': return 'Download pending';
			case 'downloading': return 'Downloading';
			case 'loading': return 'Loading';
			default: return 'Loaded';
		}
	},

	render() {
		const state = this.props.item.state.id;

		if (state !== 'loaded') {
			return <Loader text={ this.stateToString(state) }/>;
		}

		const { user, location } = this.props.item;
		if (user.flags.indexOf('offline') !== -1) {
			return (
				<Message 
					title="User offline"
					description="You will be able to continue browsing when the user comes back online"
				/>
			);
		}

		let locationText = location.type.str;
		if (locationText.length > 0) {
			locationText = ValueFormat.formatSize(this.props.item.location.size) + ' (' + locationText + ')';
		}

		return (
			<div className="filelist-session">
				<ListBrowser
					{ ...this.props }
				/>
				{ !BrowserUtils.useMobileLayout() ? (
					<SessionFooter>
						<FooterItem label="Directory size" text={ locationText }/>
						<FooterItem label="Total list size" text={ ValueFormat.formatSize(this.props.item.total_size) }/>
					</SessionFooter>
				) : null }
			</div>
		);
	},
});

export default FilelistSession;
