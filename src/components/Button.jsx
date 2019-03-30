/* eslint-disable react/prop-types */
import React from 'react';

const Button = ({ onClick, className = '', children }) =>
  (
    <button onClick={onClick} className={className} type="button">
      {children}
    </button>
  );

const withLoading = ComponentLoaded => ({ isLoading, ...rest }) => {
  if (isLoading) {
    return <div>Загрузка ...</div>;
  }
  return <ComponentLoaded {...rest} />;
};

const ButtonWithLoading = withLoading(Button);

export default ButtonWithLoading;
