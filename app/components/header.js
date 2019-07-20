// @flow

import React from 'react';
import styled from 'styled-components';

import { TextComponent } from './text';
import { Divider } from './divider';
import { RowComponent } from './row';
import { StatusPillContainer } from '../containers/status-pill';

const Wrapper = styled.div`
  height: ${props => props.theme.headerHeight};
  display: flex;
  flex-direction: row;
  width: 100%;
  background-color: ${props => props.theme.colors.background};
`;

const TitleWrapper = styled.div`
  width: 100%;
  height: ${props => props.theme.headerHeight};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding-top: 10px;
  padding-left: ${props => props.theme.layoutPaddingLeft};
  padding-right: ${props => props.theme.layoutPaddingRight};
`;

const TitleRow = styled(RowComponent)`
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Title = styled(TextComponent)`
  font-size: ${props => `${props.theme.fontSize.large}em`};
  margin-top: 10px;
  margin-bottom: 10px;
  text-transform: capitalize;
  letter-spacing: 0.25px;
  font-weight: ${props => String(props.theme.fontWeight.bold)};
  color: ${props => props.theme.colors.headerTitle};
`;

type Props = {
  title: string,
};

export const HeaderComponent = ({ title }: Props) => (
  <Wrapper id='header'>
    <TitleWrapper>
      <TitleRow alignItems='center' justifyContent='space-around'>
        <Title value={title} />
        <StatusPillContainer />
      </TitleRow>
      <Divider opacity={0.2} />
    </TitleWrapper>
  </Wrapper>
);
