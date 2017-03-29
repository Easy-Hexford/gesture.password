/*
功能：1. 设置密码； 2. 验证密码
1 提示输入手势密码－》长度校验－》再次输入相同的密码－》重复验证－》提示设置成功 OR 重新输入密码
2 验证密码－》若不成功则等待用户输入（可加次数限制）
*/

HandUnclock.DEFAULT = {
    width: 300,
    height: 300,
    cirRadius: 20,
    space: 35,
    cirColor: '#fff',
    cirStrokeColor: '#DDDDDD',
    cirActiveFill: '#FFCC00',
    cirActiveStroke: '#EC8C1E',
    lineColor: '#FF6600',

};

HandUnclock.MESSAGE = {
    tooShort: '密码太短，至少需要5个点',
    notSame: '两次输入的不一致',
    setOk: '密码设置成功',
    pwdError: '输入的密码不正确',
    pwdSuccess: '密码正确!',
    tips: ['请输入手势密码', '请再次输入手势密码'],
    noPwd: ['请先设置密码']
};
/**
 * [HandUnclock 手势解锁]
 * @param {[type]} container [包裹canvas的容器]
 * @param {[type]} opt       [配置参数]
 */

function HandUnclock (container, opt) {
    // 包裹容器
    this.container = document.getElementById(container);
    // 配置参数
    this.option = HandUnclock.DEFAULT;
    $.extend(this.option, opt);
    // 保存所有的圆圈坐标
    this.pointList = [];  
    // 保存用户的手势  
    this.ongoing = [];   
    // 保存绘制好九宫格后的画布数据 
    this.ImageData = {};   
    // 是否滑动 
    this.touching = false;
    // 手势锁的状态
    // 0: 第一次设置密码 1: 第二次输入密码 2: 等待验证密码
    this.status = 0;

    this.init();
}

HandUnclock.prototype.init = function() {
    // 生成canvas节点
    $(this.container).append('<canvas id="gesture" width="'+this.option.width+'" height="'+this.option.height+'"></canvas>');
    this.canvas = document.getElementById('gesture');
    $(this.canvas).css({
        'display': 'block',
        'margin': '0 auto'
    });
    // 获取渲染上下文
    this.ctx = this.canvas.getContext('2d'); 
    this.drawPlate();   
    this.bindEvent();
};

// 绘制九个圆圈
HandUnclock.prototype.drawPlate = function() {
    var radius = this.option.cirRadius;
    var space = this.option.space;
    // 左右留白
    var padding = Math.floor((this.option.width - 6*radius - 2*space)/2);
    // 上下留白
    var margin = Math.floor((this.option.height - 6*radius - 2*space)/2);

    for (var i = 0; i < 3; i++) {   // 绘制3*3的圈圈节点
        for (var j = 0; j < 3; j++) {
            var x = padding + radius + j * (2 * radius + space);
            var y = margin + radius + i * (2 * radius + space);
            var point = new Point(x, y, i*3 + j + 1);
            this.drawCirle(point);
            this.pointList.push(point);
        }
    }
    this.ImageData = this.ctx.getImageData(0, 0, this.option.width, this.option.height);
};

// 绘制一个圆
HandUnclock.prototype.drawCirle = function(point, fillColor, strokeColor) {
    this.ctx.fillStyle = arguments.length > 1 ? fillColor : this.option.cirColor;
    this.ctx.strokeStyle = arguments.length > 2? strokeColor : this.option.cirStrokeColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, this.option.cirRadius, 0, 2*Math.PI);
    this.ctx.stroke();
    this.ctx.fill();
};

// 重置为起始状态
HandUnclock.prototype.reset = function() {
    // 清空绘图 
    this.ctx.clearRect(0, 0, this.option.width, this.option.height);
    this.ctx.putImageData(this.ImageData, 0, 0);
}

// 绘制连线
HandUnclock.prototype.drawLine = function(point) {
    this.reset();
    // 重新绘制按钮区
    for (var i in this.ongoing) {
        this.drawCirle(this.ongoing[i], this.option.cirActiveFill, this.option.cirActiveStroke);
    }
    this.ctx.strokeStyle = this.option.lineColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    // 重新绘制连接线，Move到第一个节点，再通过lineTo连接其他节点
    for (var i in this.ongoing) {
        if (i == 0) {
            this.ctx.moveTo(this.ongoing[i].x, this.ongoing[i].y);
        } else {
            this.ctx.lineTo(this.ongoing[i].x, this.ongoing[i].y);
        }
    }
    // 连接到最近触摸点
    if (point)
        this.ctx.lineTo(point.x, point.y);

    this.ctx.stroke();
};

