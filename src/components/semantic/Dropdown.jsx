import React from 'react';
import classNames from 'classnames';

const Dropdown = React.createClass({
	propTypes: {
		/**
		 * Node to render as caption
		 */
		caption: React.PropTypes.node,

		/**
		 * Dropdown icon to display
		 * If caption isn't specified, the icon will be used as main trigger
		 */ 
		icon: React.PropTypes.string,

		/**
		 * Direction to render
		 */
		direction: React.PropTypes.string,

		/**
		 * Returns DOM node used for checking whether the dropdown can fit on screen
		 */
		contextGetter: React.PropTypes.func,
	},

	componentDidMount() {
		const dom = React.findDOMNode(this);

		const settings = {
			direction: this.props.direction
		};

		if (this.props.contextGetter) {
			settings['context'] = this.props.contextGetter();
		}

		$(dom).dropdown(settings);
	},

	getDefaultProps() {
		return {
			caption: null,
			className: '',
			icon: 'angle down',
			direction: 'auto'
		};
	},

	render: function () {
		const className = classNames(
			'ui',
			'dropdown',
			'item',
			this.props.className,
			{ 'icon': !this.props.caption	},
		);

		return (
			<div className={ className }>
				{this.props.caption}
				{this.props.icon ? <i className={ this.props.icon + ' icon' }></i> : null }
				<div className="menu">
					{ this.props.children }
				</div>
			</div>
		);
	}
});

export default Dropdown;
