
import React, { PureComponent } from 'react';
import ReactMarkdown from 'react-markdown';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { PROP_TYPES } from 'constants';
import DocViewer from '../docViewer';
import './styles.scss';
import ThemeContext from '../../../../../../ThemeContext';

// Import any necessary remark or rehype plugins if you need them
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown support

class Message extends PureComponent {
  render() {
    const { docViewer, linkTarget } = this.props;
    const sender = this.props.message.get('sender');
    const text = this.props.message.get('text');
    const customCss = this.props.message.get('customCss') && this.props.message.get('customCss').toJS();

    if (customCss && customCss.style === 'class') {
      customCss.css = customCss.css.replace(/^\./, '');
    }

    const { userTextColor, userBackgroundColor, assistTextColor, assistBackgoundColor } = this.context;
    let style;
    if (sender === 'response' && customCss && customCss.style === 'class') {
      style = undefined;
    } else if (sender === 'response' && customCss && customCss.style) {
      style = { cssText: customCss.css };
    } else if (sender === 'response') {
      style = { color: assistTextColor, backgroundColor: assistBackgoundColor };
    } else if (sender === 'client') {
      style = { color: userTextColor, backgroundColor: userBackgroundColor };
    }

    return (
      <div
        className={sender === 'response' && customCss && customCss.style === 'class' ?
          `rw-response ${customCss.css}` :
          `rw-${sender}`}
        style={style}
      >
        <div className="rw-message-text">
          {sender === 'response' ? (
            <ReactMarkdown
              className="rw-markdown"
              remarkPlugins={[remarkGfm]} // Add remark plugins if needed
              components={{
                // Customizing link rendering
                a: ({ href, children }) => 
                  docViewer ? (
                    <DocViewer src={href}>{children}</DocViewer>
                  ) : (
                    <a
                      href={href}
                      target={linkTarget || '_blank'}
                      rel="noopener noreferrer"
                      onMouseUp={e => e.stopPropagation()}
                    >
                      {children}
                    </a>
                  )
              }}
            >
              {text}
            </ReactMarkdown>
          ) : (
            text
          )}
        </div>
      </div>
    );
  }
}

Message.contextType = ThemeContext;
Message.propTypes = {
  message: PROP_TYPES.MESSAGE,
  docViewer: PropTypes.bool,
  linkTarget: PropTypes.string
};

Message.defaultProps = {
  docViewer: false,
  linkTarget: '_blank'
};

const mapStateToProps = state => ({
  linkTarget: state.metadata.get('linkTarget'),
  docViewer: state.behavior.get('docViewer')
});

export default connect(mapStateToProps)(Message);