// 判断坐标点是否在按钮区
HandUnclock.prototype.findPoint = function(x,y) {
    var squareRadius = Math.pow(this.option.cirRadius, 2);
    for (var i in this.pointList) {
        var distance = Math.pow(this.pointList[i].x - x, 2) + Math.pow(this.pointList[i].y - y, 2);
        if (distance < squareRadius) {
            return this.pointList[i];
        }
    }
    return null;
}

// 绑定触摸事件
HandUnclock.prototype.bindEvent = function() {
    var $canvas = $(this.canvas);
    $canvas.on('mousedown touchstart',{self: this}, handleStart);
    $canvas.on('mousemove touchmove',{self: this}, handleMove);
    $canvas.on('mouseup touchend', {self: this}, handleEnd);

    // 触摸屏幕，进入解锁状态
    function handleStart(evt) {
        var self = evt.data.self;
        self.ongoing = [];  // 清空之前存储的轨迹
        self.touching = true;   // 开始滑动标识
        var touchPoint = getTouchPoint(evt);
        var point = self.findPoint(touchPoint.x, touchPoint.y);
        if (point) {    // 点亮触摸的按钮区，并加入轨迹数组
            self.drawCirle(point, self.option.cirActiveFill);
            self.ongoing.push(point);
        }
    }

    // 触摸移动，绘制连接线
    function handleMove(evt) {
        var self = evt.data.self;
        if (self.touching) {
            var touchPoint = getTouchPoint(evt);
            var point = self.findPoint(touchPoint.x, touchPoint.y);
            // 点亮触摸的按钮区，并加入轨迹数组
            if (point && !isStored(point, self.ongoing)) {    
                self.ongoing.push(point);
            }
            self.drawLine(touchPoint);
        }
    }

    // 手指离开，轨迹清空
    function handleEnd(evt) {
        var self = evt.data.self;
        self.touching = false;
        self.drawLine();
        var curPwd = self.getCurPwd();
        switch(self.status) {
            case 0:  // 设置密码
                if (curPwd.length < 5) {
                    $('.tips span').text(HandUnclock.MESSAGE.tooShort);
                } else {
                    localStorage.setItem('gesturePwd', curPwd);
                    $('.tips span').text(HandUnclock.MESSAGE.tips[1]);
                    self.status = 1;
                }
               break;
            case 1:  // 第二次输入密码
                if (localStorage.getItem('gesturePwd') == curPwd) {
                    $('.tips span').text(HandUnclock.MESSAGE.setOk);
                } else {
                    $('.tips span').text(HandUnclock.MESSAGE.notSame);
                }
                self.status = 0;
                break;
            case 2:  // 验证密码
                var localPwd = localStorage.getItem('gesturePwd');
                if (localPwd == null) {
                    $('.tips span').text(HandUnclock.MESSAGE.noPwd);
                    break;
                } 
                if (localPwd == curPwd) {
                    $('.tips span').text(HandUnclock.MESSAGE.pwdSuccess);
                } else {
                    $('.tips span').text(HandUnclock.MESSAGE.pwdError);
                }
        }
        // 半秒后清除绘图
        setTimeout(function() {
            self.reset();
        }, 500);
    }

    

    // 获取mouse或者touch的触摸点
    function getTouchPoint(evt) {
        evt.preventDefault();
        var x = evt.pageX || evt.changedTouches[0].pageX - $canvas.offset().left;
        var y = evt.pageY || evt.changedTouches[0].pageY - $canvas.offset().top;
        return new Point(x, y);
    }
};

// 获取当前轨迹下的坐标，即输入密码
HandUnclock.prototype.getCurPwd = function() {
    var pwd = [];
    for (var i in this.ongoing) {
        pwd.push(this.ongoing[i].value);
    }
    return pwd.join('');
}

HandUnclock.prototype.setStatus = function(status) {
    this.status = status;
}

// 定义坐标点
function Point(x, y, value) {
    this.x = x;
    this.y = y;
    // 对应的圆圈坐标：1～9
    this.value = value || -1;
}

// 判断给定点是否在数组中
function isStored(point, pointList) {
    for (var i in pointList) {
        if (pointList[i] == point)
            return true;
    }
    return false;
}