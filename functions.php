<?php



function oblivion_setup() {
    // 注册导航菜单
    register_nav_menus(array(
        'primary' => __('主菜单', 'oblivion'),
        'footer'  => __('页脚菜单', 'oblivion')
    ));

    // 支持特色图像
    add_theme_support('post-thumbnails');

    // 支持自动feed链接
    add_theme_support('automatic-feed-links');

    // 支持标题标签
    add_theme_support('title-tag');

    // 自定义页眉
    $header_args = array(
        'width'       => 1200,
        'height'      => 400,
        'flex-width'  => true,
        'flex-height' => true
    );
    add_theme_support('custom-header', $header_args);

    // 注册小工具区域
    register_sidebar(array(
        'name'          => __('主侧边栏', 'oblivion'),
        'id'            => 'primary-sidebar',
        'description'   => __('显示在文章和页面的侧边栏内容', 'oblivion'),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>'
    ));
}
add_action('after_setup_theme', 'oblivion_setup');

// 加载主题文本域
function oblivion_load_textdomain() {
    load_theme_textdomain('oblivion', get_template_directory() . '/languages');
}
add_action('after_setup_theme', 'oblivion_load_textdomain');

// 添加主题定制器选项
function oblivion_customize_register($wp_customize) {
    // 主色调设置
    $wp_customize->add_setting('primary_color', array(
        'default' => '#2c3e50',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
    
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'primary_color', array(
        'label' => __('主色调', 'oblivion'),
        'section' => 'colors',
        'settings' => 'primary_color'
    )));

    // 社交媒体设置
    $wp_customize->add_section('social_media', array(
        'title' => __('社交媒体', 'oblivion'),
        'priority' => 30,
    ));

    $social_platforms = array('facebook', 'twitter', 'instagram', 'weibo');
    foreach ($social_platforms as $platform) {
        $wp_customize->add_setting($platform . '_url', array(
            'default' => '',
            'sanitize_callback' => 'esc_url_raw',
        ));
        
        $wp_customize->add_control($platform . '_url', array(
            'label' => ucfirst($platform) . ' URL',
            'section' => 'social_media',
            'type' => 'url'
        ));
    }
}
add_action('customize_register', 'oblivion_customize_register');

// 输出自定义颜色样式
function oblivion_custom_colors() {
    $primary_color = get_theme_mod('primary_color', '#2c3e50');
    ?>
    <style type="text/css">
        :root {
            --primary-color: <?php echo $primary_color; ?>;
        }
        a,
        .post-title a:hover,
        .post-meta a:hover {
            color: var(--primary-color);
        }
        .search-submit,
        .page-numbers.current {
            background-color: var(--primary-color);
        }
    </style>
    <?php
}
add_action('wp_head', 'oblivion_custom_colors');

// 面包屑导航功能
function oblivion_breadcrumbs() {
    echo '<nav class="breadcrumbs">';
    echo '<a href="' . home_url() . '">' . __('首页', 'oblivion') . '</a>';
    
    if (is_single() || is_page()) {
        echo ' &raquo; ';
        the_title();
    } elseif (is_category()) {
        echo ' &raquo; ';
        single_cat_title();
    } elseif (is_tag()) {
        echo ' &raquo; ';
        single_tag_title();
    } elseif (is_search()) {
        echo ' &raquo; ' . __('搜索结果：', 'oblivion') . get_search_query();
    }
    
    echo '</nav>';
}

