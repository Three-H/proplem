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
export default class TaroSearchTmpl extends Taro.Component {
	//通过这里执行到页面wxSearchKeyTap(e)事件
	ttt=(e)=>{
		console.log(this.props)
	  this.props.wxSearchKeyTap(e);
	}
  render() {
    const { data: wxSearchData} = this.props
    return (
      <Block>
        <View
          className="wxSearch"
          // onClick={this.wxSearchTap}
          style={
            'display:' +
            (wxSearchData.view.isShow ? 'block' : 'none') +
            ';height:' +
            (wxSearchData.view.seachHeight - 2) +
            'px; z-index: 999;}'
          }
        >
          <View className="wxSearchInner">
            <View className="wxSearchMindKey">
              <View className="wxSearchMindKeyList">
                {wxSearchData.mindKeys.map((item, index) => {
                  return (
                    <Block key>
                      <View
                        className="wxSearchMindKeyItem"
                        onClick={this.ttt.bind(this)}
                        data-key={item}
                      >
                        {item}
                      </View>
                    </Block>
                  )
                })}
              </View>
            </View>
            <View
              className="wxSearchHistory"
              style={
                'display:' +
                (wxSearchData.view.isShowSearchHistory ? 'block' : 'none')
              }
            >
              <Text className="wxSearchTitle">搜索历史</Text>
              {wxSearchData.his[0] ? (
                <View className="wxSearchHistoryList">
                  {wxSearchData.his.map((item, index) => {
                    return (
                      <Block key>
                        <View className="wxSearchHistoryItem">
                          <Text
                            className="wxSearchHistoryItemText"
                            onClick={this.ttt.bind(this)}
                            data-key={item}
                          >
                            {item}
                          </Text>
                          <Image
                            data-key={item}
                            data-key={item}
                            onClick={this.wxSearchDeleteKey}
                            src="../../../image/Search/x.png"
                            style="width:16px;height:16px; padding: 3px 5px;"
                          />
                        </View>
                      </Block>
                    )
                  })}
                  <View className="wxSearchDeleteAllBtn">
                    <Image
                      onClick={this.wxSearchDeleteAll}
                      src="../../../image/Search/d.png"
                      style="width:16px;height:16px;"
                    />
                  </View>
                </View>
              ) : (
                <View>
                  <View className="wxSearchHistoryEmpty">搜索历史为空</View>
                </View>
              )}
            </View>
          </View>
        </View>
      </Block>
    )
  }

  static options = {
    addGlobalClass: true
  }
}
