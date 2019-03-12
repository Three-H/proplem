import {
  Block,
  View,
  Icon,
  Input,
  ScrollView,
  Image,
  Text
} from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import TaroSearchTmpl from '../../../imports/TaroSearchTmpl.js'
import './switchcity.scss'
var amapFile = require('../../../utils/amap-wx.js')
var config = require('../../../utils/config.js')
var commenValue = require('../../../utils/commonValue.js')
var WxSearch = require('../WxSearch/wxSearch.js')
var wxSortPickerView = require('../SortPickerView/wxSortPickerView.js')
var request = require('../../../utils/request.js')

var searchLetter = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'W',
  'X',
  'Y',
  'Z'
]

var goType = '1'
var cityList = []
var app = Taro.getApp()

@withWeapp('Page')
class _C extends Taro.Component {
  state = {
    winHeight: 0,
    isShowLetter: false,
    scrollTop: 0, //置顶高度
    city: '正在定位',
    strType: '0',
    hotcityList: [
      {
        cityCode: 3402000000,
        city: '芜湖市'
      },
      {
        cityCode: 3402220000,
        city: '繁昌县'
      },
      {
        cityCode: 3405000000,
        city: '马鞍山市'
      },
      {
        cityCode: 3405220000,
        city: '含山县'
      },
      {
        cityCode: 3413260000,
        city: '宿州高铁站'
      }
    ]
  }

  componentWillMount(e) {
    Taro.showLoading({
      title: '加载中'
    })
    var that = this
    cityList = []
    goType = e.type

    var sysInfo = Taro.getSystemInfoSync()
    var winHeight = sysInfo.windowHeight + 40
    var itemH = winHeight / searchLetter.length
    var tempObj = []
    for (var i = 0; i < searchLetter.length; i++) {
      var temp = {}
      temp.name = searchLetter[i]
      temp.tHeight = i * itemH
      temp.bHeight = (i + 1) * itemH
      tempObj.push(temp)
    }
    if (goType == 1) {
      that.getStartRegion().then(res => {
        that.callBackRegion(res)
      })
    } else {
      that.getEndRegion().then(res => {
        that.callBackRegion(res)
      })
    }

    that.setData({
      winHeight: winHeight - 80,
      itemH: itemH,
      searchLetter: tempObj,
      strType: goType
    })

    if (goType == 1) that.getNowXY()
  }

  callBackRegion = res => {
    if (res.Error == 1) {
      console.info(res.Message)
      return
    }
    var that = this
    var ind = 0
    for (var j = 0; j < res.Data.Regions.length; j++) {
      var initial = wxSortPickerView.checkCh(res.Data.Regions[j].Name)
      var obj = {}
      obj.id = ind
      obj.city = res.Data.Regions[j].Name
      obj.initial = initial.substring(0, 1)
      obj.code = res.Data.Regions[j].Code

      var isHas = false
      for (var z = 0; z < cityList.length; z++) {
        if (cityList[z].initial == initial.substring(0, 1)) {
          cityList[z].cityInfo.push(obj)
          isHas = true
          break
        }
      }
      if (!isHas)
        cityList.push({
          cityInfo: [obj],
          initial: initial.substring(0, 1)
        })
    }
    that.setData({
      cityList: cityList
    })

    that.initSearch()
  }
  getStartRegion = () => {
    return request(commenValue.POST, commenValue.getStartRegionUrl, {
      DistributorCode: commenValue.AXBS,
      ProductCode: commenValue.SWKK
    })
  }
  getEndRegion = () => {
    var startCode = Taro.getStorageSync(commenValue.startCity).Code
    return request(commenValue.POST, commenValue.getEndRegionUrl, {
      DistributorCode: commenValue.AXBS,
      ProductCode: commenValue.SWKK,
      BeginRegionCode: startCode
    })
  }
  initSearch = () => {
    var that = this
    var cityNames = []
    for (var j = 0; j < cityList.length; j++) {
      var item = cityList[j]
      for (var i = 0; i < item.cityInfo.length; i++) {
        cityNames.push(item.cityInfo[i].city)
      }
    }
    WxSearch.init(that, 43, cityNames)
    WxSearch.initMindKeys(cityNames)
    Taro.hideLoading()
  }
  getNowXY = () => {
    var that = this
    var key = config.Config.key
    var myAmapFun = new amapFile.AMapWX({
      key: key
    })
    myAmapFun.getRegeo({
      success: function(data) {
        var city = data[0].regeocodeData.addressComponent.city
        var cityCode = data[0].regeocodeData.addressComponent.adcode
        var initial = wxSortPickerView.checkCh(city).substring(0, 1)
        for (var i = 0; i < cityList.length; i++) {
          if (cityList[i].initial == initial) {
            for (var j = 0; j < cityList[i].cityInfo.length; j++) {
              if (cityList[i].cityInfo[j].city == city) {
                cityCode = cityList[i].cityInfo[j].code
                break
              }
            }
            break
          }
        }

        that.setData({
          city: city,
          cityCode: cityCode
        })
      },
      fail: function(info) {}
    })
  }
  clickLetter = e => {
    console.log(e.currentTarget.dataset.letter)
    var showLetter = e.currentTarget.dataset.letter
    this.setData({
      showLetter: showLetter,
      isShowLetter: true,
      scrollTopId: showLetter
    })
    var that = this
    setTimeout(function() {
      that.setData({
        isShowLetter: false
      })
    }, 1000)
  }
  bindCity = e => {
    this.setStorage(e.currentTarget.dataset)
  }
  bindHotCity = e => {
    this.setStorage(e.currentTarget.dataset)
  }
  hotCity = () => {
    this.setData({
      scrollTop: 0
    })
  }
  setStorage = e => {
    var city = {}
    city.Name = e.city
    city.Code = e.cityCode
    if (goType == 1) {
      Taro.setStorage({
        key: commenValue.startCity,
        data: city
      })
    } else {
      Taro.setStorage({
        key: commenValue.endCity,
        data: city
      })
    }
    Taro.navigateBack({
      delta: 1
    })
  }
  bindScroll = e => {}
  wxSearchFn = e => {
    var that = this
    WxSearch.wxSearchAddHisKey(that)
  }
  wxSearchInput = e => {
    var that = this
    WxSearch.wxSearchInput(e, that)
  }
  wxSerchFocus = e => {
    var that = this
    WxSearch.wxSearchFocus(e, that)
  }
  wxSearchBlur = e => {
    var that = this
    WxSearch.wxSearchBlur(e, that)
  }
  wxSearchKeyTap = e => {
    //希望组件的事件可以执行到这里
	  console.log(e)
  }
  callBack = e => {
    var obj = {}
    obj.city = e
    obj.citycode = ''

    var cityCode = ''
    for (var j = 0; j < cityList.length; j++) {
      var item = cityList[j]
      var exit = false
      for (var i = 0; i < item.cityInfo.length; i++) {
        if (item.cityInfo[i].city == e) {
          cityCode = item.cityInfo[i].code
          exit = true
          break
        }
      }
      if (exit) break
    }
    obj.citycode = cityCode
    this.setStorage(obj)
  }
  wxSearchDeleteKey = e => {
    var that = this
    WxSearch.wxSearchDeleteKey(e, that)
  }
  wxSearchDeleteAll = e => {
    var that = this
    WxSearch.wxSearchDeleteAll(that)
  }
  wxSearchTap = e => {
    var that = this
    WxSearch.wxSearchHiddenPancel(that)
  }
  config = {
    navigationBarTitleText: '选择城市'
  }

