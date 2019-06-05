// @flow
import React from 'react';
import styled, { withTheme } from 'styled-components';

import anonLogo from '../assets/images/logo.png';

const AnonImg = styled.img`
  height: 100%;
  width: 100%;
`;

export const AnonLogo = () => (
  <AnonImg src={anonLogo} />
);
