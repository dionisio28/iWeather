import React from 'react';
import {StatusBar} from 'react-native';
import {HeaderContaienr, TextMedium} from './styles';

const Header = ({title, isLoading}) => {
  return (
    <HeaderContaienr>
    <StatusBar backgroundColor={'#1685c9'} />
      <TextMedium>{isLoading ? 'Buscando Localização' : title}</TextMedium>
    </HeaderContaienr>
  );
};

export default Header;
