/**
 * 侧边栏按钮交互效果
 * 控制菜单按钮悬停时子按钮的显示和隐藏
 */
(function() {
    // DOM元素
    let menuToggle;
    let childContainer;
    let hoverTimer;
    const hoverDelay = 300; // 悬停延迟时间(毫秒)
    
    // 初始化函数
    function init() {
        // 获取相关DOM元素
        menuToggle = document.querySelector('.menu-toggle');
        childContainer = document.querySelector('.side-button-container .child');
        
        // 确保元素存在
        if (!menuToggle || !childContainer) {
            console.warn('侧边栏菜单元素未找到');
            return;
        }
        
        // 初始状态设置
        childContainer.classList.add('hidden');
        
        // 绑定事件监听器
        setupEventListeners();
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 菜单按钮悬停事件
        menuToggle.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimer);
            showChildContainer();
        });
        
        // 菜单按钮离开事件
        menuToggle.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(hideChildContainer, hoverDelay);
        });
        
        // 子容器悬停事件（防止鼠标移入子容器时消失）
        childContainer.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimer);
        });
        
        // 子容器离开事件
        childContainer.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(hideChildContainer, hoverDelay);
        });
    }
    
    // 显示子容器
    function showChildContainer() {
        // 移除隐藏类
        childContainer.classList.remove('hidden');
        childContainer.classList.remove('fade-out');
        
        // 添加淡入动画
        // 使用setTimeout确保CSS过渡效果正常触发
        setTimeout(() => {
            childContainer.classList.add('fade-in');
        }, 10);
    }
    
    // 隐藏子容器
    function hideChildContainer() {
        // 添加淡出动画
        childContainer.classList.remove('fade-in');
        childContainer.classList.add('fade-out');
        
        // 动画结束后添加隐藏类
        setTimeout(() => {
            if (childContainer.classList.contains('fade-out')) {
                childContainer.classList.add('hidden');
            }
        }, 300); // 与CSS过渡时间一致
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
