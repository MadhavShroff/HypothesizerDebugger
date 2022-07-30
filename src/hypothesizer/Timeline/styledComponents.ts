import styled from 'styled-components';
// import {logo} from './static/forward.svg';
export const scale = 25;

export const defaultDotColor = "#bcebef";
export const mainColor = "#005fae";
export const selected = "#dcf58f";

export const MainLine = styled.div`
  border-radius: 15px;
  width: 29px;
  height: 1000px; 
  border: 3px solid ${mainColor};
  margin: 20px;
  padding: 0px 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const ContentLine = styled.div`
  height: 1000px; 
  border-radius: 5px;
  border: 3px solid ${mainColor};
  margin: 20px 20px 0 0;
  padding: 1px 4px 0px 4px;
`

export const Dot = styled.div`
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  background: ${defaultDotColor};
  border-radius: 50%;
  margin: 0 7.5px 0 7.5px;
  z-index: 5;
`

export const DotContainer = styled.div`
  height: 30px;
  width: 30px;
  justify-content: center;
  display: flex;
  outline: 3px solid ${defaultDotColor};
  align-item: center;
`

export const BigDot = styled(Dot)`
  width: 50px;
  height: 50px;
`

export const TextBox = styled.div`
  width: max-content;
  max-width: inherit;
  height: 30px;
  font-size: 20px;
  text-overflow: ellipsis;
  background: ${defaultDotColor};
  border-radius: 5px;
  position: relative;
  margin: 3px 0 0 0;
  padding: 0 4px 0 4px;
  overflow: hidden;
  white-space: nowrap;
`