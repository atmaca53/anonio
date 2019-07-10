// @flow

import React, { PureComponent, Fragment } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import styled, { withTheme } from 'styled-components';
import uuid from 'uuid/v4';

import { TextComponent } from '../components/text';

import ConsoleSymbolDark from '../assets/images/console_anon_dark.png';
import ConsoleSymbolLight from '../assets/images/console_anon_light.png';
import { DARK } from '../constants/themes';

const ABOUT0_TITLE = 'Privacy by default';
const ABOUT0_CONTENT = 'Anonio is a privacy first wallet.\n\n What this means is that when sending through Anonio, ' +
'it will present you with privacy addresses (z-address) as the preferred method of interaction rather than ' +
'transparent addresses (t-address).\n\n' +
'But rest assured, transparent addresses are still readily accessible and available for use directly within Anonio.'
;

const ABOUT1_TITLE = 'Storing Private Transactions';
const ABOUT1_CONTENT = 'Currently, there is no easy way to retrieve private send transactions from the blockchain ' +
'to create an historic list of transactions for privacy addresses to view within Anonio.\n\n' +
'Instead, this functionality is provided by ' +
'a local store which holds the necessary information but it does mean that private send transactions will only ' +
'be recorded in this store when you first start to use the Anonio wallet.\n\n' + 
'Receive transactions can be retrieved using an rpc command, although this isn\'t a trivial task. In practice ' +
'what this means is that you can view your historic private transactions for receive, but not for send.\n\n' + 
'For privacy reasons Anonio has no knowledge of, and no way of discovering, any previously sent private transactions.'
;

const ABOUT2_TITLE = 'About Anon';
const ABOUT2_CONTENT = `
ANON is a cryptocurrency that is crafted to build upon the advances of Bitcoin and other cryptocurrency technologies, and add its own distinct permutations as it evolves. ANON has the dual objective of contributing to individual financial sovereignty and protecting transactional privacy in the digital realm. It is a global collaboration comprised of professionals and leaders in full stack development, cryptocurrency journalism, blockchain engineering, media, market trading, business management, and economics. The ANON project was originally announced in April 2018 as “Anonymous Bitcoin”. Prior to launch in September 2018, the “Bitcoin” moniker was discarded, and the coin became more widely known by its ticker “ANON”. 

ANON proudly provides resources and support for our worldwide community of pioneers to connect and exchange cryptocurrency. ANON also encourages the discussion of strategy and development, the sharing of ideas, and general exploration of wider global trends on our social platforms. Supporters, if so inclined,  can effectively and meaningfully help contribute to shaping the future in the emerging crypto-financial sphere within ANON’s ecosystem: Developmental pathing decisions ultimately rest with the team, however the ANON team works to actively collaborate with its community. Furthermore, live capability is built-in to the project, so that tertiary community proposals can be automatically funded  - giving our supporters tangible means to help contribute to the success of ANON. Find links to socials online at http://anoncrypto.io.
`;

const addLineBreaks = string =>
  string.split('\n').map((text, index) => (
    <React.Fragment key={`${text}-${index}`}>
      {text}
      <br />
    </React.Fragment>
  ));

const Wrapper = styled.div`
  max-height: 100%;
  overflow-y: auto;
  background-color: ${props => props.theme.colors.consoleBg};
  border: 1px solid ${props => props.theme.colors.consoleBorder};
  margin-top: ${props => props.theme.layoutContentPaddingTop};
  border-radius: ${props => props.theme.boxBorderRadius};
  padding: 30px;
`;

const AboutInnerWrapper = styled.div`
  margin-bottom: 50px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AboutTitle = styled(TextComponent)`
  text-transform: uppercase;
  color: ${props => props.theme.colors.transactionsDate};
  font-size: ${props => `${props.theme.fontSize.regular * 0.9}em`};
  font-weight: ${props => String(props.theme.fontWeight.bold)};
  margin-bottom: 5px;
`;

const AboutContent = styled(TextComponent)`
  margin-bottom: 30px;
  margin-top: 15px;
  font-weight: 300;
  letter-spacing: 0.5px;
  line-height: 1.4;
`;

type Props = {
  theme: AppTheme,
};

type State = {
  log: string,
};

class Component extends PureComponent<Props, State> {

  componentDidMount() {
    // ipcRenderer.on('anond-log', (event: empty, message: string) => {
    //   this.setState(() => ({ log: initialLog + message }));
    // });
  }

  componentWillUnmount() {
    // ipcRenderer.removeAllListeners('anond-log');
  }

  render() {
    return (
      <div>
        <Wrapper id='console-wrapper'>
          <Fragment>
            <AboutInnerWrapper>
              <AboutTitle value={ABOUT0_TITLE} />
              <AboutContent value={addLineBreaks(ABOUT0_CONTENT)} />
            </AboutInnerWrapper>
          </Fragment>
        </Wrapper>
        <Wrapper>
        <Fragment>
          <AboutInnerWrapper>
            <AboutTitle value={ABOUT1_TITLE} />
            <AboutContent value={addLineBreaks(ABOUT1_CONTENT)} />
          </AboutInnerWrapper>
        </Fragment>
        </Wrapper>
        <Wrapper>
        <Fragment>
          <AboutInnerWrapper>
            <AboutTitle value={ABOUT2_TITLE} />
            <AboutContent value={addLineBreaks(ABOUT2_CONTENT)} />
          </AboutInnerWrapper>
        </Fragment>
        </Wrapper>
      </div>
  );
  }
}

export const AboutView = withTheme(Component);
