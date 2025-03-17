<?php
/**
 * Oblivion 主题函数文件
 * 
 * 包含主题的所有功能和自定义设置
 * 
 * @package Oblivion
 * @version 1.1.1
 */

if (!defined('ABSPATH')) {
    exit; // 禁止直接访问
}

/**
 * 主题设置
 */
function oblivion_setup() {
    // 加载文本域
    load_theme_textdomain('oblivion', get_template_directory() . '/languages');

    // 让 WordPress 管理标题标签
    add_theme_support('title-tag');
    
    // 启用特色图像支持
    add_theme_support('post-thumbnails');
    

    
    // 注册导航菜单
    register_nav_menus(array(
        'primary' => __('主菜单', 'oblivion'),
        'footer'  => __('页脚菜单', 'oblivion')
    ));
    
    // 添加 HTML5 支持
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ));


}
add_action('after_setup_theme', 'oblivion_setup');

/**
 * 自定义菜单 Walker 类，用于下拉菜单
 */
class Oblivion_Menu_Walker extends Walker_Nav_Menu {
    /**
     * 开始一个元素的输出
     */
    function start_el(&$output, $item, $depth = 0, $args = null, $id = 0) {
        $indent = ($depth) ? str_repeat("\t", $depth) : '';
        
        $classes = empty($item->classes) ? array() : (array) $item->classes;
        
        // 检查是否有子菜单
        if (in_array('menu-item-has-children', $classes)) {
            $classes[] = 'menu-item-has-children';
        }
        
        $class_names = join(' ', apply_filters('nav_menu_css_class', array_filter($classes), $item, $args, $depth));
        $class_names = $class_names ? ' class="' . esc_attr($class_names) . '"' : '';
        
        $id = apply_filters('nav_menu_item_id', 'menu-item-'. $item->ID, $item, $args, $depth);
        $id = $id ? ' id="' . esc_attr($id) . '"' : '';
        
        $output .= $indent . '<li' . $id . $class_names .'>';
        
        $atts = array();
        $atts['title']  = !empty($item->attr_title) ? $item->attr_title : '';
        $atts['target'] = !empty($item->target) ? $item->target : '';
        $atts['rel']    = !empty($item->xfn) ? $item->xfn : '';
        $atts['href']   = !empty($item->url) ? $item->url : '';
        
        $atts = apply_filters('nav_menu_link_attributes', $atts, $item, $args, $depth);
        
        $attributes = '';
        foreach ($atts as $attr => $value) {
            if (!empty($value)) {
                $value = ('href' === $attr) ? esc_url($value) : esc_attr($value);
                $attributes .= ' ' . $attr . '="' . $value . '"';
            }
        }
        
        $item_output = $args->before;
        $item_output .= '<a'. $attributes .'>';
        $item_output .= $args->link_before . apply_filters('the_title', $item->title, $item->ID) . $args->link_after;
        $item_output .= '</a>';
        $item_output .= $args->after;
        
        $output .= apply_filters('walker_nav_menu_start_el', $item_output, $item, $depth, $args);
    }
}

/**
 * 加载主题样式和脚本
 */
