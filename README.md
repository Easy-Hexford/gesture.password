# gesture.password

## 手势密码组件
常见的九点绘图解锁，基于zepto.js，支持移动端，使用canvas完成绘图。
###使用说明

1. 引入手势组件，需要和zepto一起使用
```
  <script src="zepto.js"></script>
  <script src="gesture.password.js"></script>
```

2. 在需要使用的区域添加一个container
```
  <div id="container"></div>
```

3. 初始化组件，可添加配置参数
```
  var handUnclock = new HandUnclock("container",{
    width: 300,     // 绘图区宽度
    height: 300,    // 绘图区高度
    cirRadius: 20,  // 圆圈半径
    space: 35,      // 圆圈间距
    cirColor: '#fff',   // 圆圈填充色
    cirStrokeColor: '#DDDDDD', // 圆圈轮廓填充色
    cirActiveFill: '#FFCC00',  // 选中状态下圆圈填充色
    cirActiveStroke: '#EC8C1E', // 选中状态下圆圈轮廓填充色
    lineColor: '#FF6600',   // 连线颜色
    backgroundColor: '#ECECEF'  // 背景色
  });
```

4. 用户密码，从左到右，从上到下，依次为1～9

5. 通过touchstart, touchmove, touchend监听事件
