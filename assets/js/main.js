(function() {
    // 初始化所有功能
    function initAll() {
        initScrollProgress();
        initTagsToggle();
        // initMobileMenu(); // 注释掉未定义的函数
        initWelcomeSection();
        initScrollButtons();
        initPostListAnimation();
        
        // 确保文章列表中的所有文章都可见
        const postItems = document.querySelectorAll('.post-item');
        if (postItems.length > 0) {
            postItems.forEach(item => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            });
        }
        
        console.log("所有功能初始化完成");
    }

    // 如果DOM已加载则直接执行，否则等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    // 滚动按钮功能（回到顶部和回到底部）
    function initScrollButtons() {
        console.log("初始化滚动按钮...");
        
        // 确保按钮元素存在，如果不存在则创建
        let backToTop = document.querySelector('.back-to-top');
        let backToBottom = document.querySelector('.back-to-bottom');
        
        if (!backToTop) {
            console.log("创建回到顶部按钮");
            backToTop = document.createElement('div');
            backToTop.className = 'back-to-top side-button glass';
            backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
            document.body.appendChild(backToTop);
        }
        
        if (!backToBottom) {
            console.log("创建回到底部按钮");
            backToBottom = document.createElement('div');
            backToBottom.className = 'back-to-bottom side-button glass';
            backToBottom.innerHTML = '<i class="fas fa-arrow-down"></i>';
            document.body.appendChild(backToBottom);
        }
        
        console.log("按钮状态: 顶部=", backToTop, "底部=", backToBottom);
        
        // 显示/隐藏按钮
        function updateButtonVisibility() {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // 回到顶部按钮 - 滚动超过300px时显示
            if (scrollY > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
            
            // 回到底部按钮 - 距离底部超过500px时显示
            if (documentHeight - scrollY - windowHeight > 500) {
                backToBottom.classList.add('show');
            } else {
                backToBottom.classList.remove('show');
            }
        }
        
        window.addEventListener('scroll', updateButtonVisibility);
        
        // 回到顶部
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("点击回到顶部按钮");
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // 回到底部
        backToBottom.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("点击回到底部按钮");
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
        });
        
        // 手动触发一次滚动事件以正确显示/隐藏按钮
        setTimeout(function() {
            updateButtonVisibility();
            console.log("滚动按钮初始化完成");
        }, 500);
    }

    // 标签收缩功能
    function initTagsToggle() {
        const tagWrappers = document.querySelectorAll('.post-categories-wrapper');
        
        tagWrappers.forEach(wrapper => {
            const categories = wrapper.querySelector('.post-categories');
            const toggleBtn = wrapper.querySelector('.tags-toggle-btn');
            
            if (!categories || !toggleBtn) return;
            
            // 检查是否需要显示切换按钮
            const categoriesHeight = categories.scrollHeight;
            if (categoriesHeight <= 60) { // 如果标签高度不超过默认高度，隐藏按钮
                toggleBtn.style.display = 'none';
                wrapper.classList.add('no-overflow');
                return;
            }
            
            // 添加点击事件 - 简化版本，只切换类名
            toggleBtn.addEventListener('click', function() {
                categories.classList.toggle('expanded');
                toggleBtn.classList.toggle('active');
                
                // 更新按钮提示文本
                if (categories.classList.contains('expanded')) {
                    toggleBtn.setAttribute('title', '收起标签');
                } else {
                    toggleBtn.setAttribute('title', '展开标签');
                }
            });
        });
    }

    // 滚动进度条功能
    function initScrollProgress() {
        const progressBar = document.querySelector('.scroll-progress-bar');
        if (progressBar) {
            function updateProgress() {
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight - windowHeight;
                const scrolled = window.scrollY;
                if (documentHeight > 0) {
                    const progress = Math.min((scrolled / documentHeight) * 100, 100);
                    progressBar.style.width = progress + '%';
                }
            }
            window.addEventListener('scroll', updateProgress);
            window.addEventListener('resize', updateProgress);
            updateProgress();
        }
    }

    // 下拉菜单延迟隐藏
    document.addEventListener('DOMContentLoaded', function() {
        // 仅处理账户下拉菜单
        const accountDropdowns = document.querySelectorAll('.account-dropdown .user-avatar-wrapper');
        let accountTimeout;
        
        accountDropdowns.forEach(dropdown => {
            const menu = dropdown.querySelector('.user-menu');
            if (!menu) return;
            
            dropdown.addEventListener('mouseenter', () => {
                clearTimeout(accountTimeout);
                menu.style.display = 'flex';
                setTimeout(() => {
                    menu.style.opacity = '1';
                    menu.style.transform = 'scale(1)';
                    menu.style.visibility = 'visible';
                    menu.style.pointerEvents = 'auto';
                }, 10);
            });
            
            dropdown.addEventListener('mouseleave', () => {
                accountTimeout = setTimeout(() => {
                    menu.style.opacity = '0';
                    menu.style.transform = 'scale(0.95)';
                    menu.style.visibility = 'hidden';
                    menu.style.pointerEvents = 'none';
                    setTimeout(() => {
                        if (menu.style.visibility === 'hidden') {
                            menu.style.display = 'none';
                        }
                    }, 300);
                }, 500); // 500ms 延迟
            });
            
            menu.addEventListener('mouseenter', () => {
                clearTimeout(accountTimeout);
            });
            
            menu.addEventListener('mouseleave', () => {
                accountTimeout = setTimeout(() => {
                    menu.style.opacity = '0';
                    menu.style.transform = 'scale(0.95)';
                    menu.style.visibility = 'hidden';
                    menu.style.pointerEvents = 'none';
                    setTimeout(() => {
                        if (menu.style.visibility === 'hidden') {
                            menu.style.display = 'none';
                        }
                    }, 300);
                }, 500); // 500ms 延迟
            });
        });
    });

    // 初始化文章列表动画
    function initPostListAnimation() {
        // 处理文章列表
        const postItems = document.querySelectorAll('.post-item');
        if (postItems.length > 0) {
            // 确保所有文章都可见
            postItems.forEach((item, index) => {
                // 设置初始状态
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                
                // 添加延迟动画效果
                setTimeout(() => {
                    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 100 + index * 100); // 每篇文章延迟100ms
            });
        }
    }

 
    // 初始化欢迎区域功能
    function initWelcomeSection() {
        const scrollDownHint = document.querySelector('.scroll-down-hint');
        const mainContent = document.querySelector('main.container') || document.querySelector('.container');
        
        if (scrollDownHint && mainContent) {
            scrollDownHint.addEventListener('click', function() {
                // 计算主内容区顶部位置
                const mainContentTop = mainContent.getBoundingClientRect().top + window.pageYOffset;
                
                // 平滑滚动到主内容区
                window.scrollTo({
                    top: mainContentTop,
                    behavior: 'smooth'
                });
            });
            
            // 鼠标悬停时添加指针样式
            scrollDownHint.style.cursor = 'pointer';
        }
        
        // 只在首页显示欢迎区域
        const welcomeSection = document.querySelector('.fullscreen-welcome');
        if (welcomeSection) {
            // 检查是否是首页
            if (!document.body.classList.contains('home')) {
                welcomeSection.style.display = 'none';
            }
        }
    }
})();

