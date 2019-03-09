'use strict';
import React from 'react';
import classNames from 'classnames';

import { MentionsInput, Mention, OnChangeHandlerFunc } from 'react-mentions';
import Dropzone, { DropFilesEventHandler } from 'react-dropzone';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { loadSessionProperty, saveSessionProperty, useMobileLayout } from 'utils/BrowserUtils';
import ChatCommandHandler from './ChatCommandHandler';
import NotificationActions from 'actions/NotificationActions';

import UserConstants from 'constants/UserConstants';
import SocketService from 'services/SocketService';
import { ChatLayoutProps } from 'routes/Sidebar/components/chat/ChatLayout';

import * as API from 'types/api';
import * as UI from 'types/ui';

import { ErrorResponse } from 'airdcpp-apisocket';
import FilePreviewDialog from './FilePreviewDialog';
import TempShareDropdown from './TempShareDropdown';
import i18next from 'i18next';
import { translate, toI18nKey } from 'utils/TranslationUtils';
import { formatSize } from 'utils/ValueFormat';
import LoginStore from 'stores/LoginStore';
import AccessConstants from 'constants/AccessConstants';
import Icon from 'components/semantic/Icon';
import Button from 'components/semantic/Button';

const ENTER_KEY_CODE = 13;


const getMentionFieldStyle = (mobileLayout: boolean) => {
  return {
    suggestions: {
      list: {
        width: 200,
        overflow: 'auto',
        position: 'absolute',
        bottom: 3,
        left: 17,
        backgroundColor: 'white',
        border: '1px solid rgba(0,0,0,0.15)',
        fontSize: 10,
      },

      item: {
        padding: '5px 15px',
        borderBottom: '1px solid rgba(0,0,0,0.15)',

        '&focused': {
          background: 'rgba(0,0,0,.03)',
          color: 'rgba(0,0,0,.95)',
        },
      },
    },
    input: {
      minHeight: !mobileLayout ? 63 : 0,
      maxHeight: 200,
      margin: 0,
    },
  };
};

export interface MessageComposerProps extends 
  Pick<ChatLayoutProps, 'chatApi' | 'session' | 'chatActions' | 'handleFileUpload'> {

  t: i18next.TFunction;
}

const getStorageKey = (props: RouteComponentProps) => {
  return `last_message_${props.location.pathname}`;
};

const loadState = (props: RouteComponentProps) => {
  return {
    text: loadSessionProperty(getStorageKey(props), ''),
  };
};


const saveState = (state: State, props: RouteComponentProps) => {
  saveSessionProperty(getStorageKey(props), state.text);
};

const userToMention = (user: API.HubUser) => {
  return {
    id: user.cid,
    display: user.nick,
  };
};

interface State {
  text: string;
  file: File | null;
}

class MessageComposer extends React.Component<MessageComposerProps & RouteComponentProps> {
  /*static propTypes = {
    // Actions for this chat session type
    actions: PropTypes.object.isRequired,
    session: PropTypes.object.isRequired,
  };*/

  dropzoneRef = React.createRef<Dropzone>();

  handleCommand = (text: string) => {
    let command, params;

    {
      // Parse the command
      const whitespace = text.indexOf(' ');
      if (whitespace === -1) {
        command = text.substr(1);
      } else {
        command = text.substr(1, whitespace - 1);
        params = text.substr(whitespace + 1);
      }
    }

    ChatCommandHandler(this.props).handle(command, params);
  }

  handleSend = (text: string) => {
    const { chatApi, session } = this.props;
    chatApi.sendMessage(session, text);
  }

  componentWillUnmount() {
    saveState(this.state, this.props);
  }

