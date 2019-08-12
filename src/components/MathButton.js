import React from 'react';
import PropTypes from 'prop-types';

export default class MathButton extends React.Component {
  handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.props._insertTeX();
  }

  render() {
    return (<div className={this.props.className} onClick={this.handleClick}>
      <svg width="21px" height="14px" viewBox="0 0 21 14">
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g transform="translate(-826.000000, -275.000000)">
            <g transform="translate(824.000000, 270.000000)">
              <g>
                <polygon fill="#8BA1AB" points="15.9941406 13.734375 17.4882812 11.6601562 19.1113281 11.6601562 16.6855469 14.8476562 18.0976562 18 16.6445312 18 15.7597656 15.8378906 14.2011719 18 12.5839844 18 15.0859375 14.71875 13.7207031 11.6601562 15.1738281 11.6601562"></polygon>
                <polygon fill="#8BA1AB" fillRule="nonzero" points="3.40466915 12.0071523 7.04145304 19 12.635831 7 22.0155048 7 22.0155048 5 11.3977788 5 6.90112554 14.796651 4.55223633 10.0071523 2 10.0071523 2 12.0071523"></polygon>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>);
  }
}

MathButton.propTypes = {
  className: PropTypes.string,
  _insertTeX: PropTypes.func,
};
