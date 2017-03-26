/*
功能：1. 设置密码； 2. 验证密码
1 提示输入手势密码－》长度校验－》再次输入相同的密码－》重复验证－》提示设置成功 OR 重新输入密码
2 验证密码－》若不成功则等待用户输入（可加次数限制）
*/


function HandUnclock (canvas, opt) {
    this.canvas = document.getElementById(canvas);
    this.ctx = this.canvas.getContext('2d');

    this.option = {width: this.canvas.width, height: this.canvas.height};
    $.extend(this.option, HandUnclock.DEFAULT, opt);
    this.init();
}

HandUnclock.prototype.init = function() {
    this.drawPlate();
    this.bindEvent();
};

// 绘制九点
HandUnclock.prototype.drawPlate = function() {
    // 按钮的四周空白间隔
    var radius = this.option.cirRadius;
    var space = this.option.space;
    var padding = Math.floor((this.option.width - 3*2*radius - 2*space)/2);
    var marginTop = Math.floor((this.option.height - 3*2*radius - 2*space)/2);
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var x = padding + radius + j * (2 * radius + space);
            var y = marginTop + radius + i * (2 * radius + space);
            this.drawCirle(new Point(x, y));
        }
    }
};

// 绘制一个圆
HandUnclock.prototype.drawCirle = function(point, color) {
    this.ctx.fillStyle = arguments > 1 ? color : this.option.cirColor;
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, this.option.cirRadius, 0, 2*Math.PI);
    this.ctx.fill();
};

HandUnclock.prototype.drawLine = function() {

};

HandUnclock.prototype.bindEvent = function() {

};

HandUnclock.prototype.verifyPwd = function() {

};

// 定义坐标点
function Point(x, y) {
    this.x = x;
    this.y = y;
}

HandUnclock.DEFAULT = {
    space: 50,
    cirRadius: 30,
    cirColor: 'rgb(255,255,255)',
    cirActiveColor: 'rgb(236,140,30)',
    lineColor: 'rgb(215,27,30)'

};

HandUnclock.MESSAGE = {
    tooShort: '密码太短，至少需要5个点',
    notSame: '两次输入的不一致',
    setOk: '密码设置成功',
    pwdError: '输入的密码不正确',
    pwdSuccess: '密码正确',
    tips: ['请输入手势密码', '请再次输入手势密码']
};