  componentDidUpdate(prevProps: RouteComponentProps, prevState: State) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      saveState(prevState, prevProps);
      this.setState(loadState(this.props));
    }
  }

  handleChange: OnChangeHandlerFunc = (event, markupValue, plainValue) => {
    this.setState({ 
      text: plainValue 
    });
  }

  onKeyDown = (event: React.KeyboardEvent) => {
    if (event.keyCode === ENTER_KEY_CODE && !event.shiftKey) {
      event.preventDefault();
      this.sendText();
    }
  }

  sendText = () => {
    // Trim only from end to allow chat messages such as " +help" to be
    // sent to other users
    // This will also prevent sending empty messages
    const text = this.state.text.replace(/\s+$/, '');

    if (text) {
      if (text[0] === '/') {
        this.handleCommand(text);
      }

      this.handleSend(text);
    }

    this.setState({ text: '' });
  }

  findUsers = (value: string, callback: (data: any) => void) => {
    const { session } = this.props;
    SocketService.post(UserConstants.SEARCH_NICKS_URL, { 
      pattern: value, 
      max_results: 5,
      hub_urls: session.hub_url ? [ session.hub_url ] : undefined,
    })
      .then((users: API.HubUser[]) => callback(users.map(userToMention)))
      .catch((error: ErrorResponse) => 
        console.log(`Failed to fetch suggestions: ${error}`)
      );
  }
  
  appendText = (text: string) => {
    let newText = this.state.text;
    if (newText) {
      newText += ' ';
    }
    newText += text;

    this.setState({
      text: newText
    });
  }

  onDropFile: DropFilesEventHandler = (acceptedFiles, rejectedFiles) => {
    if (!acceptedFiles.length) {
      return;
    }

    const { t } = this.props;
    const file = acceptedFiles[0];
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      NotificationActions.error({
        title: t(toI18nKey('fileTooLarge', UI.Modules.COMMON), {
          defaultValue: 'File is too large (maximum size is {{maxSize}})',
          replace: {
            maxSize: formatSize(maxSize, t)
          }
        })
      });

      return;
    }

    this.setState({
      file
    });
  }

  onUploadFile = async (file: File) => {
    this.resetFile();

    try {
      const { handleFileUpload } = this.props;
      const res = await handleFileUpload(file);

      this.appendText(res.magnet);
    } catch (e) {
      NotificationActions.apiError('Failed to send the file', e);
    }
  }

  handleClickUpload = () => {
    if (this.dropzoneRef.current) {
      this.dropzoneRef.current.open();
    }
  }

  resetFile = () => {
    this.setState({
      file: null,
    });
  }

  state: State = {
    ...loadState(this.props),
    file: null,
  };

  render() {
    const mobile = useMobileLayout();
    const className = classNames(
      'ui form composer',
      { small: mobile },
      { large: !mobile },
    );

    const textInputProps: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'onSelect'> = {
      autoFocus: !mobile,
    };

    const hasFileUploadAccess = LoginStore.hasAccess(AccessConstants.FILESYSTEM_EDIT) && 
      LoginStore.hasAccess(AccessConstants.SETTINGS_EDIT);

    const { file, text } = this.state;
    const { t } = this.props;
    return (
      <>
        { !!file && (
          <FilePreviewDialog
            file={ file }
            onConfirm={ this.onUploadFile }
            onReject={ this.resetFile }
            title={ translate('Send file', t, UI.Modules.COMMON) }
          />
        ) }
        <Dropzone
          onDrop={ this.onDropFile }
          ref={ this.dropzoneRef }
          disabled={ !hasFileUploadAccess }
        >
          {({ getRootProps, getInputProps }) => (
            <div 
              className={ className }
              { ...getRootProps({
                onClick: evt => evt.preventDefault()
              }) }
            >
              <input { ...getInputProps() }/>
              <MentionsInput 
                className="input"
                value={ text } 
                onChange={ this.handleChange }
                onKeyDown={ this.onKeyDown }
                style={ getMentionFieldStyle(mobile) }
                { ...textInputProps }
              >
                <Mention 
                  trigger="@"
                  data={ this.findUsers }
                  appendSpaceOnAdd={ false }
                />
              </MentionsInput>
              <Button 
                className="blue large icon send" 
                onClick={ this.sendText }
                caption={ <Icon icon="send"/> }
              />
              { hasFileUploadAccess && (
                <TempShareDropdown
                  handleUpload={ this.handleClickUpload }
                />
              ) }
            </div>
          ) }
        </Dropzone>
      </>
    );
  }
}

const Decorated = withRouter(MessageComposer);

export default Decorated;