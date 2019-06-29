// @flow

import React, { type Element } from 'react';
import styled from 'styled-components';

import { ErrorModalComponent } from './error-modal';

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: ${props => `calc(100vh - ${props.theme.headerHeight})`};
  background-color: ${props => props.theme.colors.background};
  width: 100%;
  overflow: auto;
  padding-bottom: 20px;
  padding-left: 2rem;
  padding-right: 2rem;

  ::-webkit-scrollbar {
    display: none;
  }
`;

type Props = {
  children: Element<*>,
  closeErrorModal: () => void,
  isErrorModalVisible: boolean,
  error: string,
};

export const LayoutComponent = (props: Props) => {
  const {
    children, error, isErrorModalVisible, closeErrorModal,
  } = props;

  return (
    <Layout id='layout'>
      {children}
      <ErrorModalComponent
        message={error}
        isVisible={isErrorModalVisible}
        onRequestClose={closeErrorModal}
      />
    </Layout>
  );
};
