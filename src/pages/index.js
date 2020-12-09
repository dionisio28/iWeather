import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  PermissionsAndroid,
  Alert,
  RefreshControl,
  Image,
  Platform,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import GetLocation from 'react-native-get-location';
import axios from 'axios';
import {
  TextHight,
  TextMedium,
  ContainerWeather,
  MainContainer,
  ContainerInfo,
  ContainerRow,
  SubTitle,
  ContainerItem,
  TextItem,
} from '../components/styles';
import Header from '../components/header';
import lDaysOfWeek from '../daysOfWeek';
import NetInfo from '@react-native-community/netinfo';

const baseUrl = 'http://api.openweathermap.org/data/2.5/weather?lat=';
const keyApi = 'eb7807425009978423876fde384f4242'
const urlForecast = 'https://api.openweathermap.org/data/2.5/onecall?lat=';


const wait = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

const WeatherScreen = () => {
  const [locale, setLocale] = useState({
    country: 'Não encontrado',
    city: 'Não encontrado',
  });

  const [temperature, setTemperature] = useState({
    temp: 0,
    temp_max: 0,
    temp_min: 0,
    feels_like: 0,
    humidity: 0,
  });

  const [weather, setWeather] = useState({
    icon: '',
    description: '',
  });

  const [isLoadingCurrentWeather, setIsLoadingCurrent] = useState(false);

  const [isLoadingForecastWeather, setIsLoadingForecast] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [dailyForecast, setDailyForecast] = useState([]);
  const [hourForecast, setHourForecast] = useState([]);
  const [WeatherLoaded, setWeatherLoaded] = useState(false);
  const [actualDate, setActualDate] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      setIsLoadingCurrent(true);
      setWeatherLoaded(false);

      var isConnect = true;
      NetInfo.addEventListener((state) => {
        isConnect = state.isInternetReachable;
      });

      if (!isConnect) {
        setWeatherLoaded(false);
        setIsLoadingCurrent(false);
      }

      if (Platform.OS === 'android')
        if (!(await requestLocationPermissionAndroid())) return;

      const position = await getCorrentPosition();

      getDate();
      await getCurrentWeather(position);
      await getForecastWeather(position);
    } catch (error) {
      Alert.alert(
        'Aviso',
        'Não foi possível buscar os dados climáticos. Verifique sua conexão e tente novamente.',
      );
      setWeatherLoaded(false);
      setIsLoadingCurrent(false);
    }
  };

  const getDate = () => {
    try {
      var date = new Date();
      let hours = date.getHours();
      let minutes =
        date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
      let day = date.getDay();
      const dayOfWeek = lDaysOfWeek.filter((x) => x.Code == day);
      setActualDate(dayOfWeek[0].Description + ' ' + hours + ':' + minutes);
    } catch (e) {}
  };

  const getCorrentPosition = async () => {
    return GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    });
  };

  const requestLocationPermissionAndroid = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Aviso',
          'O acesso a localização do aplicativo está desligada. A funcionalidade de identificar a localização ficará desabilitada.',
        );
        return false;
      }
    } catch (err) {
      Alert.alert('Erro', 'Erro ao buscar ao solicitar acesso.\n - ' + err);
      return false;
    }
  };

  const formatDate = (unix_timestamp) => {
    let date = new Date(unix_timestamp * 1000);
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    const day = dd + '/' + mm;
    return day;
  };

  const getHour = (unix_timestamp) => {
    let date = new Date(unix_timestamp * 1000);
    let hours = date.getHours();
    return hours;
  };

  const getForecastWeather = async (position) => {
    try {
      setIsLoadingForecast(true);
      const url =
        urlForecast +
        position.latitude +
        '&lon=' +
        position.longitude +
        '&exclude=current,alerts,minutely&appid=' +
        keyApi +
        '&lang=pt';

      const response = await axios.get(url);
      if (response.status == 200) {
        setHourForecast(response.data.hourly);
        setDailyForecast(response.data.daily);
        setIsLoadingForecast(false);
      }
    } catch (error) {
      setIsLoadingForecast(false);
    }
  };

  const getCurrentWeather = async (position) => {
    const url =
      baseUrl +
      position.latitude +
      '&lon=' +
      position.longitude +
      '&appid=' +
      keyApi +
      '&lang=pt';
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        timeoutErrorMessage: 'Tempo de limite de espera atingido',
      });

      if ((response.status = 200)) {
        if (!!response.data.main) setTemperature(response.data.main);

        if (response.data.weather.length > 0)
          setWeather(response.data.weather[0]);

        setLocale({
          city: response.data.name,
          country: response.data.sys.country,
        });

        setWeatherLoaded(true);
        setIsLoadingCurrent(false);
      } else
        Alert.alert(
          'Aviso',
          'Não foi possível buscar os dados climáticos. Verifique sua conexão e tente novamente mais tarde.',
        );
    } catch (error) {
      setIsLoadingCurrent(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    await refreshData();
    wait(2000).then(() => setRefreshing(false));
  }, []);

  return (
    <MainContainer>
      <Header
        isLoading={isLoadingCurrentWeather}
        title={WeatherLoaded ? locale.city + ' - ' + locale.country : 'Não encontrado'}
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {isLoadingCurrentWeather && (
          <ContainerRow>
            <TextMedium>Carregando Clima...</TextMedium>
            <ActivityIndicator
              style={{padding: 8}}
              size={'large'}
              color={'#FFF'}
            />
          </ContainerRow>
        )}
        <ContainerWeather>
          {!isLoadingCurrentWeather && WeatherLoaded && (
            <View>
              <TextHight>
                {(temperature.temp - 273.15).toFixed(0) + 'º'}
              </TextHight>
              <ContainerInfo>
                <TextMedium>
                  Sensação {(temperature.feels_like - 273.15).toFixed(0) + 'º'}
                </TextMedium>
                <TextMedium>
                  Máxima {(temperature.temp_max - 273.15).toFixed(0) + 'º'}
                </TextMedium>
                <TextMedium>
                  Mínima {(temperature.temp_min - 273.15).toFixed(0) + 'º'}
                </TextMedium>
              </ContainerInfo>
            </View>
          )}
          {!isLoadingCurrentWeather && WeatherLoaded && (
            <ContainerInfo style={{marginHorizontal: 8}}>
              <Image
                source={{
                  uri:
                    'http://openweathermap.org/img/wn/' +
                    weather.icon +
                    '@2x.png',
                }}
                style={{width: 120, height: 93, bottom: 12}}
              />
              <TextMedium>{actualDate}</TextMedium>

              <TextMedium>
                {weather.description.charAt(0).toUpperCase() +
                  weather.description.slice(1)}
              </TextMedium>

              <TextMedium>
                Umidade {temperature.humidity.toFixed(0) + '%'}
              </TextMedium>
            </ContainerInfo>
          )}
        </ContainerWeather>

        {!WeatherLoaded && !isLoadingCurrentWeather && (
            <TextMedium>
              Não foi possível buscar os dados climáticos. Verifique sua conexão
              e tente novamente.
            </TextMedium>
        )}
        {WeatherLoaded && (
          <View style={{flex: 2}}>
            {isLoadingForecastWeather ? (
              <ContainerRow>
                <TextMedium>Carregando horários / dias ...</TextMedium>
                <ActivityIndicator
                  style={{padding: 8}}
                  size={'large'}
                  color={'#FFF'}
                />
              </ContainerRow>
            ) : (
              <>
                <SubTitle>Por horário</SubTitle>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={hourForecast}
                  keyExtractor={(item) => item.dt.toString()}
                  renderItem={({item}) => (
                    <ContainerItem>
                      <TextItem>
                        {(item.temp - 273.15).toFixed(0) + 'º'}
                      </TextItem>
                      <TextItem>{item.humidity + '%'}</TextItem>
                      <Image
                        style={{width: 50, height: 50}}
                        source={{
                          uri:
                            'http://openweathermap.org/img/wn/' +
                            item.weather[0].icon +
                            '@2x.png',
                        }}
                      />
                      <TextItem>{getHour(item.dt)}h</TextItem>
                    </ContainerItem>
                  )}
                />
                <SubTitle>Próximos dias</SubTitle>
                <FlatList
                  horizontal
                  keyExtractor={(item) => item.dt.toString()}
                  showsHorizontalScrollIndicator={false}
                  data={dailyForecast}
                  renderItem={({item, index}) =>
                    index > 0 && (
                      <ContainerItem>
                        <TextItem>
                          Max {(item.temp.max - 273.15).toFixed(0) + 'º'}
                        </TextItem>
                        <TextItem>
                          Min {(item.temp.min - 273.15).toFixed(0) + 'º'}
                        </TextItem>
                        <Image
                          style={{width: 50, height: 50}}
                          source={{
                            uri:
                              'http://openweathermap.org/img/wn/' +
                              item.weather[0].icon +
                              '@2x.png',
                          }}
                        />
                        <TextItem>{formatDate(item.dt)}</TextItem>
                      </ContainerItem>
                    )
                  }
                />
              </>
            )}
          </View>
        )}
      </ScrollView>
    </MainContainer>
  );
};

export default WeatherScreen;
