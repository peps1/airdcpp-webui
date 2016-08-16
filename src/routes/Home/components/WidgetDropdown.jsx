import React from 'react';

//import IconConstants from 'constants/IconConstants';

import Dropdown from 'components/semantic/Dropdown';
import { MenuItemLink } from 'components/semantic/MenuItem';

import WidgetActions from 'actions/WidgetActions';
import WidgetStore from 'stores/WidgetStore';


const getWidgetItem = (widgetInfo, location) => {
	return (
		<MenuItemLink 
			key={ widgetInfo.typeId }
			onClick={ () => WidgetActions.create(widgetInfo, location) }
			icon={ widgetInfo.icon }
		>
			{ widgetInfo.name }
		</MenuItemLink>
	);
};

const WidgetDropdown = ({ widgets, onClickItem, ...widgetProps }, { routerLocation }) => (
	<Dropdown 
		caption="Create widget"
		className="create-widget"
		button={ true }
		//icon={ IconConstants.CREATE }
		{ ...widgetProps }
	>
		{ WidgetStore.widgets.map(widgetInfo => getWidgetItem(widgetInfo, routerLocation)) }
	</Dropdown>
);

WidgetDropdown.contextTypes = {
	routerLocation: React.PropTypes.object.isRequired,
};

export default WidgetDropdown;