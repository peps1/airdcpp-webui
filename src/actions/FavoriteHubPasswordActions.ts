'use strict';
//@ts-ignore
import Reflux from 'reflux';

import SocketService from 'services/SocketService';

import ConfirmDialog from 'components/semantic/ConfirmDialog';
import { PasswordDialog } from 'components/semantic/InputDialog';

import FavoriteHubConstants from 'constants/FavoriteHubConstants';
import IconConstants from 'constants/IconConstants';

import * as API from 'types/api';
import * as UI from 'types/ui';


const sendPassword = (
  hub: API.FavoriteHubEntry, 
  password: string | null, 
  action: UI.AsyncActionType<API.FavoriteHubEntry>
) => {
  return SocketService.patch(FavoriteHubConstants.HUBS_URL + '/' + hub.id, { password: password })
    .then(() => 
      action.completed(hub))
    .catch((error) => 
      action.failed(error, hub)
    );
};

const hasPassword = (entry: API.FavoriteHubEntry) => entry.has_password;
const noPassword = (entry: API.FavoriteHubEntry) => !hasPassword(entry);

const FavoriteHubPasswordActions = Reflux.createActions([
  { 'create': { 
    asyncResult: true, 
    children: [ 'saved' ], 
    displayName: 'Set password',
    access: API.AccessEnum.FAVORITE_HUBS_EDIT, 
    icon: IconConstants.LOCK,
    filter: noPassword,
  } },
  { 'change': { 
    asyncResult: true, 
    children: [ 'saved' ], 
    displayName: 'Change password',
    access: API.AccessEnum.FAVORITE_HUBS_EDIT, 
    icon: IconConstants.EDIT,
    filter: hasPassword,
  } },
  { 'remove': { 
    asyncResult: true, 
    children: [ 'confirmed' ], 
    displayName: 'Remove password',
    access: API.AccessEnum.FAVORITE_HUBS_EDIT, 
    icon: IconConstants.REMOVE,
    filter: hasPassword,
  } },
]);

FavoriteHubPasswordActions.create.listen(function (
  this: UI.EditorActionType<API.FavoriteHubEntry>, 
  hub: API.FavoriteHubEntry
) {
  const text = 'Set password for the hub ' + hub.name;
  PasswordDialog('Set password', text, this.saved.bind(this, hub));
});

FavoriteHubPasswordActions.create.saved.listen(function (hub: API.FavoriteHubEntry, password: string) {
  sendPassword(hub, password, FavoriteHubPasswordActions.create);
});

FavoriteHubPasswordActions.change.listen(function (
  this: UI.EditorActionType<API.FavoriteHubEntry>, 
  hub: API.FavoriteHubEntry
) {
  const text = 'Enter new password for the hub ' + hub.name;
  PasswordDialog('Change password', text, this.saved.bind(this, hub));
});

FavoriteHubPasswordActions.change.saved.listen(function (hub: API.FavoriteHubEntry, password: string) {
  sendPassword(hub, password, FavoriteHubPasswordActions.change);
});

FavoriteHubPasswordActions.remove.listen(function (
  this: UI.ConfirmActionType<API.FavoriteHubEntry>, 
  hub: API.FavoriteHubEntry
) {
  const options = {
    title: this.displayName,
    content: 'Are you sure that you want to reset the password of the hub ' + hub.name + '?',
    icon: this.icon,
    approveCaption: 'Remove password',
    rejectCaption: `Don't remove`,
  };

  ConfirmDialog(options, this.confirmed.bind(this, hub));
});

FavoriteHubPasswordActions.remove.confirmed.listen(function (hub: API.FavoriteHubEntry) {
  sendPassword(hub, null, FavoriteHubPasswordActions.remove);
});

export default FavoriteHubPasswordActions;