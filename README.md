# handUnCLock.js

## 手势密码组件

[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
 
常见的九点绘图解锁，使用原生JS和H5api，支持移动端，使用canvas完成绘图。

演示地址：<https://sungd.github.io/gesture.password>

### 使用说明

1. 引入手势组件
```
  <script src="handUnclock.js"></script>
```

2. 在需要使用的区域添加一个container
```
  <div id="container"></div>
```

3. 初始化组件，可添加配置参数
```
  var handUnclock = new HandUnclock("#container",{
    width: 300,     // 绘图区宽度
    height: 300,    // 绘图区高度
    radius: 20,  // 圆圈半径
    space: 35,      // 圆圈间距
    normalFillColor: '#fff',   // 圆圈填充色
    normalStrokeColor: '#DDDDDD', // 圆圈轮廓填充色
    activeFillColor: '#FFCC00',  // 选中状态下圆圈填充色
    activeStrokeColor: '#EC8C1E', // 选中状态下圆圈轮廓填充色
    lineColor: '#FF6600',   // 连线颜色
    bgColor: '#ECECEF'  // 背景色
  });
```

4. 用户密码，从左到右，从上到下，依次为1～9

### 设计思路：

* 将九个圆圈的圆心坐标保存为点`new Point(x, y, value)`，存储在数组`pointList`中；
* 使用数组`ongoing`保存滑动中经过的圆圈，记录轨迹；
* 通过`touchstart`, `touchmove`, `touchend`监听事件，注意设置``touching``标识，避免`touchmove`事件一直触发；
* 移动事件触发时，重置页面－》描绘经过的圆圈－》描绘连线
* 对于设置密码、验证密码等不同的操作，可对手势组件添加相应的 **状态** ，`touchend`时根据状态进行处理