  render() {
    const {
      searchLetter: searchLetter,
      isShowLetter: isShowLetter,
      showLetter: showLetter,
      wxSearchData: wxSearchData,
      inputVal: inputVal,
      winHeight: winHeight,
      scrollTopId: scrollTopId,
      scrollTop: scrollTop,
      strType: strType,
      cityCode: cityCode,
      city: city,
      hotcityList: hotcityList,
      cityList: cityList
    } = this.state
    return (
      <Block>
        <View className="searchLetter touchClass">
          <View className="thishotText" onClick={this.hotCity} />
          {searchLetter.map((item, index) => {
            return (
              <View
                style="color:#2ab4ff;font-size:20rpx;"
                key="index"
                data-letter={item.name}
                onTouchEnd={this.clickLetter}
              >
                {item.name}
              </View>
            )
          })}
        </View>
        {isShowLetter && (
          <Block>
            <View className="showSlectedLetter">{showLetter}</View>
          </Block>
        )}
        <View style="width:90%;margin:10rpx 0 0 20rpx">
          <View className="weui-search-bar__form">
            <View className="weui-search-bar__box">
              <Icon
                className="weui-icon-search_in-box"
                type="search"
                size="14"
              />
              <Input
                type="text"
                className="weui-search-bar__input"
                placeholder="搜索"
                value={wxSearchData.value}
                onFocus={this.wxSerchFocus}
                onInput={this.wxSearchInput}
                onBlur={this.wxSearchBlur}
              />
              {inputVal.length > 0 && (
                <View className="weui-icon-clear" onClick={this.clearInput}>
                  <Icon type="clear" size="14" />
                </View>
              )}
            </View>
          </View>
        </View>
        <TaroSearchTmpl data={wxSearchData} />
        <ScrollView
          style={'height:' + winHeight + 'px'}
          scrollY="true"
          onScroll={this.bindScroll}
          scrollIntoView={scrollTopId}
          scrollTop={scrollTop}
        >
          <View hidden={strType == '0'} className="hotcity-common thisCity">
            当前
          </View>
          <View style="display: flex;align-items: center;">
            <Image
              hidden={strType == '0'}
              style="height:36rpx;width:26rpx;margin-left:40rpx;"
              src={require('../../../image/Search/Location.png')}
              mode="aspectFit"
            />
            <View
              hidden={strType == '0'}
              className="thisCityName"
              onClick={this.bindHotCity}
              data-cityCode={cityCode}
              data-city={city}
            >
              {city}
            </View>
          </View>
          <View>
            <Text className="hotcity hotcity-common">热门城市</Text>
            <View style="margin-left:5px">
              {hotcityList.map((item, index) => {
                return (
                  <Block key={index}>
                    <View
                      className="weui-grid"
                      data-cityCode={item.cityCode}
                      data-city={item.city}
                      onClick={this.bindHotCity}
                    >
                      <View className="weui-grid__label" style="margin-top:0px">
                        {item.city}
                      </View>
                    </View>
                  </Block>
                )
              })}
            </View>
          </View>
          {cityList.map((item, index) => {
            return (
              <View className="selection" key={item.initial}>
                <View className="item_letter" id={item.initial}>
                  {item.initial}
                </View>
                {item.cityInfo.map((ct, index) => {
                  return (
                    <View
                      className="item_city"
                      key={ct.id}
                      data-cityCode={ct.code}
                      data-city={ct.city}
                      onClick={this.bindCity}
                    >
                      {ct.city}
                    </View>
                  )
                })}
              </View>
            )
          })}
        </ScrollView>
      </Block>
    )
  }
}

export default _C
