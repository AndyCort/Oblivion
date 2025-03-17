/**
 * 爱心动画 - 从底部向上升起然后消失
 */
(function() {
    // 配置参数
    const config = {
        maxHearts: 10,                   // 同时显示的最大爱心数量
        colors: ['#FFB3C6', '#FF9EB7', '#FF89A8', '#FF749A'], // 爱心颜色
        minSize: 15,                     // 最小尺寸
        maxSize: 30,                     // 最大尺寸
        minDuration: 5,                  // 最小上升时间(秒)
        maxDuration: 10,                 // 最大上升时间(秒)
        interval: 800,                   // 生成爱心的时间间隔(毫秒)
    };

    // 变量
    let container;
    let heartCount = 0;
    let timer = null;
    let isActive = false;

    // 初始化函数
    function init() {
        // 获取或创建容器
        container = document.querySelector('.heart-animation');
        if (!container) {
            container = document.createElement('div');
            container.className = 'heart-animation';
            document.body.appendChild(container);
        }

        // 开始生成爱心
        start();
    }

    // 启动爱心生成
    function start() {
        if (isActive) return;
        
        isActive = true;
        timer = setInterval(createHeart, config.interval);
        console.log('爱心动画已启动');
    }

    // 停止爱心生成
    function stop() {
        if (!isActive) return;
        
        isActive = false;
        clearInterval(timer);
        console.log('爱心动画已停止');
    }

    // 创建单个爱心
    function createHeart() {
        // 如果已经达到最大数量，不再创建
        if (heartCount >= config.maxHearts) return;
        
        // 创建爱心元素
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '❤';
        heartCount++;
        
        // 随机属性
        const size = randomBetween(config.minSize, config.maxSize);
        const duration = randomBetween(config.minDuration, config.maxDuration);
        const startPositionLeft = randomBetween(5, 90); // 水平位置(%)
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        
        // 设置样式
        heart.style.fontSize = size + 'px';
        heart.style.color = color;
        heart.style.left = startPositionLeft + '%';
        heart.style.bottom = '-50px';
        heart.style.position = 'absolute';
        
        // 添加到容器
        container.appendChild(heart);
        
        // 设置过渡动画
        heart.style.transition = `bottom ${duration}s linear, opacity 1s ease-in, opacity 1s ease-out`;
        
        // 等待一帧再设置属性，确保过渡动画生效
        requestAnimationFrame(() => {
            // 淡入
            heart.style.opacity = '0.85';
            
            // 延迟一点后开始向上移动
            setTimeout(() => {
                // 向上移动
                heart.style.bottom = '105%';
                
                // 接近顶部时淡出
                setTimeout(() => {
                    heart.style.opacity = '0';
                    
                    // 移除元素
                    setTimeout(() => {
                        if (heart.parentNode) {
                            heart.parentNode.removeChild(heart);
                            heartCount--;
                        }
                    }, 1000);
                }, (duration * 1000) * 0.7); // 上升70%的时间后开始淡出
            }, 100);
        });
    }

    // 生成两个数之间的随机数
    function randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 导出接口以便其他脚本可以控制
    window.HeartAnimation = {
        start: start,
        stop: stop
    };
})();