function oblivion_scripts() {
    // 加载样式

        // 加载主样式表
        wp_enqueue_style('oblivion-style', get_stylesheet_uri(), array(), wp_get_theme()->get('Version'));

        // 引入页脚样式表
        wp_enqueue_style('oblivion-footer', get_template_directory_uri() . '/assets/css/footer.css');

        // 引入头部样式表
        wp_enqueue_style('oblivion-header', get_template_directory_uri() . '/assets/css/header.css');

        // 引入侧边栏按钮样式表
        wp_enqueue_style('oblivion-side-button', get_template_directory_uri() . '/assets/css/side-button.css');

        // 引入毛玻璃效果样式表
        wp_enqueue_style('oblivion-glass', get_template_directory_uri() . '/assets/css/glass.css');

        // 引入菜单样式表
        wp_enqueue_style('oblivion-menu', get_template_directory_uri() . '/assets/css/menu.css');

        // 引入按钮样式表
        wp_enqueue_style('oblivion-button', get_template_directory_uri() . '/assets/css/button.css');

        // 引入搜索样式表
        wp_enqueue_style('oblivion-search', get_template_directory_uri() . '/assets/css/search.css');

        // 引入评论样式表
        wp_enqueue_style('oblivion-comments', get_template_directory_uri() . '/assets/css/comments.css');

        // 引入首页样式表
        wp_enqueue_style('oblivion-home', get_template_directory_uri() . '/assets/css/home.css');

        // 引入回到顶部和底部按钮样式表
        wp_enqueue_style('oblivion-scroll-buttons', get_template_directory_uri() . '/assets/css/scroll-buttons.css');
        
        
        
        


    // 加载图标

        // 加载 Font Awesome 图标库
        wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css', array(), '5.15.4');
    

    // 加载JavaScript

        // 加载主题 JavaScript
        wp_enqueue_script('oblivion-main', get_template_directory_uri() . '/assets/js/main.js', array('jquery'), wp_get_theme()->get('Version'), true);
        
        // 加载密码切换功能的JavaScript
        wp_enqueue_script('oblivion-password-toggle', get_template_directory_uri() . '/assets/js/password-toggle.js', array(), wp_get_theme()->get('Version'), true);
        
        // 加载爱心动画JavaScript
        wp_enqueue_script('oblivion-heart-animation', get_template_directory_uri() . '/assets/js/heart-animation.js', array(), wp_get_theme()->get('Version'), true);
        
        // 加载夜间模式JavaScript
        wp_enqueue_script('oblivion-dark-mode', get_template_directory_uri() . '/assets/js/dark-mode.js', array(), wp_get_theme()->get('Version'), true);
        
        // 加载侧边栏按钮JavaScript
        wp_enqueue_script('oblivion-side-button', get_template_directory_uri() . '/assets/js/side-button.js', array(), wp_get_theme()->get('Version'), true);
        
        // 添加ajaxurl变量到前端脚本
        wp_localize_script('oblivion-main', 'oblivion_vars', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('oblivion_quote_nonce')
        ));
    }
add_action('wp_enqueue_scripts', 'oblivion_scripts');

/**
 * 用户在线状态
 */
function oblivion_user_online_status() {
    if (is_user_logged_in()) {
        $user_id = get_current_user_id();
        update_user_meta($user_id, 'last_active', current_time('mysql'));
    }
}
add_action('init', 'oblivion_user_online_status');

function oblivion_is_user_online($user_id) {
    $last_active = get_user_meta($user_id, 'last_active', true);
    if (!$last_active) return false;
    
    $last_active_time = strtotime($last_active);
    $current_time = current_time('timestamp');
    
    return ($current_time - $last_active_time) < 900; // 15分钟 = 900秒
}


/**
 * Gravatar 设置
 */
function oblivion_gravatar_url($url) {
    // 使用 Gravatar 的中国镜像服务器
    return str_replace(array(
        'www.gravatar.com',
        '0.gravatar.com',
        '1.gravatar.com',
        '2.gravatar.com',
        'secure.gravatar.com'
    ), 'cravatar.cn', $url);
}
add_filter('get_avatar_url', 'oblivion_gravatar_url', 10, 1);

/**
 * 自定义 Gravatar 默认头像
 */
function oblivion_default_avatar($avatar_defaults) {
    $custom_avatar = get_template_directory_uri() . '/assets/images/default-avatar.png';
    $avatar_defaults[$custom_avatar] = __('Oblivion 默认头像', 'oblivion');
    return $avatar_defaults;
}
add_filter('avatar_defaults', 'oblivion_default_avatar');

/**
 * 移除 WordPress 管理工具栏
 */
add_filter('show_admin_bar', '__return_false');

/**
 * 自定义摘要长度
 */
function oblivion_excerpt_length($length) {
    return 120;
}
add_filter('excerpt_length', 'oblivion_excerpt_length');

/**
 * 自定义摘要末尾
 */
function oblivion_excerpt_more($more) {
    return '...';
}
add_filter('excerpt_more', 'oblivion_excerpt_more');

/**
 * 禁用 WordPress 自动更新
 */
add_filter('automatic_updater_disabled', '__return_true');

/**
 * 自定义登录页面样式
 */
function oblivion_login_stylesheet() {
    wp_enqueue_style('custom-login', get_template_directory_uri() . '/assets/css/login.css');
}
add_action('login_enqueue_scripts', 'oblivion_login_stylesheet');

/**
 * 自定义登录页面链接
 */
function oblivion_login_headerurl() {
    return home_url();
}
add_filter('login_headerurl', 'oblivion_login_headerurl');

/**
 * 自定义登录页面标题
 */
function oblivion_login_headertext() {
    return get_bloginfo('name');
}
add_filter('login_headertext', 'oblivion_login_headertext');

/**
 * 自定义登录页面欢迎消息
 */
function oblivion_login_message($message) {
    if (empty($message)) {
        return '<p class="custom-welcome-message">欢迎访问 <strong>' . get_bloginfo('name') . '</strong>，请登录以继续。</p>';
    }
    return $message;
}
add_filter('login_message', 'oblivion_login_message');

