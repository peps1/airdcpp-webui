import React from 'react';
import Modal from 'components/semantic/Modal';

import { PriorityEnum } from 'constants/QueueConstants';
import QueueConstants from 'constants/QueueConstants';
import ShareConstants from 'constants/ShareConstants';
import { default as HistoryConstants, HistoryEnum } from 'constants/HistoryConstants';
import FavoriteDirectoryConstants from 'constants/FavoriteDirectoryConstants';
import IconConstants from 'constants/IconConstants';

import SocketService from 'services/SocketService';
import { RouteContext } from 'react-router';
import HistoryContext from 'mixins/HistoryContext';

import FileBrowserLayout from 'components/filebrowser/FileBrowserLayout';
import { PathList, AccordionTargets } from './DownloadTargets';

import TypeConvert from 'utils/TypeConvert';
import FileUtils from 'utils/FileUtils';

import AccessConstants from 'constants/AccessConstants';
import LoginStore from 'stores/LoginStore';


const MenuItem = ({ active, list, title, onClick }) => (
	<a className={ 'item ' + (active ? 'active' : '')	} onClick={ onClick }>
		{ title }

		{ list ? (
			<div className="ui label"> { list.length } </div>
			) : null }
	</a>
);

const DownloadDialog = React.createClass({
	mixins: [ RouteContext, HistoryContext ],
	propTypes: {
		/**
		 * Function handling the path selection. Receives the selected path as argument.
		 * Required
		 */
		downloadHandler: React.PropTypes.func,

		/**
		 * Information about the item to download
		 * Required
		 */
		itemInfo: React.PropTypes.shape({
			path: React.PropTypes.string,
			dupe: React.PropTypes.number,
			name: React.PropTypes.string,
			type: React.PropTypes.object
		}),
	},

	getInitialState() {
		return {
			active: 'history',
			share_paths: [],
			dupe_paths: [],
			favorite_paths: [],
			history_paths: []
		};
	},

	fetchPaths(requestPath, stateId) {
		SocketService.get(requestPath).then(data => this.setState({ [stateId]: data })).catch(error => console.error('Failed to fetch paths', requestPath, error.message));
	},

	fetchDupePaths(requestPath) {
		const { itemInfo } = this.props;

		let data = {};
		if (FileUtils.isDirectory(itemInfo.path)) {
			data['path'] = itemInfo.path;
		} else {
			data['tth'] = itemInfo.tth;
		}

		SocketService.post(requestPath, data).then(data => this.setState({ 
			dupe_paths: this.state.dupe_paths.concat(data.map(path => FileUtils.getParentPath(path, FileUtils)))
		})).catch(error => console.error('Failed to fetch dupe paths', requestPath, error.message));
	},

	componentDidMount() {
		this.fetchPaths(ShareConstants.GROUPED_ROOTS_GET_URL, 'share_paths');
		this.fetchPaths(FavoriteDirectoryConstants.FAVORITE_DIRECTORIES_URL, 'favorite_paths');
		this.fetchPaths(HistoryConstants.HISTORY_ITEMS_URL + '/' + HistoryEnum.HISTORY_DOWNLOAD_DIR, 'history_paths');

		const { itemInfo } = this.props;
		const dupeName = TypeConvert.dupeToStringType(itemInfo.dupe);
		if (dupeName.indexOf('queue') > -1) {
			this.fetchDupePaths(QueueConstants.QUEUE_DUPE_PATHS_URL);
		}

		if (dupeName.indexOf('share') > -1) {
			this.fetchDupePaths(ShareConstants.SHARE_DUPE_PATHS_URL);
		}
	},

	handleDownload(path) {
		this.props.downloadHandler({
			target_name: this.props.itemInfo.name, // possibly allow changing this later...
			target_directory: path,
			target_type: 0,
			priority: PriorityEnum.DEFAULT
		});

		this.refs.modal.hide();
	},

	getComponent() {
		switch (this.state.active) {
			case 'shared': return <AccordionTargets groupedPaths={ this.state.share_paths } downloadHandler={ this.handleDownload }/>;
			case 'favorites': return <AccordionTargets groupedPaths={ this.state.favorite_paths } downloadHandler={ this.handleDownload }/>;
			case 'history': return <PathList paths={ this.state.history_paths } downloadHandler={ this.handleDownload }/>;
			case 'dupes': return <PathList paths={ this.state.dupe_paths } downloadHandler={ this.handleDownload }/>;
			case 'browse': return <FileBrowserLayout initialPath={ "" } itemIcon="green download" itemIconClickHandler={ this.handleDownload }/>;
			default: return <div/>;
		}
	},

	render: function () {
		const sections = [
			{
				name: 'Previous',
				key: 'history',
				list: this.state.history_paths
			}, {
				name: 'Shared',
				key: 'shared',
				list: this.state.share_paths
			}, {
				name: 'Favorites',
				key: 'favorites',
				list: this.state.favorite_paths
			}, {
				name: 'Dupes',
				key: 'dupes',
				list: this.state.dupe_paths
			}
		];

		if (LoginStore.hasAccess(AccessConstants.FILESYSTEM_VIEW)) {
			sections.push({
				name: 'Browse',
				key: 'browse',
			});
		}

		const menuItems = sections.map(item => {
			return (
				<MenuItem key={ item.key } 
					title={item.name} 
					onClick={ () => this.setState({ active: item.key }) } 
					active={ this.state.active === item.key }
					list={item.list}
				/>
			);
		}, this);

		return (
			<Modal 
				ref="modal" 
				className="download-dialog" 
				title="Download" 
				closable={true} 
				icon={ IconConstants.DOWNLOAD }
				fullHeight={true}
				{...this.props}
			>
				<div className="ui grid">
					<div className="four wide column">
						<div className="ui vertical fluid tabular menu">
							{ menuItems }
						</div>
					</div>
					<div className="twelve wide stretched column">
						<div className="ui segment main-content">
							{ this.getComponent() }
						</div>
					</div>
				</div>
			</Modal>);
	}
});

export default DownloadDialog;