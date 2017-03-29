/*
功能：1. 设置密码； 2. 验证密码
1 提示输入手势密码－》长度校验－》再次输入相同的密码－》重复验证－》提示设置成功 OR 重新输入密码
2 验证密码－》若不成功则等待用户输入（可加次数限制）
*/

(function() {
    HandUnclock.DEFAULT = {
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
        this.$container = $(container);
        // 配置参数
        this.option = HandUnclock.DEFAULT;
        extend(this.option, opt);
        // 保存所有的圆圈坐标
        this.pointList = [];  
        // 保存用户的手势  
        this.ongoing = [];   
        // 保存绘制好九宫格后的画布数据 
        this.ImageData = {};   
        // 是否滑动 
        this.touching = false;
        // 手势锁的状态 0: 第一次设置密码 1: 第二次输入密码 2: 等待验证密码
        this.status = 0;
        // 用于保存第一次输入的密码
        this.tempPwd = '';

        this.init();
    }

    HandUnclock.prototype.init = function() {
        // 生成canvas节点
        this.$container.innerHTML = '<canvas id="gesture" width="'+this.option.width+'" height="'+this.option.height+'"></canvas>';
        this.$canvas = $('#gesture');
        this.$canvas.setAttribute('style', 'display:block;margin:0 auto;background-color:' + this.option.bgColor);

        // 获取渲染上下文
        this.ctx = this.$canvas.getContext('2d'); 
        this.drawPlate();   
        this.bindEvent();
    };

    // 绘制九个圆圈
    HandUnclock.prototype.drawPlate = function() {
        var radius = this.option.radius;
        var space = this.option.space;
        var padding = Math.floor((this.option.width - 6*radius - 2*space)/2);   // 左右留白
        var margin = Math.floor((this.option.height - 6*radius - 2*space)/2);   // 上下留白

        for (var i = 0; i < 3; i++) {   // 绘制3*3的圈圈节点
            for (var j = 0; j < 3; j++) {
                var x = padding + radius + j * (2 * radius + space);
                var y = margin + radius + i * (2 * radius + space);
                var point = new Point(x, y, i*3+j+1);
                this.drawCirle(point);
                this.pointList.push(point);
            }
        }
        this.ImageData = this.ctx.getImageData(0, 0, this.option.width, this.option.height);
    };

    // 绘制一个圆
    HandUnclock.prototype.drawCirle = function(point, fillColor, strokeColor) {
        this.ctx.fillStyle = arguments.length > 1 ? fillColor : this.option.normalFillColor;
        this.ctx.strokeStyle = arguments.length > 2? strokeColor : this.option.normalStrokeColor;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, this.option.radius, 0, 2*Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
    };

    // 绘制连线
    HandUnclock.prototype.drawLine = function(point) {
        this.reset();
        // 重新绘制按钮区
        for (var i in this.ongoing) {
            this.drawCirle(this.ongoing[i], this.option.activeFillColor, this.option.activeStrokeColor);
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


    // 重置为起始状态
    HandUnclock.prototype.reset = function() {
        // 清空绘图 
        this.ctx.clearRect(0, 0, this.option.width, this.option.height);
        this.ctx.putImageData(this.ImageData, 0, 0);
    }

    // 判断坐标点是否在按钮区
    HandUnclock.prototype.findPoint = function(x,y) {
        var squareRadius = Math.pow(this.option.radius, 2);
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
        var $canvas = this.$canvas;
        var self = this;
        $canvas.addEventListener('touchstart', handleStart);
        $canvas.addEventListener('touchmove', handleMove);
        $canvas.addEventListener('touchend', handleEnd);

        // 触摸屏幕，进入解锁状态
        function handleStart(evt) {
            self.ongoing = [];  // 清空之前存储的轨迹
            self.touching = true;   // 开始滑动标识
            var touchPoint = getTouchPoint(evt);
            var point = self.findPoint(touchPoint.x, touchPoint.y);
            if (point) {    // 点亮触摸的按钮区，并加入轨迹数组
                self.drawCirle(point, self.option.activeFillColor);
                self.ongoing.push(point);
            }
        }

        // 触摸移动，绘制连接线
        function handleMove(evt) {
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
            self.touching = false;
            self.drawLine();
            var curPwd = self.getCurPwd();
            switch(self.status) {
                case 0:  // 设置密码
                    if (curPwd.length < 5) {
                        $('.tips span').innerHTML = HandUnclock.MESSAGE.tooShort;
                    } else {
                        self.tempPwd = curPwd;
                        $('.tips span').innerHTML = HandUnclock.MESSAGE.tips[1];
                        self.status = 1;
                    }
                   break;
                case 1:  // 第二次输入密码
                    if (self.tempPwd == curPwd) {
                        $('.tips span').innerHTML = HandUnclock.MESSAGE.setOk;
                        localStorage.setItem('gesturePwd', curPwd);
                    } else {
                        $('.tips span').innerHTML = HandUnclock.MESSAGE.notSame;
                    }
                    self.status = 0;
                    break;
                case 2:  // 验证密码
                    var localPwd = localStorage.getItem('gesturePwd');
                    if (localPwd == null) {
                        $('.tips span').innerHTML = HandUnclock.MESSAGE.noPwd;
                        break;
                    } 
                    if (localPwd == curPwd) {
                        $('.tips span').innerHTML = HandUnclock.MESSAGE.pwdSuccess;
                    } else {
                        $('.tips span').innerHTML = HandUnclock.MESSAGE.pwdError;
                    }
                    break;
            }
            // 半秒后清除绘图
            setTimeout(function() {
                self.reset();
            }, 500);
        }

        // 获取mouse或者touch的触摸点
        function getTouchPoint(evt) {
            evt.preventDefault();
            var x = evt.changedTouches[0].pageX - $canvas.offsetLeft;
            var y = evt.changedTouches[0].pageY - $canvas.offsetTop;
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

    // 模拟zepto的extend，拓展option
    function extend(target, source) {
        if (source) {
            for (var property in source) {
                target[property] = source[property];
            }
        }
    }

    // 辅助选择器函数
    function $(selector) {
        return document.querySelector(selector);
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

    window.HandUnclock = HandUnclock;
})();