// 添加谷歌字体
function oblivion_enqueue_styles() {
    wp_enqueue_style('google-fonts', 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300;500&display=swap');
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
    // 添加tocbot样式
    wp_enqueue_style('tocbot', 'https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.12.3/tocbot.css');
    // 添加tocbot脚本
    wp_enqueue_script('tocbot', 'https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.12.3/tocbot.min.js', array(), '4.12.3', true);
}
add_action('wp_enqueue_scripts', 'oblivion_enqueue_styles');

// 更新悬浮菜单脚本
function oblivion_floating_menu_script() {
    ?>
    <script>
    (function() {
        const floatingNav = document.querySelector('.floating-nav');
        const submenuParents = document.querySelectorAll('.menu-item-has-children');
        let lastScrollY = window.scrollY;
        let isScrolling;

        // 处理子菜单点击事件
        submenuParents.forEach(parent => {
            const link = parent.querySelector('a');
            if (link) {
                link.addEventListener('click', (e) => {
                    if (window.innerWidth <= 1024) {
                        e.preventDefault();
                        parent.classList.toggle('active');
                    }
                });
            }
        });

        // 处理滚动事件
        window.addEventListener('scroll', function() {
            const currentScrollY = window.scrollY;
            const scrollingDown = currentScrollY > lastScrollY;

            // 清除之前的定时器
            clearTimeout(isScrolling);

            // 根据滚动方向控制导航栏
            if (scrollingDown && currentScrollY > 100) {
                floatingNav.classList.add('nav-hidden');
            } else {
                floatingNav.classList.remove('nav-hidden');
            }

            lastScrollY = currentScrollY;

            // 设置新的定时器
            isScrolling = setTimeout(() => {
                if (currentScrollY < 100) {
                    floatingNav.classList.remove('nav-hidden');
                }
            }, 66);

        }, { passive: true });
    })();
    </script>
    <?php
}
add_action('wp_footer', 'oblivion_floating_menu_script');

// 在悬浮菜单脚本后添加
function oblivion_night_mode_script() {
    ?>
    <script>
    (function() {
        const nightMode = {
            init() {
                this.toggleBtn = document.querySelector('.night-mode-toggle')
                this.initEvents()
                this.loadPreference()
            },
            
            initEvents() {
                this.toggleBtn?.addEventListener('click', () => {
                    document.body.classList.toggle('night-mode')
                    localStorage.setItem('nightMode', document.body.classList.contains('night-mode'))
                })
            },
            
            loadPreference() {
                if (localStorage.getItem('nightMode') === 'true') {
                    document.body.classList.add('night-mode')
                }
            }
        }
        document.addEventListener('DOMContentLoaded', () => nightMode.init())
    })()
    </script>
    <?php
}
add_action('wp_footer', 'oblivion_night_mode_script');

// 移除WordPress管理工具栏
add_filter('show_admin_bar', '__return_false');

// 文章浏览量统计
function set_post_views() {
    if (is_single()) {
        $post_id = get_the_ID();
        $count = get_post_meta($post_id, 'post_views', true);
        
        if ($count == '') {
            delete_post_meta($post_id, 'post_views');
            add_post_meta($post_id, 'post_views', 1);
        } else {
            update_post_meta($post_id, 'post_views', $count + 1);
        }
    }
}
add_action('wp_head', 'set_post_views');

function get_post_views($post_id) {
    $count = get_post_meta($post_id, 'post_views', true);
    
    if ($count == '') {
        delete_post_meta($post_id, 'post_views');
        add_post_meta($post_id, 'post_views', 0);
        return 0;
    }
    
    return $count;
}

// 添加用户在线状态元数据
function add_user_online_status() {
    if (is_user_logged_in()) {
        $user_id = get_current_user_id();
        update_user_meta($user_id, 'last_active', current_time('mysql'));
    }
}
add_action('init', 'add_user_online_status');

// 检查用户是否在线（15分钟内活动）
function is_user_online($user_id) {
    $last_active = get_user_meta($user_id, 'last_active', true);
    if (!$last_active) return false;
    
    $last_active_time = strtotime($last_active);
    $current_time = current_time('timestamp');
    
    return ($current_time - $last_active_time) < 900; // 15分钟 = 900秒
}

// 修改账户下拉菜单函数
function get_account_dropdown() {
    if (!is_user_logged_in()) {
        return sprintf(
            '<div class="account-dropdown"><a href="%s">%s</a><a href="%s">%s</a></div>',
            esc_url(wp_login_url()),
            esc_html__('登录', 'oblivion'),
            esc_url(wp_registration_url()),
            esc_html__('注册', 'oblivion')
        );
    }
    $current_user = wp_get_current_user();
    $is_online = is_user_online($current_user->ID);
    $online_status = $is_online ? '<span class="online-status"></span>' : '';
    $avatar = get_avatar($current_user->ID, 32);
    return sprintf(
        '<div class="account-dropdown">
            <div class="user-avatar-wrapper">
                <div class="avatar-container">
                    %s
                    %s
                </div>
                <div class="user-menu">
                    <a href="%s">%s</a>
                    <a href="%s">%s</a>
                </div>
            </div>
        </div>',
        $avatar,
        $online_status,
        esc_url(get_edit_profile_url()),
        esc_html__('个人资料', 'oblivion'),
        esc_url(wp_logout_url(home_url())),
        esc_html__('退出登录', 'oblivion')
    );
}

// 添加tocbot初始化脚本
function oblivion_tocbot_script() {
    if (is_single()) {  // 仅在文章页面加载
        ?>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                tocbot.init({
                    contentSelector: '.js-toc-content',
                    tocSelector: '.js-toc',
                    headingSelector: '.post-content-inner h1, h2, h3, h4',  // 只识别文章内容中的标题
                    hasInnerContainers: true,
                    linkClass: 'toc-link',
                    activeLinkClass: 'is-active-link',
                    listClass: 'toc-list',
                    isCollapsedClass: 'is-collapsed',
                    collapsibleClass: 'is-collapsible',
                    scrollSmooth: true,
                    scrollSmoothOffset: -100,
                    orderedList: false,
                    collapseDepth: 6,
                    ignoreHiddenElements: false,
                    includeTitleTags: true,
                    headingsOffset: 100
                });
            });
        </script>
        <?php
    }
}
add_action('wp_footer', 'oblivion_tocbot_script');

