import { React } from 'nylas-exports';

import MessageActions from '../flux/actions/pgp-actions';
import PGPStore from '../flux/stores/pgp-store';
import FlowError from '../utils/flow-error';

/**
 * Header component to display the user-readable status of the decryption
 * decryption process from @class{PGPStore}
 *
 * @class MessageLoaderHeader
 */
class MessageLoaderHeader extends React.Component {
  static displayName = 'MessageLoader';

  static propTypes = {
    message: React.PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    // All the methods that depend on `this` instance
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.render = this.render.bind(this);
    this.retryDecryption = this.retryDecryption.bind(this);
    this._onPGPStoreChange = this._onPGPStoreChange.bind(this);

    this.state = PGPStore.getState(this.props.message.id) || {};
  }

  componentDidMount() {
    this._storeUnlisten = PGPStore.listen(this._onPGPStoreChange);

    global.$pgpLoaderHeader = this;
  }

  componentWillUnmount() {
    if (this._storeUnlisten) {
      this._storeUnlisten();
    }
  }

  retryDecryption() {
    MessageActions.retry(this.props.message);
  }

  _onPGPStoreChange(messageId, state) {
    if (messageId === this.props.message.id) {
      this.state = state;
      this.forceUpdate();
    }
  }

  render() {
    let display = true;
    let displayMessage = '';
    let className = 'pgp-message-header';

    if (this.state.decrypting && !this.state.statusMessage) {
      displayMessage = <span>Decrypting message</span>;
    } else if (this.state.decrypting && this.state.statusMessage) {
      className += ' pgp-message-header-info';
      displayMessage = <span>{this.state.statusMessage}</span>;
    } else if (this.state.lastError &&
              ((this.state.lastError instanceof FlowError && this.state.lastError.display) ||
              !(this.state.lastError instanceof FlowError))) {
      className += ' pgp-message-header-error';
      displayMessage = (
        <div>
          <span><b>Error: </b>{this.state.lastError.message}</span>
          <a className="pull-right option" onClick={this.retryDecryption}>Retry Decryption</a>
        </div>
      );
    } else {
      display = false;
    }

    if (display) {
      return <div className={className}>{displayMessage}</div>;
    }
    return <div />;
  }
}

export default MessageLoaderHeader;
