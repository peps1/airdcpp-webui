'use strict';

import React from 'react';

import { Link, IndexLink } from 'react-router';
import CountLabel from 'components/CountLabel';


const IconMenuItem = React.createClass({
	propTypes: {
		urgencies: React.PropTypes.object,
		icon: React.PropTypes.string.isRequired,
		title: React.PropTypes.node.isRequired,
	},

	contextTypes: {
		history: React.PropTypes.object.isRequired
	},

	render() {
		const { urgencies, icon, title, indexLink, ...props } = this.props;
		const LinkElement = indexLink ? IndexLink : Link;

		return (
			<LinkElement { ...props }>
				<CountLabel className="mini" urgencies={urgencies}/>
				<i className={ icon + ' icon' }></i>
				{ title }
			</LinkElement>
		);
	},
});


const TextMenuItem = ({ title, indexLink, ...props }) => (
	indexLink ? (
			<IndexLink { ...props }>
				{title}
			</IndexLink>
		) : (
			<Link { ...props }>
				{title}
			</Link>
		)
);

TextMenuItem.contextTypes = {
	history: React.PropTypes.object.isRequired
};


const getMenuItem = (onClick, item, ContentElement) => {
	const { url, className, unreadInfoStore, ...other } = item;
	return (
		<ContentElement 
			key={ url }
			to={ url } 
			activeClassName="active" 
			onClick={ onClick ? (evt) => onClick(url, evt) : undefined }
			className={ 'item ' + (className ? className : '') }
			indexLink={ url === '/' }
			urgencies={ unreadInfoStore ? unreadInfoStore.getTotalUrgencies() : null }
			{ ...other }
		/>
	);
};

const getIconMenuItem = (onClick, item) => {
	return getMenuItem(onClick, item, IconMenuItem);
};

const getTextMenuItem = (onClick, item) => {
	return getMenuItem(onClick, item, TextMenuItem);
};

export { getIconMenuItem, getTextMenuItem };