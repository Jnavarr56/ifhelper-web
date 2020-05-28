import React, { useState, useEffect } from 'react';
import { Route } from 'react-router-dom';
import { Fade } from '@material-ui/core';
import PropTypes from 'prop-types';

import { useRouteMatch } from 'react-router-dom';

const RouteWithLayout = props => {
  const { layout: Layout, component: Component, ...rest } = props;

  // const [fadeIn, setFadeIn] = useState(false);
  
  // useEffect(() => {
  //   let timeout = setTimeout(() => setFadeIn(true), 10);
  //   return () => clearTimeout(timeout);
  // }, [])


  // useEffect(() => {
  //   setFadeIn(false);
  //   let timeout = setTimeout(() => setFadeIn(true), 10);
  //   return () => clearTimeout(timeout);
  // }, [ Component ]);

  return (
    <Route
      {...rest}
      render={matchProps => (
        <Layout>
          {/* <Fade timeout={fadeIn ? 1000 : 0} in={fadeIn}>
            <div> */}
              <Component {...matchProps} />
            {/* </div>
          </Fade> */}
        </Layout>
      )}
    />
  );
};

RouteWithLayout.propTypes = {
  component: PropTypes.any.isRequired,
  layout: PropTypes.any.isRequired,
  path: PropTypes.string
};

export default RouteWithLayout;
