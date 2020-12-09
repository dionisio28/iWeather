import styled from 'styled-components/native';
import {Dimensions} from 'react-native';

export const TextHight = styled.Text`
  color: #fff;
  font-size: 58px;
  margin: 8px;
`;

export const TextMedium = styled.Text`
  color: #fff;
  font-size: 18px;
  padding: 2px;
  font-weight: 700;
`;

export const SubTitle = styled.Text`
  color: #fff;
  font-size: 20px;
  padding: 16px;
  font-weight: 700;
`;

export const MainContainer = styled.SafeAreaView`
 background-color: #2d98da;
 flex: 1;
 justify-content: flex-start
`;

export const ContainerWeather = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-start;
  margin-top: 8px;
  flex: 1;
`;

export const ContainerInfo = styled.View`
  margin: 8px;
`;

export const ContainerRow = styled.View`
  padding: 16px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

export const HeaderContaienr = styled.View`
  background-color: #1685c9;
  padding: 12px;
  align-items: center;
  border-bottom-left-radius: 25px;
  border-bottom-right-radius: 25px;
`;

export const TextItem = styled.Text`
  color: #FFF;
  padding: 1px;
  font-size: 16px;
  font-weight: 700
`

export const ContainerItem = styled.View`
  padding: 10px;
  justify-content: center;
  align-items: center;
`