// 添加滚动进度条脚本
function oblivion_scroll_progress_script() {
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const progressBar = document.querySelector('.scroll-progress-bar');
        
        function updateProgress() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = window.scrollY;
            
            const progress = (scrolled / documentHeight) * 100;
            progressBar.style.width = progress + '%';
        }
        
        // 监听滚动事件
        window.addEventListener('scroll', updateProgress);
        // 初始化进度条
        updateProgress();
    });
    </script>
    <?php
}
add_action('wp_footer', 'oblivion_scroll_progress_script');

// 添加返回顶部按钮脚本
function oblivion_back_to_top_script() {
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const backToTop = document.querySelector('.back-to-top');
        
        function toggleBackToTop() {
            if (window.scrollY > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        }
        
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        window.addEventListener('scroll', toggleBackToTop);
        // 初始化按钮状态
        toggleBackToTop();
    });
    </script>
    <?php
}
add_action('wp_footer', 'oblivion_back_to_top_script');

// 添加Gravatar支持
function oblivion_gravatar_url($url) {
    // 使用Gravatar的中国镜像服务器
    return str_replace(array(
        'www.gravatar.com',
        '0.gravatar.com',
        '1.gravatar.com',
        '2.gravatar.com',
        'secure.gravatar.com'
    ), 'cravatar.cn', $url);
}
add_filter('get_avatar_url', 'oblivion_gravatar_url', 10, 1);

// 自定义Gravatar默认头像
function oblivion_default_avatar($avatar_defaults) {
    $custom_avatar = get_template_directory_uri() . '/images/default-avatar.png';
    $avatar_defaults[$custom_avatar] = 'Oblivion默认头像';
    return $avatar_defaults;
}
add_filter('avatar_defaults', 'oblivion_default_avatar');

// 修改Gravatar头像大小和样式
function oblivion_get_avatar($avatar) {
    $avatar = str_replace('class=\'avatar', 'class=\'avatar avatar-custom', $avatar);
    return $avatar;
}
add_filter('get_avatar', 'oblivion_get_avatar');