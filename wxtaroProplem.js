var commenValue = require('../../../utils/commonValue.js')
var util = require('../../../utils/util.js')
var request = require('../../../utils/request.js')
var wxPromise = require('../../../utils/wxPromise.js')

var app = getApp()
var fullPrice = 0
var selectStop = {}
const dispalyCoupn = '不使用优惠券'
var disCoupnCode = ''

var payMoney = 0
var timeOut = 0
var selectIndPrice = 0
var indIndex = 0
var isHasChild = false
var selectSchedule = {}
var token = ''

Page({
  data: {
    noTicketSum: 0,
    halfTicketSum: 0,
    fullTicketSum: 1,
    disValue: 0,
    sum: 0,
    date: '',
    maxTicketCount: 0,
    toastStatus: true,
    mImgPath: '../../../image/SetOrder/path_up.png',
    selectInd: -1,
    selectIndPrice: 0,
    insurance: '',
    widowsHeight: app.globalData.widowsHeight,
    widowsWidth: app.globalData.widowsWidth,
    screenHeight: app.globalData.screenHeight
  },

  onUnload(e) {
    disCoupnCode = ''
    payMoney = 0
    timeOut = 0
    selectIndPrice = 0
    indIndex = 0
    selectStop = null
    selectSchedule = null
  },

  onLoad(options) {
    token = app.globalData.token
    if (token == '') {
      util.redirect('../../../pages/Login/index')
      return
    }

    wx.showLoading({
      title: '加载中'
    })
    selectStop = wx.getStorageSync(commenValue.selectStop)
    selectSchedule = wx.getStorageSync(commenValue.selectSchedule)
    payMoney = fullPrice = wx.getStorageSync(commenValue.schedulePrice)

    this.getCoupons()

    var InsOs = []
    var o1 = {}
    o1.id = 1
    o1.Name = '三元保险'
    o1.Price = 3
    o1.Des = '100000出行保障'

    var o2 = {}
    o2.id = 2
    o2.Name = '五元保险'
    o2.Price = 5
    o2.Des = '500000出行保障'
    InsOs.push(o1)
    InsOs.push(o2)


    var isShowHalf = selectSchedule.canSaleHalfTicketCount > 0
    var isShowTake = selectSchedule.canSaleTakeChildTicketCount > 0
    this.setData({
      detailAddress: selectStop.startDes,
      issShowHalf: isShowHalf,  
      issShowTake: isShowTake,
      startStop: selectStop.startName,
      endStop: selectStop.endName,
      schduleDate: util.formateDay(wx.getStorageSync(commenValue.serverTime).split('T')[0]) + ' ' + util.getWeek(wx.getStorageSync(commenValue.serverTime).split('T')[0]).split('(')[0],
      schduleTime: selectSchedule.scheduleTime,
      ticketPrice: fullPrice,
      carNumber: selectSchedule.vehicleNumber,
      time: selectSchedule.scheduleTime,
      date: util.formateDay(wx.getStorageSync(commenValue.serverTime).split('T')[0]),
      
    })
  },

  powerDrawer(e) {
    console.log(e)
    if (this.data.showModalStatus == true) {
      if (e.currentTarget.dataset.type == '1') {
        this.setSelectContact()
      } else if (e.currentTarget.dataset.type == '2') {
        this.setData({
          showSumModalStatus: false,
          mImgPath: '../../../image/SetOrder/path_up.png'
        })
      } else if (e.currentTarget.dataset.type == '4') {
        this.setData({
          showInsurance: false,
          insurance: ''
        })
      } else {
        this.setData({
          showDisModalStatus: false
        })
      }
    }
    if (e == "undefined" || e == undefined) {
      // this.util("close", "3", "0")
    } else
      this.util(e.currentTarget.dataset.statu, e.currentTarget.dataset.type, e.currentTarget.dataset.id)
  },
  util(currentStatu, currentType, id) {
  	var that=this
    setTimeout(function() {
      if (currentStatu == 'close') {
        this.setData({
          showModalStatus: false,
          showSumModalStatus: false,
          showDisModalStatus: false,
          showInsurance: false,
          mImgPath: '../../../image/SetOrder/path_up.png'
        })
        if (currentType == '4') {
          var f = ''
          var price = 0
          for (var i = 0; i < that.data.insurances.length; i++) {
            if (that.data.insurances[i].id == id) {
              f = that.data.insurances[i].Name
              price = that.data.insurances[i].Price
            }
          }
          that.setData({
            insurance: f,
            selectInd: id,
            selectIndPrice: price
          })
          selectIndPrice = price
          that.bindManual()
        }
      }
    }, 100)

    if (currentStatu == 'open') {
      if (currentType == '1') {
        this.setData({
          showModalStatus: true
        })
      }
      if (currentType == '3') {
        if(this.data.disList.length==0){ return}
        this.setData({
          showDisModalStatus: true
        })
      }
      if (currentType == '4') {
        this.setData({
          showInsurance: true
        })
      }
      if (currentType == '2') {
        if (this.data.showSumModalStatus){
          this.setData({
            showSumModalStatus: false,
            mImgPath: '../../../image/SetOrder/path_up.png'
          })
          return
        }
        this.setData({
          showSumModalStatus: true,
          mImgPath: '../../../image/SetOrder/path_down.png'
        })
      }
    }
  },

  showPic() {
    util.navigate('../OrderInMap/ShowPic/index?url=' + selectStop.startStopImg + '&code=' + selectStop.startStopCode)
  },

  showMap() {
    util.navigate('../../../pages/Common/Map/index?Code=' + selectSchedule.scheduleCode + '&LineCode=' + selectSchedule.lineCode)
  },

  showNotice() {
    util.navigate('../Order/Notice/index')
  },

  openPay() {
    if (app.globalData.token == '') {
       util.redirect('../../../pages/Login/index')
      return
    }


    var max = this.data.maxTicketCount
    var now = this.data.fullTicketSum + this.data.halfTicketSum + this.data.noTicketSum
    if (now > max) {
    	wx.showModal({
        title: '温馨提示',
        content: "每个订单最多允许" + max + "张订单!",
        showCancel:false
     })
      return
    }

    var remainSeatCount = this.data.remainSeatCount
    if (now > remainSeatCount) {
    	 wx.showModal({
        title: '温馨提示',
        content: "还剩" + remainSeatCount + "座位，请重新下单！",
        showCancel:false
      })
      return
    }

    if (this.data.fullTicketSum < this.data.noTicketSum) {
    	 wx.showModal({
        title: '温馨提示',
        content: "全票数不能少于携童票数！",
        showCancel:false
      })
      return
    }

    var that = this
    var departDate = util.getCurrentDate().getFullDate().split('-')[0] + '-' + this.data.date.split(' ')[0].replace('月', '-').replace('日', '')
    var time1 = new Date(util.getCurrentDate().getFullDate() + ' ' + util.getNowTime(timeOut))
    var time2 = new Date(departDate + ' ' + this.data.time)
    if (time2 < time1) {
      wx.showModal({
        title: '确认信息',
        content: '接近发车时间,请确认能及时到达上车点,点击确定购买？',
        success: function(res) {
          if (res.confirm) {
            that.getNowXY()
          }
        }
      })
      return
    }
    wx.showLoading({
      title: '正在下单...'
    })
    this.getNowXY()
  },

  getNowXY() {
    var that = this
    var getLocationPromisified = wxPromise.wxPromisify(wx.getLocation)
    getLocationPromisified({
      type: 'wgs84'
    }).then(function(res) {
      that.addOrder(res.longitude, res.latitude)
    }).catch(function(e) {
      that.addOrder("", "")
    });
  },

  addOrder(longitude, latitude) {
    var order = {}
    order.SellerCode = commenValue.sellerCode
    order.DistributorCode = commenValue.WMCX
    order.TerminalCode = commenValue.terminalCode
    order.ScheduleCode = selectSchedule.scheduleCode
    order.BeginStopCode = selectStop.startStopCode
    order.EndStopCode = selectStop.endStopCode
    order.Longitude = longitude
    order.Latitude = latitude

    var booker = {}
    var user = wx.getStorageSync(commenValue.user)
    // booker.Name = user.userName
    // booker.IdCard = user.userIDCard
    booker.Mobile = user.userMobile
    booker.OpenId = user.openid

    var riders = []
    for (var i = 0; i < this.data.fullTicketSum; i++) {
      var rider = {}
      rider.Name = ""
      rider.IdCard = ""
      rider.Mobile = ""
      rider.TicketTypeCode = 'FullTicket'
      if (this.data.noTicketSum >= 1 && !isHasChild) {
        rider.TicketTypeCode = 'TakeChildTicket'
        isHasChild = true
      }
      riders.push(rider)
    }

    for (var i = 0; i < this.data.halfTicketSum; i++) {
      var rider = {}
      rider.Name = ""
      rider.IdCard = ""
      rider.Mobile = ""
      rider.TicketTypeCode = 'HalfTicket'
      riders.push(rider)
    }
    this.postOrderBook(order, booker, riders)
  },

  postOrderBook(order, booker, riders) {
    var that = this
    request(commenValue.POST, commenValue.orderBookUrl, {
        Order: order,
        Booker: booker,
        Riders: riders
      })
      .then(res => {
        wx.hideLoading()
        if (res.Error == 1) {
       	   wx.showModal({
			        title: '温馨提示',
			        content: res.Message,
			        showCancel:false
			      })
          return
        }
        if (res.Data.StateCode == 'BookSuccess') {
          that.setStorage(res)
          util.redirect('../Pay/index')
        } else {
		    	wx.showModal({
				    title: '温馨提示',
				    content: "下单失败，座位已售完！",
				    showCancel:false
				  })
        }
      })
  },

  setStorage(res) {
    var obj = {}
    obj.orderCode = res.Data.OrderCode
    obj.payMoney = payMoney
    obj.coupnValue = this.data.disValue
    obj.coupnCode = disCoupnCode
    obj.insurancePrice = this.data.selectIndPrice,
    obj.sum = this.data.oldSum
    wx.setStorage({
      key: commenValue.orderInfo,
      data: obj
    })
  },

  getSaleMinute() {
    var that = this
    request(commenValue.POST, commenValue.getConfigUrl, {
        configCode: commenValue.StopSaleMinuteBeforeScheduleStart
      })
      .then(res => {
        if (res.Error == 1) return
        if (res.Data.hasOwnProperty('Value')) {
          timeOut = res.Data.Value
        }
        that.getMaxTicketCount()
      }).catch(function(e) {
        console.info(e)
      })
  },

  getMaxTicketCount() {
    var that = this
    request(commenValue.POST, commenValue.getConfigUrl, {
        configCode: commenValue.MaxTicketCountPerOrder
      })
      .then(res => {
        if (res.Error == 1) return
        if (res.Data.hasOwnProperty('Value')) {
          that.setData({
            maxTicketCount: res.Data.Value
          })
        }
        that.getTicketNum()
        wx.hideLoading()
      }).catch(function(e) {
        console.error(e)
      })
  },

  checkInsurance(e) {
    var that = this
    if (indIndex == 0 && this.data.selectIndPrice > 0) {
      that.setData({
        selectIndPrice: 0
      })
    }
    if (indIndex % 2 == 0) {
      that.setData({
        selectIndPrice: 0
      })
    } else {
      that.setData({
        selectIndPrice: selectIndPrice
      })
    }
    indIndex++
    setTimeout(function() {
      that.bindManual()
    }, 100)
  },

  /* 点击减号 */
  bindMinus: function(e) {
    var num = 0;
    var minusStatus = "";
    if (e.currentTarget.id == 'fullAdd') {
      num = this.data.fullTicketSum;
      if (num > 1) {
        num--;
      }
      minusStatus = num <= 1 ? commenValue.disabled : commenValue.normal;
    } else {
      if (e.currentTarget.id == 'halfAdd')
        num = this.data.halfTicketSum;
      if (e.currentTarget.id == 'noAdd')
        num = this.data.noTicketSum;
      if (num > 0) {
        num--;
      }
      minusStatus = num <= 0 ? commenValue.disabled : commenValue.normal;
    }

    if (e.currentTarget.id == 'fullAdd') {
      this.setData({
        fullTicketSum: num,
        fullMinusStatus: minusStatus
      });
    }
    if (e.currentTarget.id == 'halfAdd') {
      this.setData({
        halfTicketSum: num,
        halfMinusStatus: minusStatus
      });
    }
    if (e.currentTarget.id == 'noAdd') {
      this.setData({
        noTicketSum: num,
        noMinusStatus: minusStatus
      });
    }
    this.bindManual();
  },

  /* 点击加号 */
  bindPlus: function(e) {
    var num = 0;
    if (e.currentTarget.id == 'fullDel')
      num = this.data.fullTicketSum;
    if (e.currentTarget.id == 'halfDel')
      num = this.data.halfTicketSum;
    if (e.currentTarget.id == 'noDel') {
      num = this.data.noTicketSum;
      if (num >= 1) return
    }

    num++;
    var minusStatus = num < 1 ? commenValue.disabled : commenValue.normal;
    if (e.currentTarget.id == 'fullDel') {
      this.setData({
        fullTicketSum: num,
        fullMinusStatus: minusStatus
      });
    }
    if (e.currentTarget.id == 'halfDel') {
      this.setData({
        halfTicketSum: num,
        halfMinusStatus: minusStatus
      });
    }
    if (e.currentTarget.id == 'noDel') {
      this.setData({
        noTicketSum: num,
        noMinusStatus: minusStatus
      });
    }
    this.bindManual();
  },

  /* 输入框事件 */
  bindManual: function() {
    const price = this.data.ticketPrice;

    var oldSum = price * this.data.fullTicketSum + price * this.data.halfTicketSum / 2 + this.data.selectIndPrice * (this.data.fullTicketSum + this.data.halfTicketSum)
    var disVs = this.data.disValue * (this.data.fullTicketSum + Math.floor(this.data.halfTicketSum / 2))
    var sum = oldSum - disVs

    this.setData({
      sum: sum,
      oldSum: oldSum,
      disVs: disVs
    })
    payMoney = sum
  },

  toastHide(event) {
    this.setData({
      toastStatus: true
    })
  },
  getTicketNum() {
    var selectStop = wx.getStorageSync(commenValue.selectStop)
    var beigin = selectStop.startStopCode
    var end = selectStop.endStopCode
    if (selectSchedule.scheduleCode == null) return
    request(commenValue.POST, commenValue.getStopTicketCountUrl, {
      ScheduleCode: selectSchedule.scheduleCode,
      BeginStopCode: beigin,
      endStopCode: end
    }).then(res => {
      this.setData({
        remainSeatCount: res.Data.RemainSeats[0].RemainSeatCount,
      })
      this.bindManual()
    })
  },

  getCoupons() {
    var that = this
    if (selectSchedule.scheduleCode == null) return
    request(commenValue.POST, commenValue.getCouponsUrl, {
      MemberCode: wx.getStorageSync(commenValue.memberCode),
      ScheduleCode: selectSchedule.scheduleCode,
      TerminalCode: commenValue.terminalCode,
      TotalPrice: payMoney
    }).then(res => {
      console.log(res)
      if (res.Error == 1) {
        wx.hideLoading()
        wx.showToast({
          title: res.Message
        })
        return
      }
      console.log(res)
      if (res.Data.hasOwnProperty('Coupons')) {
        var disList = []
        for (var i = 0; i < res.Data.Coupons.length; i++) {
          var obj = {}
          obj.id = i
          obj.couponsCode = res.Data.Coupons[i].Code
          obj.discount = res.Data.Coupons[i].ActivityName
          obj.disValue = res.Data.Coupons[i].Amount
          obj.disDate = res.Data.Coupons[i].ExpireTime.split('T')[0]
          disList.push(obj)
        }

        that.setData({
          disList: disList
        })
        if (disList.length > 0){
          that.setCoupons()
        }else{
          that.setData({
            disCoupe:0
          })
        }
      }
      that.getSaleMinute()
    })
  },

  setCoupons(e) {
    var id = 0;
    if (e != null)
      id = e.currentTarget.dataset.id;
    if (id == -1) {
      this.setData({
        disCoupe: dispalyCoupn,
        disValue: 0
      })
    } else {
      disCoupnCode = this.data.disList[id].couponsCode
      this.setData({
        disCoupe: this.data.disList[id].discount,
        disValue: this.data.disList[id].disValue
      })
    }
    console.log(this.data.disCoupe)
    //this.bindManual()
    // if (id > 0)
    this.powerDrawer(e)
  },