/**
 * 刷新引用
 */
jQuery(document).ready(function($) {
    // 使用代理事件监听处理可能的初始化问题
    $(document).on('click', '.refresh-quote-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $button = $(this);
        const $quoteContent = $('.quote-content');
        
        // 阻止重复点击
        if ($button.hasClass('loading')) {
            return;
        }
        
        // 添加加载状态
        $button.addClass('loading');
        console.log('刷新按钮被点击'); // 调试信息
        
        // Ajax请求新引用
        $.ajax({
            url: oblivion_vars.ajaxurl,
            type: 'POST',
            data: {
                action: 'refresh_quote',
                nonce: oblivion_vars.nonce
            },
            success: function(response) {
                console.log('成功获取引用', response); // 调试信息
                if (response.success && response.data.quote) {
                    // 使用淡入淡出效果更新引用
                    $quoteContent.fadeOut(300, function() {
                        $(this).html(response.data.quote).fadeIn(300);
                    });
                }
            },
            error: function(xhr, status, error) {
                console.error('刷新引用失败', error); // 调试信息
                alert('刷新引用失败，请稍后再试');
            },
            complete: function() {
                // 移除加载状态
                setTimeout(function() {
                    $button.removeClass('loading');
                }, 500);
            }
        });
    });
});

// 暗黑模式切换
const darkModeToggle = document.querySelector('.dark-mode-toggle');

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        const body = document.body;
        
        if (localStorage.getItem('darkMode') === 'true') {
            body.classList.add('dark-mode');
        }
        
        darkModeToggle.classList.toggle('active');
        body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
    });
}