/**
 * 账户下拉菜单
 */
function get_account_dropdown() {
    if (!is_user_logged_in()) {
        return sprintf(
            '<div class="account-dropdown">
                <a href="%s" class="login-btn glass">%s</a>
                <a href="%s" class="register-btn glass">%s</a>
            </div>',
            esc_url(wp_login_url()),
            esc_html__('登录', 'oblivion'),
            esc_url(wp_registration_url()),
            esc_html__('注册', 'oblivion')
        );
    }
    
    $current_user = wp_get_current_user();
    $is_online = oblivion_is_user_online($current_user->ID);
    $online_status = $is_online ? '<span class="online-status"></span>' : '';
    $avatar = get_avatar($current_user->ID, 32);
    $avatar_large = get_avatar($current_user->ID, 60);
    
    // 获取用户角色
    $user_roles = $current_user->roles;
    $role_name = '会员';
    
    if (in_array('administrator', $user_roles)) {
        $role_name = '管理员';
    } elseif (in_array('editor', $user_roles)) {
        $role_name = '编辑';
    } elseif (in_array('author', $user_roles)) {
        $role_name = '作者';
    } elseif (in_array('contributor', $user_roles)) {
        $role_name = '贡献者';
    }
    
    // 检查用户角色，如果是管理员，显示后台链接
    $is_admin = current_user_can('manage_options');
    
    return sprintf(
        '<div class="account-dropdown">
            <div class="user-avatar-wrapper">
                <div class="avatar-container">
                    %s
                    %s
                </div>
                <div class="user-menu">
                    <div class="user-info">
                        <div class="avatar-large">%s</div>
                        <div class="user-name">%s</div>
                        <div class="user-role">%s</div>
                    </div>
                    <div class="menu-items">
                        <a href="%s" class="menu-item"><i class="fas fa-user"></i> %s</a>
                        <a href="%s" class="menu-item"><i class="fas fa-edit"></i> %s</a>
                        %s
                        <a href="%s" class="menu-item"><i class="fas fa-heart"></i> %s</a>
                        <a href="%s" class="menu-item"><i class="fas fa-comment"></i> %s</a>
                        <div class="divider"></div>
                        <a href="%s" class="menu-item logout-item"><i class="fas fa-sign-out-alt"></i> %s</a>
                    </div>
                </div>
            </div>
        </div>',
        $avatar,
        $online_status,
        $avatar_large,
        esc_html($current_user->display_name),
        esc_html($role_name),
        esc_url(get_author_posts_url($current_user->ID)),
        esc_html__('我的主页', 'oblivion'),
        esc_url(get_edit_profile_url()),
        esc_html__('编辑资料', 'oblivion'),
        $is_admin ? sprintf('<a href="%s" class="menu-item"><i class="fas fa-cog"></i> %s</a>', esc_url(admin_url()), esc_html__('管理后台', 'oblivion')) : '',
        esc_url(home_url('/favorites')),
        esc_html__('我的收藏', 'oblivion'),
        esc_url(home_url('/comments')),
        esc_html__('我的评论', 'oblivion'),
        esc_url(wp_logout_url(home_url())),
        esc_html__('退出登录', 'oblivion')
    );
}

/**
 * 自定义受保护文章密码表单
 */
