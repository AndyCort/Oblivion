/**
 * 夜间模式功能
 * 管理网站的夜间/日间模式切换
 */
(function() {
    // DOM元素
    let darkModeToggle;
    
    // 初始化函数
    function init() {
        // 获取夜间模式切换按钮
        darkModeToggle = document.querySelector('.dark-mode-toggle');
        if (!darkModeToggle) return;
        
        // 从本地存储中获取夜间模式状态
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        // 根据存储的状态设置初始模式
        if (isDarkMode) {
            document.documentElement.classList.add('dark-mode');
            darkModeToggle.classList.add('active');
        }
        
        // 添加点击事件监听器
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // 切换夜间模式
    function toggleDarkMode() {
        // 切换根元素的dark-mode类
        document.documentElement.classList.toggle('dark-mode');
        
        // 切换按钮的active类
        darkModeToggle.classList.toggle('active');
        
        // 更新本地存储中的状态
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        
        // 触发自定义事件，方便其他组件响应夜间模式变化
        const event = new CustomEvent('darkModeChange', { detail: { isDarkMode } });
        document.dispatchEvent(event);
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
