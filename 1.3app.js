import { Block } from '@tarojs/components'
import {Component} from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import './app.scss'
var commenValue = require('./utils/commonValue.js')
var request = require('./utils/request.js')
var util = require('./utils/util.js')
var WXBizDataCrypt = require('./utils/RdWXBizDataCrypt.js')

class App extends Component {
  componentWillMount() {
    this.$app.globalData = this.globalData
    var that = this
  }

  componentDidHide() {
    return
    Taro.reLaunch({
      url: '../index/index'
    })
  }
  lobalData = {
    userInfo: null,
    widowsHeight: 600,
    widowsWidth: 200,
    screenHeight: 600,
    token: '',
    platform: '',
    access_token: '',
    access_token_time: ''
  }
  config = {
    pages: [
      'pages/index/index',
      'pages/authorization/index',
      'pages/OrderList/index',
      'pages/OrderList/OrderInfo/index',
      'pages/OrderList/OrderInfo/QR/index',
      'pages/ScheduleList/Pay/index',
      'pages/PassengerInfo/index',
      'pages/ScheduleList/OrderInMap/index',
      'pages/ScheduleList/SelectSchedule/index',
      'pages/ScheduleList/ShowSchedule/index',
      'pages/ScheduleList/index',
      'pages/ScheduleList/Order/index',
      'pages/ScheduleList/NoOrder/index',
      'pages/ScheduleList/Order/Notice/index',
      'pages/ScheduleList/OrderInMap/ShowPic/index',
      'pages/Login/index',
      'pages/Trip/index',
      'pages/Common/NavigateMap/index',
      'pages/Common/Map/index',
      'pages/Common/Switchcity/switchcity',
      'pages/Common/DateSelect/dateSelect',
      'pages/PersonalCenter/index',
      'pages/PersonalCenter/About/index',
      'pages/PersonalCenter/ModifaMobile/index',
      'pages/ScheduleList/ChangeSchedule/index'
    ],
    permission: {
      'scope.userLocation': {
        desc: '用于准确定位地理位置'
      }
    },
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: '商务快客',
      navigationBarTextStyle: 'black',
      backgroundColor: '#F7F7F7'
    },
    tabBar: {
      color: '#9d9d9d',
      selectedColor: '#47B0FF',
      borderStyle: 'black',
      list: [
        {
          selectedIconPath: 'image/Search/car_click.png',
          iconPath: 'image/Search/car.png',
          pagePath: 'pages/index/index',
          text: '购票'
        },
        {
          selectedIconPath: 'image/Search/home_click.png',
          iconPath: 'image/Search/home.png',
          pagePath: 'pages/OrderList/index',
          text: '订单'
        },
        {
          selectedIconPath: 'image/Search/user_click.png',
          iconPath: 'image/Search/user.png',
          pagePath: 'pages/PersonalCenter/index',
          text: '我的'
        }
      ]
    },
    networkTimeout: {
      request: 4000
    }
  }

  render() {
    return null
  }
}

export default App
Taro.render(<App />, document.getElementById('app'))
