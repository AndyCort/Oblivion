<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php bloginfo('description'); ?>">
<title><?php wp_title('|', true, 'right'); ?></title>
        <link rel="stylesheet" href="<?php echo get_template_directory_uri() ?>/style.css">
        <?php wp_head(); ?>
        <?php $options = get_option('oblivion_basic_options'); ?>
        <meta name="keywords" content="<?php echo esc_attr($options['keywords'] ?? ''); ?>">
        <meta name="description" content="<?php echo esc_attr($options['description'] ?? get_bloginfo('description')); ?>">
        <?php if(!empty($options['favicon'])): ?>
        <link rel="shortcut icon" href="<?php echo esc_url($options['favicon']); ?>" type="image/x-icon">
        <?php endif; ?>
    </head>
<body <?php body_class(); ?>>

    <!-- 页面滚动进度条 -->
    <div class="scroll-progress-bar"></div>

       <!-- 悬浮菜单栏 -->
       <nav class="floating-nav">
            <div class="brand-box">
                <?php if (has_custom_logo()) : ?>
            <div class="site-logo"><?php the_custom_logo(); ?></div>
                    <?php endif; ?>
                    <a href="<?php echo home_url(); ?>" class="site-title">
                <?php bloginfo('name'); ?>
                </a>
                </div>
             <?php
            // 显示主菜单
                wp_nav_menu(array(
                'theme_location' => 'primary',
                'menu_class'     => 'floating-menu',
                'container'      => false,
                'depth'          => 3, //允许多级菜单
                'items_wrap'     => '<ul class="%2$s">%3$s</ul>'
                ));
                ?>
               <div class="menu-extras">
                   <div class="menu-search">
                       <div class="search-box">
                           <form action="<?php echo esc_url(home_url("/")); ?>">
                               <input type="search" 
                                   name="s" 
                                   placeholder="搜索..." 
                                   aria-label="搜索"
                                   class="search-input">
                               <button type="submit">
                                   <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                       <path d="M23.809 21.646l-6.205-6.205c1.167-1.605 1.857-3.579 1.857-5.711 0-5.365-4.365-9.73-9.731-9.73-5.365 0-9.73 4.365-9.73 9.73 0 5.366 4.365 9.73 9.73 9.73 2.034 0 3.923-.627 5.487-1.698l6.238 6.238 2.354-2.354zm-20.955-11.916c0-3.792 3.085-6.877 6.877-6.877s6.877 3.085 6.877 6.877-3.085 6.877-6.877 6.877c-3.793 0-6.877-3.085-6.877-6.877z"/>
                                   </svg>
                               </button>
                           </form>
                       </div>
                   </div>
                   <div class="menu-account">
                       <?php echo get_account_dropdown(); ?>
                   </div>
                   <div class="night-mode-toggle">
                       <i class="fas fa-moon"></i>
                   </div>
               </div>
        </nav>

<div class="heart-animation">
    <?php for($i=0; $i<8; $i++): ?>
        <div class="heart-decoration">❤</div>
    <?php endfor; ?>
</div> 