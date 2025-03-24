<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php bloginfo('description'); ?>">
    <title><?php wp_title('|', true, 'right'); ?></title>
    <script>
        // 如果支持 JavaScript，移除 no-js 类
        document.documentElement.className = document.documentElement.className.replace('no-js', 'js');
    </script>
    <?php wp_head(); ?>
    <?php $options = get_option('oblivion_basic_options'); ?>
    <meta name="keywords" content="<?php echo esc_attr($options['keywords'] ?? ''); ?>">
    <meta name="description" content="<?php echo esc_attr($options['description'] ?? get_bloginfo('description')); ?>">
    <?php if(!empty($options['favicon'])): ?>
        <link rel="shortcut icon" href="<?php echo esc_url($options['favicon']); ?>" type="image/x-icon">
    <?php endif; ?>
</head>
<body>
    <!-- 页面滚动进度条 -->
    <div class="scroll-progress-bar"></div>
    <!-- 悬浮菜单栏 -->
    <nav class="header-nav glass">
        <!-- 左侧 -->
        <div class="nav-left">
            <div class="site-title">
                <a href="<?php echo home_url(); ?>" >
                    <?php bloginfo('name'); ?>
                </a>
            </div>
        </div>
        <!-- 中间 -->
        <div class="nav-middle">
            <?php
                // 显示主菜单
                    wp_nav_menu(array(
                    'theme_location' => 'primary',
                    'menu_class'     => 'floating-menu',
                    'container'      => false,
                    'depth'          => 3, //允许多级菜单
                    'items_wrap'     => '<ul class="%2$s">%3$s</ul>',
                    'walker'         => new Oblivion_Menu_Walker()
                    ));
                    ?>
        </div>
        <!-- 右侧 -->
        <div class="nav-right">
            <!-- 搜索框 -->
            <div class="search-box">
                <form action="<?php echo esc_url(home_url("/")); ?>">
                    <input type="search" name="s" placeholder="搜索..." aria-label="搜索" class="search-input">
                    <button type="submit">
                        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                            <path d="M23.809 21.646l-6.205-6.205c1.167-1.605 1.857-3.579 1.857-5.711 0-5.365-4.365-9.73-9.731-9.73-5.365 0-9.73 4.365-9.73 9.73 0 5.366 4.365 9.73 9.73 9.73 2.034 0 3.923-.627 5.487-1.698l6.238 6.238 2.354-2.354zm-20.955-11.916c0-3.792 3.085-6.877 6.877-6.877s6.877 3.085 6.877 6.877-3.085 6.877-6.877 6.877c-3.793 0-6.877-3.085-6.877-6.877z"/>
                        </svg>
                    </button>
                </form>
            </div>
            <!-- 账户 -->
            <div class="menu-account">
                <?php echo get_account_dropdown(); ?>
            </div>
        </div>
    </nav>
    <!-- 背景图片 -->
    <div class="bg-pic">
        <img src="https://cdn.jsdelivr.net/gh/AndyCort/picx-images-hosting@master/background/bg-oblivion.2rvatw09xa.png" alt="背景图片">
    </div>
    <!-- 爱心动画 -->
    <div class="heart-animation">
        <!-- 爱心将通过JavaScript动态创建 -->
    </div>
    
    <!-- 侧边栏按钮 -->
    <div class="side-button-container">
        <div class="main">
            <!-- 返回顶部 -->
            <div class="back-to-top side-button glass">
                <i class="fas fa-arrow-up"></i>
            </div>
            <!-- 导航菜单按钮（单独放置） -->
            <div class="menu-toggle side-button glass">
                <i class="fas fa-bars"></i>
            </div>
            <!-- 返回底部 -->
            <div class="back-to-bottom side-button glass">
                <i class="fas fa-arrow-down"></i>
            </div>
        </div>
        <div class="child">
            <!-- 夜间模式 -->
            <div class="dark-mode-toggle side-button glass">
                <i class="fas fa-moon"></i>
            </div>
        </div>
    </div>
    <!-- 底部导航栏 -->
    <nav class="bottom-nav glass">
        <div class="home-button">
            <a href="<?php echo home_url(); ?>">
                <i class="fas fa-home"></i>
            </a>    
        </div>
        <div class="search-button">
            <a href="<?php echo home_url(); ?>">
                <i class="fas fa-search"></i>
            </a>
        </div>
        <div class="account-button">
            <?php echo get_account_dropdown(); ?>
        </div> 
    </nav>
