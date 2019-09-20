const ctx = wx.createCanvasContext('firstCanvas')
const app = getApp();
Page({
  data: {
    allData:{},//所有数据
    canvasWidth:"",
    canvasHeight:"",
    kgId:"",
    size:2,//缩小比例
    canvasIsShow:false
  },
  onLoad: function (options) {
    var that = this;
    // 图谱类型
    that.setData({
      canvasWidth: options.width / that.data.size ,
      canvasHeight: options.height / that.data.size,

      // canvasWidth: 10000 / that.data.size,
      // canvasHeight: 10000 / that.data.size,
    })
    
    wx.setNavigationBarTitle({
      title: options.title
    })
    app.wxRequest("coreapi/core/v1/queryKnowledgeGraphDetail",
      { kgId: options.id },
      // { kgId:"6e3f596b-d68e-11e8-9fff-00163e101f18"},
      "POST", function (res) {

        if (res.data.code == 0) {
          let arr = res.data.data;
          let num = that.data.size;
          let imgWidth = that.data.size;
          var skuList = [];
          // 图谱类型
          for (var i = 0; i < arr.length; i++) {
            // 中心
            if (arr[i].type == 0) {
              that.type0(
                arr[i].start_x / num - 546 / imgWidth / 2,
                arr[i].start_y / num - 470 / imgWidth / 2,
                "/images/zx.png",
                546 / imgWidth, 470 / imgWidth,
              )
              that.type_font(
                arr[i].title,
                arr[i].start_x / num - 273,
                arr[i].start_y / num - 235,
                546, 470,
              )

            }
            // 双圈粗圆
            if (arr[i].type == 1) {
              that.type1(
                arr[i].start_x / num - 324 / imgWidth / 2,
                arr[i].start_y / num - 324 / imgWidth / 2,
                "/images/type1.png",
                324 / imgWidth, 324 / imgWidth, arr[i].alpha
              )

              that.type_font(
                arr[i].title,
                arr[i].start_x / num - 162,
                arr[i].start_y / num - 158,
                324, 324, arr[i].alpha
              )
            }
            //双圈细圆
            if (arr[i].type == 3) {

              that.type1(
                arr[i].start_x / num - 282 / imgWidth / 2,
                arr[i].start_y / num - 282 / imgWidth / 2 ,
                "/images/type3.png",
                282 / imgWidth, 282 / imgWidth, arr[i].alpha
              )
              if (arr[i].title.length == 4 || arr[i].title.length < 4) {

                that.type_font(
                  arr[i].title,
                  arr[i].start_x / num - 162,
                  arr[i].start_y / num - 158,
                  324, 324, arr[i].alpha
                )
              } else if (arr[i].title.length == 8 || arr[i].title.length < 8) {

                that.type_font(
                  arr[i].title,
                  arr[i].start_x / num - 162,
                  arr[i].start_y / num - 162,
                  324, 324, arr[i].alpha
                )
              } else {
                that.type_font(
                  arr[i].title,
                  arr[i].start_x / num - 162,
                  arr[i].start_y / num - 168,
                  324, 324, arr[i].alpha
                )
              }
            }
            // 粗线
            if (arr[i].type == 5) {
              that.type3_line(
                "#425160", 5,
                arr[i].start_x / num,
                arr[i].start_y / num,
                arr[i].end_x / num,
                arr[i].end_y / num,
                arr[i].alpha
              )

            }
            // 单节课程
            if (arr[i].type == 4) {
              let typeAlpha = arr[i].alpha;
              skuList.push(arr[i])
              if (arr[i].pic_url) {
                let start_x = arr[i].start_x;
                let start_y = arr[i].start_y;
                let show_status = arr[i].show_status;
                wx.downloadFile({
                  url: arr[i].pic_url,
                  success(res) {
                    
                    if (res.statusCode === 200) {
                      that.type4(
                        res.tempFilePath,
                        start_x / num - 30 / imgWidth / 2 - 9,
                        start_y / num - 30 / imgWidth / 2 - 9,
                        30 / imgWidth, typeAlpha
                      )
                    }
                    // 头像右下角图表
                    if (show_status == 2) {

                      that.type0(
                        start_x / num - 20 / imgWidth / 2 + 6,
                        start_y / num - 20 / imgWidth / 2 + 4,
                        "/images/show_status2.png",
                        30 / imgWidth, 30 / imgWidth,
                      )
                    }
                  }
                })

              }
              // 大于8个字的时候
              if (arr[i].title.length > 8) {
                // 八字
                that.type_font_more(
                  arr[i].title,
                  arr[i].start_x / num - 30 / imgWidth / 2,
                  arr[i].start_y / num - 30 / imgWidth / 2 + 28,
                  30 / imgWidth, 30 / imgWidth, "#445162", typeAlpha
                )
                // 标签
                that.type_font_label(
                  arr[i].label,
                  arr[i].start_x / num - 60 / imgWidth / 2 - 5,
                  arr[i].start_y / num - 60 / imgWidth / 2 + 66,
                  80 / imgWidth, 34 / imgWidth,
                  "/images/canvasL.png", typeAlpha
                )
              } else {
                // 八字
                that.type_font_more(
                  arr[i].title,
                  arr[i].start_x / num - 30 / imgWidth / 2,
                  arr[i].start_y / num - 30 / imgWidth / 2 + 28,
                  30 / imgWidth, 30 / imgWidth, "#445162", typeAlpha
                )
                that.type_font_label(
                  arr[i].label,
                  arr[i].start_x / num - 60 / imgWidth / 2 - 5,
                  arr[i].start_y / num - 60 / imgWidth / 2 + 50,
                  80 / imgWidth, 34 / imgWidth,
                  "/images/canvasL.png", typeAlpha
                )
              }

            }
            if (arr[i].type == 6) {
              console.log(arr[i])
              that.type3_line(
                "#425160", 2,
                arr[i].start_x / num,
                arr[i].start_y / num,
                arr[i].end_x / num,
                arr[i].end_y / num,
                arr[i].alpha
              )
            }

          }
         
          setTimeout(function(){
            // set所有数据
            that.setData({
              allData: res.data.data,
              skuList: skuList,
              canvasIsShow:true
            })
          },1000)

        } else {
          app.showLoading(res.data.msg, "none");
        }
    })


  },
  //格子
  box: function () {
    ctx.save()
    var rectH = 20;
    var rectW = 20;
    ctx.lineWidth = .3;
    ctx.setStrokeStyle("#000");//设置边框颜色
    //绘制表格
    // 第一步： 绘制横线
    for (var i = 0; i < 999; i++) {
      ctx.moveTo(rectW * i, 0);
      //如果不设置moveTo，当前画笔没有位置
      ctx.lineTo(rectW * i, 999);
    }
    //第二步：绘制竖线：如果绘制的格子的宽高相等，可以将for循环放到一个里面；
    for (var i = 0; i < 999; i++) {
      ctx.moveTo(0, rectH * i);
      ctx.lineTo(999, rectH * i);
    }
    ctx.stroke();
    ctx.draw(true);
  },
  // 中心
  type0(x, y, src, width, height) {
    ctx.save();
    ctx.beginPath();
    ctx.setTextAlign('center');
    ctx.setFillStyle('#445162')
    ctx.moveTo(x, y);
    ctx.drawImage(src, x, y, width, height);
    ctx.setFontSize(10);
    ctx.draw(true);//完毕
  },
  // 四字换行
  type_font(text, x, y, imgW, imgH,dataAlpha, fontColor) {

    // that.type_font(
    //   324, 324, arr[i].alpha
    // )
    
    // 2
    ctx.save();
    ctx.beginPath();
    let colors = fontColor || "#445162";
    let typeAlpha = dataAlpha || 1;
    ctx.setTextAlign('center');
    ctx.setFillStyle(colors);
    ctx.setGlobalAlpha(typeAlpha);
    ctx.moveTo(x, y);
    ctx.setFontSize(16);
    var result = [];
    for (var i = 0; i < text.length; i += 4) {
      result.push(text.slice(i, i + 4))
    }
    for (var a = 0; a < result.length; a++) {

      ctx.fillText(result[a], x + imgW / 2, y + imgH / 2 + a * 16);
    }
    ctx.draw(true);

    // 3.5
    // ctx.save();
    // ctx.beginPath();
    // ctx.setTextAlign('center');
    // ctx.setFillStyle('#445162');
    // ctx.setGlobalAlpha(1);
    // ctx.moveTo(x, y);
    // ctx.setFontSize(10);
    // var result = [];
    // for (var i = 0; i < text.length; i += 4) {
    //   result.push(text.slice(i, i + 4))
    // }
    // for (var a = 0; a < result.length; a++) {

    //   ctx.fillText(result[a], x + imgW / 2, y + imgH / 2 + a * 10);
    // }
    // ctx.draw(true);

  },
  // 八字换行
  type_font_more(text, x, y, imgW, imgH, font_color, dataAlpha) {

    // 2.0
    ctx.save();
    var font_colors = font_color || "#445162"
    let typeAlpha = dataAlpha || 1;
    ctx.beginPath();

    ctx.setTextAlign('center');
    ctx.setFillStyle(font_colors)
    ctx.setGlobalAlpha(typeAlpha)
    ctx.font = "8px bold";
    ctx.moveTo(x, y);
    ctx.setFontSize(12);
    var result = [];
    for (var i = 0; i < text.length; i += 8) {
      if (result.length < 2){
        result.push(text.slice(i, i + 8))
      }
    }
    for (var a = 0; a < result.length; a++) {
      ctx.fillText(result[a], x + imgW / 2, y + imgH / 2 + a * 16);
    }
    ctx.draw(true);
  },
  // 标签
  type_font_label(text, x, y, imgW, imgH, src, dataAlpha) {
    // 2.0
    ctx.save();
    ctx.beginPath();
    ctx.setTextAlign('center');
    ctx.setGlobalAlpha(dataAlpha)
    ctx.font = "8px bold";
    ctx.moveTo(x, y);
    ctx.drawImage(src, x, y, imgW, imgH);
    ctx.setFontSize(10);
    ctx.setFillStyle("#fff");
    var result = [];
    ctx.setGlobalAlpha(1)
    ctx.fillText(text, x + imgW / 2, y + imgH / 2 + 3.5);
    
    ctx.draw(true);
  },
  // 双圈节点 and 细圈双圈节点
  type1(x, y, src, widht, height, dataAlpha) {
    ctx.save();//保存上次节点
    ctx.beginPath();//开始画
    ctx.setGlobalAlpha(dataAlpha);
    ctx.moveTo(x, y);
    ctx.drawImage(src, x, y, widht, height)
    ctx.draw(true);//完毕
  },
  // 加粗单圈节点
  type2(x, y, r, start, end, color, bold, dataAlpha) {
    ctx.save();
    var unit = Math.PI / 180;
    ctx.beginPath();
    ctx.setGlobalAlpha(dataAlpha);
    ctx.arc(x, y, r, start * unit, end * unit);
    ctx[type + 'Style'] = color;
    ctx.setLineWidth(bold)
    ctx.draw(true);
  },
  // 粗线 and 细线
  type3_line(color, bold, x1, y1, x2, y2, dataAlpha) {

    ctx.save();
    ctx.beginPath();
    ctx.setGlobalAlpha(dataAlpha);
    ctx.strokeStyle = color;
    ctx.setLineWidth(bold);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.draw(true);
  },
  // 单节课程图片
  type4(img, x, y, r, dataAlpha) {

    ctx.save();
    ctx.beginPath();
    ctx.setGlobalAlpha(dataAlpha);
    var d = 2 * r;
    var cx = x + r;
    var cy = y + r;
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fill()      
    ctx.clip();   
    ctx.drawImage(img, x, y, d, d);
    
    ctx.restore()
    ctx.draw(true);
  },
  // 虚线
  type7_line(color, bold, x1, y1, x2, y2) {
    // this.type7_line("#000", 4, 100, 500, 200, 500);
    ctx.save();
    ctx.setLineDash([5, 15], 5);
    ctx.strokeStyle = color;
    ctx.setLineWidth(bold);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.draw(true);
  },
  start: function (e) {
    var that = this;
    let allData = that.data.skuList;
    let pageX = e.touches[0].pageX * 2;
    let pageY = e.touches[0].pageY * 2;

    for (var i = 0; i < allData.length; i++) {
      if (
        allData[i].start_x - pageX < 30 && allData[i].start_y - pageY < 30 &&
        allData[i].start_x - pageX > -30 && allData[i].start_y - pageY > - 120
      ) {

        let skuId = allData[i].sku_id;
        if ( skuId ){
          app.wxRequest("coreapi/core/v1/querySkuInfo",
            { skuId: skuId }, "POST", function (res) {
              if (res.data.code == 0) {
                wx.setStorageSync("skuInfo", res.data.data)
                if (res.data.data.is_buy == "0") {
                  wx.navigateTo({
                    url: '/pages/commonPage/noBuyDetails/noBuyDetails?skuId=' + skuId
                  })
                } else {
                  wx.navigateTo({
                    url: '/pages/commonPage/buyDetailsEnd/buyDetailsEnd?skuId=' + skuId
                  })
                }

              } else {
                app.showLoading(res.data.msg, "none");
              }
            })
        }else{
          app.showLoading("本节没有配置skuid","none")
        }
        
      }
    }
   
    // console.log("X=" + allData[2].start_x)

    // console.log(allData[12].start_x - pageX)
    // console.log("X轴= " + pageX)
    // console.log("dataX= "+allData[12].start_x)


    // console.log(allData[12].start_y - pageY)
    // console.log("Y轴= " + pageY)
    // console.log("dataY= " +allData[12].start_y)
  },

})