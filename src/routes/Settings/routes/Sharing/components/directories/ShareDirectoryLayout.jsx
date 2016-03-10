import React from 'react';

import ShareRootActions from 'actions/ShareRootActions';
import ShareRootStore from 'stores/ShareRootStore';

import VirtualTable from 'components/table/VirtualTable';
import { SizeCell, ActionCell, DurationCell } from 'components/table/Cell';
import { Column } from 'fixed-data-table';

import ProfileDropdown from './ProfileDropdown';
import RefreshCell from './RefreshCell';

import AccessConstants from 'constants/AccessConstants';
import LoginStore from 'stores/LoginStore';


const ShareDirectoryLayout = React.createClass({
	render() {
		const editAccess = LoginStore.hasAccess(AccessConstants.SETTINGS_EDIT);
		return (
			<VirtualTable
				store={ ShareRootStore }
				customFilter={ <ProfileDropdown/> }
			>
				<Column
					name="Path"
					width={200}
					columnKey="path"
					cell={
						<ActionCell 
							actions={ ShareRootActions }
							ids={[ 'edit', 'remove' ]}
						/> 
					}
					flexGrow={10}
				/>
				<Column
					name="Size"
					width={60}
					columnKey="size"
					cell={ <SizeCell/> }
					flexGrow={2}
				/>
				{/*<Column
					name="Content"
					width={150}
					columnKey="content"
				/>*/}
				<Column
					name="Virtual name"
					width={100}
					columnKey="virtual_name"
					flexGrow={5}
				/>
				<Column
					name="Profiles"
					width={65}
					columnKey="profiles"
				/>
				<Column
					name="Last refreshed"
					width={80}
					flexGrow={3}
					columnKey="last_refresh_time"
					cell={ editAccess ? <RefreshCell/> : <DurationCell/> }
				/>
			</VirtualTable>
		);
	}
});

export default ShareDirectoryLayout;