function oblivion_password_form() {
    global $post;
    $label = 'pwbox-' . ( empty( $post->ID ) ? rand() : $post->ID );
    
    $output = '<form action="' . esc_url( site_url( 'wp-login.php?action=postpass', 'login_post' ) ) . '" class="post-password-form" method="post">
        <p>' . __( '此内容受密码保护。如需查阅，请在下方输入您的密码。', 'oblivion' ) . '</p>
        <p><label for="' . $label . '"><span>' . __( '密码', 'oblivion' ) . '</span>
        <div class="password-input-wrapper" style="position: relative; width: 100%; max-width: 300px; margin: 0 auto;">
            <input name="post_password" id="' . $label . '" type="password" spellcheck="false" placeholder="' . __( '请输入密码', 'oblivion' ) . '" style="width: 100%; height: 46px; line-height: 46px; padding: 0 40px 0 15px; box-sizing: border-box; text-align: left;" />
            <button type="button" style="position: absolute; right: 5px; top: 0; bottom: 0; margin: auto; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.1); border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.2); padding: 0; outline: none; cursor: pointer; z-index: 10;" onclick="
                var input = document.getElementById(\'' . $label . '\');
                var icon = this.querySelector(\'i\');
                if (input.type === \'password\') {
                    input.type = \'text\';
                    icon.className = \'fas fa-eye-slash\';
                } else {
                    input.type = \'password\';
                    icon.className = \'fas fa-eye\';
                }
                return false;
            ">
                <i class="fas fa-eye" style="color: var(--main-color);"></i>
            </button>
        </div>
        </label></p>
        <p><input type="submit" name="Submit" value="' . __( '确认', 'oblivion' ) . '" /></p>
    </form>';
    
    return $output;
}
add_filter( 'the_password_form', 'oblivion_password_form' );

/**
 * 为主题选项添加引用管理功能
 */
function oblivion_quotes_options_init() {
    register_setting(
        'oblivion_quotes_options',
        'oblivion_quotes_list',
        array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_textarea_field',
            'default' => '生活不是等待风暴过去，而是学会在雨中跳舞。
勇气不是没有恐惧，而是战胜恐惧。
成功不是偶然的，而是重复努力的结果。
最困难的时刻，也是离成功最近的时候。
人生就像骑自行车，要保持平衡就得不断前进。'
        )
    );
    
    add_submenu_page(
        'options-general.php',
        '自定义引用管理',
        '引用管理',
        'manage_options',
        'oblivion-quotes',
        'oblivion_quotes_options_page'
    );
}
add_action('admin_init', 'oblivion_quotes_options_init');
add_action('admin_menu', function() { 
    add_submenu_page(
        'options-general.php',
        '自定义引用管理',
        '引用管理',
        'manage_options',
        'oblivion-quotes',
        'oblivion_quotes_options_page'
    );
});

/**
 * 引用管理选项页面
 */
function oblivion_quotes_options_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form action="options.php" method="post">
            <?php
            settings_fields('oblivion_quotes_options');
            ?>
            <p>在下面的文本框中添加引用，每行一个引用。这些引用将在网站首页随机显示。</p>
            <p>
                <textarea name="oblivion_quotes_list" rows="10" cols="50" class="large-text"><?php echo esc_textarea(get_option('oblivion_quotes_list')); ?></textarea>
            </p>
            <?php submit_button('保存引用'); ?>
        </form>
    </div>
    <?php
}

/**
 * 获取随机引用
 * 
 * @return string 随机引用文本
 */
function get_random_quote() {
    // 创建缓存的唯一键名
    $cache_key = 'oblivion_random_quote';
    
    // 尝试从缓存中获取引用
    $cached_quote = get_transient($cache_key);
    
    // 如果缓存中有引用，直接返回
    if ($cached_quote !== false) {
        return $cached_quote;
    }
    
    // 备用引用，当API请求失败时使用
    $fallback_quotes = array(
        '生活不是等待风暴过去，而是学会在雨中跳舞。',
        '勇气不是没有恐惧，而是战胜恐惧。',
        '成功不是偶然的，而是重复努力的结果。',
        '最困难的时刻，也是离成功最近的时候。',
        '人生就像骑自行车，要保持平衡就得不断前进。'
    );
    
    // 尝试从API获取引用
    $response = wp_remote_get('https://v1.hitokoto.cn/?c=a&c=b&c=c&c=d&c=h&c=i&c=j&c=k&encode=text');
    
    // 如果请求成功
    if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
        $quote = wp_remote_retrieve_body($response);
        
        // 确保引用不为空
        if (!empty($quote)) {
            // 缓存引用2小时
            set_transient($cache_key, $quote, 2 * HOUR_IN_SECONDS);
            return $quote;
        }
    }
    
    // 如果API请求失败，使用备用引用
    $random_fallback = $fallback_quotes[array_rand($fallback_quotes)];
    
    // 缓存备用引用30分钟
    set_transient($cache_key, $random_fallback, 30 * MINUTE_IN_SECONDS);
    
    return $random_fallback;
}

/**
 * Ajax处理刷新引用
 */
function oblivion_refresh_quote_ajax() {
    // 安全检查
    check_ajax_referer('oblivion_quote_nonce', 'nonce', false);
    
    // 清除缓存
    delete_transient('oblivion_random_quote');
    
    try {
        // 获取新引用
        $new_quote = get_random_quote();
        
        // 返回结果
        wp_send_json_success(array(
            'quote' => $new_quote
        ));
    } catch (Exception $e) {
        // 处理错误
        wp_send_json_error(array(
            'message' => '获取引用失败: ' . $e->getMessage()
        ));
    }
    
    wp_die();
}
add_action('wp_ajax_refresh_quote', 'oblivion_refresh_quote_ajax'); // 登录用户
add_action('wp_ajax_nopriv_refresh_quote', 'oblivion_refresh_quote_ajax'); // 非登录用户


