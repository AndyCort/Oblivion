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
 * 获取当前登录用户的用户名
 */
function get_current_user_name() {
    $current_user = wp_get_current_user();
    if ( is_user_logged_in() ) {
        return $current_user->user_login;
    } else {
        return '访客';
    }
}

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
    // 检查是否是登录页面
    $is_login_page = get_query_var('oblivion_login') == 1;
    
    // 加载样式
    
    // 加载主样式表
    wp_enqueue_style('oblivion-style', get_stylesheet_uri(), array(), wp_get_theme()->get('Version'));
        
        // 引入头部样式表
        wp_enqueue_style('oblivion-header', get_template_directory_uri() . '/assets/css/header.css');
        // 引入页脚样式表
        wp_enqueue_style('oblivion-footer', get_template_directory_uri() . '/assets/css/footer.css');
        // 引入搜索样式表
        wp_enqueue_style('oblivion-search', get_template_directory_uri() . '/assets/css/search.css');
        
        
        // 引入侧边栏按钮样式表
        wp_enqueue_style('oblivion-side-button', get_template_directory_uri() . '/assets/css/side-button.css');
        // 引入回到顶部和底部按钮样式表
        wp_enqueue_style('oblivion-scroll-buttons', get_template_directory_uri() . '/assets/css/scroll-buttons.css');
            
        // 引入毛玻璃效果样式表
        wp_enqueue_style('oblivion-glass', get_template_directory_uri() . '/assets/css/glass.css');
        // 引入按钮样式表
        wp_enqueue_style('oblivion-button', get_template_directory_uri() . '/assets/css/button.css');
        
        // 引入动画样式表
        wp_enqueue_style('oblivion-animation', get_template_directory_uri() . '/assets/css/animation.css');

        // 引入菜单样式表
        wp_enqueue_style('oblivion-menu', get_template_directory_uri() . '/assets/css/menu.css');
        








        // 引入首页样式表
        if (is_home() || is_front_page()) {
            wp_enqueue_style('oblivion-home', get_template_directory_uri() . '/assets/css/home.css');
            wp_enqueue_style('oblivion-main', get_template_directory_uri() . '/assets/css/main.css', array(), time());
        }
        // 引入登录和注册页面样式表
        if ($is_login_page) {
            wp_enqueue_style('oblivion-login', get_template_directory_uri() . '/assets/css/login.css', array(), time());
        }
        // 引入单篇文章样式表
        if (is_single()) {
            wp_enqueue_style('oblivion-single', get_template_directory_uri() . '/assets/css/single.css', array(), time());
            wp_enqueue_style('oblivion-comments', get_template_directory_uri() . '/assets/css/comments.css');
        
        }
    // 加载 Font Awesome 图标库
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css', array(), '5.15.4');
    
    // 加载JavaScript      
        // 加载主题 JavaScript
        wp_enqueue_script('oblivion-main', get_template_directory_uri() . '/assets/js/main.js', array('jquery'), wp_get_theme()->get('Version'), true);
        
        // 加载爱心动画JavaScript
        wp_enqueue_script('oblivion-heart-animation', get_template_directory_uri() . '/assets/js/heart-animation.js', array(), wp_get_theme()->get('Version'), true);
        
        // 加载夜间模式JavaScript
        wp_enqueue_script('oblivion-dark-mode', get_template_directory_uri() . '/assets/js/dark-mode.js', array(), wp_get_theme()->get('Version'), true);
        
        // 加载侧边栏按钮JavaScript
        wp_enqueue_script('oblivion-side-button', get_template_directory_uri() . '/assets/js/side-button.js', array(), wp_get_theme()->get('Version'), true);

        // 加载底部导航栏JavaScript
        wp_enqueue_script('oblivion-bottom-nav', get_template_directory_uri() . '/assets/js/bottom-nav.js', array(), wp_get_theme()->get('Version'), true);
     
    
    // 在所有页面加载密码切换功能的JavaScript
    wp_enqueue_script('oblivion-password-toggle', get_template_directory_uri() . '/assets/js/password-toggle.js', array(), wp_get_theme()->get('Version'), true);
    
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
    // 只加载登录页面所需的CSS
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css', array(), '5.15.4');
    wp_enqueue_style('oblivion-login', get_template_directory_uri() . '/assets/css/login.css', array(), time());
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
        '人生就像骑自行车，要保持平衡就得不断前进。',
        '宁静致远，淡泊明志。',
        '上善若水，水善利万物而不争。',
        '读万卷书，行万里路。',
        '千里之行，始于足下。',
        '不积跬步，无以至千里。'
    );
    
    // 尝试从多个API获取引用
    $api_endpoints = array(
        'http://v3.wufazhuce.com:8000/api/channel/one/0/0',
        'http://open.iciba.com/dsapi/',
        'https://apiv3.shanbay.com/weapps/dailyquote/quote',
        'https://v1.hitokoto.cn/',
        'https://v2.jinrishici.com/one.json',
        'http://quotes.stormconsultancy.co.uk/random.json',
        'https://api.quotable.io/random',
        'https://api.apiopen.top/api/sentences'
    );
    
    // 随机选择一个API端点
    $api_url = $api_endpoints[array_rand($api_endpoints)];
    
    // 发送请求获取引用
    $response = wp_remote_get($api_url);
    
    // 如果请求成功
    if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
        $body = wp_remote_retrieve_body($response);
        
        // 根据不同API解析返回的数据
        if (strpos($api_url, 'hitokoto.cn') !== false) {
            // 一言API返回JSON
            $data = json_decode($body, true);
            if ($data && isset($data['hitokoto'])) {
                $quote = $data['hitokoto'];
                // 添加来源
                if (isset($data['from']) && !empty($data['from'])) {
                    $quote .= ' —— 《' . $data['from'] . '》';
                }
            }
        } elseif (strpos($api_url, 'quotable.io') !== false) {
            // Quotable API返回JSON
            $data = json_decode($body, true);
            if ($data && isset($data['content'])) {
                $quote = $data['content'];
                if (isset($data['author']) && !empty($data['author'])) {
                    $quote .= ' —— ' . $data['author'];
                }
            }
        } elseif (strpos($api_url, 'apiopen.top') !== false) {
            // apiopen返回JSON
            $data = json_decode($body, true);
            if ($data && isset($data['result']['name'])) {
                $quote = $data['result']['name'];
            }
        } elseif (strpos($api_url, 'wufazhuce.com') !== false) {
            // ONE一个API返回JSON
            $data = json_decode($body, true);
            if ($data && isset($data['data']['content']['forward'])) {
                $quote = $data['data']['content']['forward'];
                if (isset($data['data']['content']['words_info']) && !empty($data['data']['content']['words_info'])) {
                    $quote .= ' —— ' . $data['data']['content']['words_info'];
                }
            }
        } elseif (strpos($api_url, 'iciba.com') !== false) {
            // 金山词霸每日一句
            $data = json_decode($body, true);
            if ($data && isset($data['content'])) {
                $quote = $data['content'];
                if (isset($data['note']) && !empty($data['note'])) {
                    $quote .= ' (' . $data['note'] . ')';
                }
            }
        } elseif (strpos($api_url, 'shanbay.com') !== false) {
            // 扇贝单词API
            $data = json_decode($body, true);
            if ($data && isset($data['content'])) {
                $quote = $data['content'];
                if (isset($data['author']) && !empty($data['author'])) {
                    $quote .= ' —— ' . $data['author'];
                }
            }
        } elseif (strpos($api_url, 'jinrishici.com') !== false) {
            // 今日诗词API
            $data = json_decode($body, true);
            if ($data && isset($data['data']['content'])) {
                $quote = $data['data']['content'];
                if (isset($data['data']['origin']['author']) && !empty($data['data']['origin']['author'])) {
                    $quote .= ' —— ' . $data['data']['origin']['author'];
                    if (isset($data['data']['origin']['title']) && !empty($data['data']['origin']['title'])) {
                        $quote .= '《' . $data['data']['origin']['title'] . '》';
                    }
                }
            }
        } elseif (strpos($api_url, 'stormconsultancy.co.uk') !== false) {
            // Storm Consultancy API
            $data = json_decode($body, true);
            if ($data && isset($data['quote'])) {
                $quote = $data['quote'];
                if (isset($data['author']) && !empty($data['author'])) {
                    $quote .= ' —— ' . $data['author'];
                }
            }
        }
        
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

/**
 * 强制重定向到自定义登录页面
 */
function oblivion_redirect_to_custom_login() {
    // 当前页面是否是登录页面
    $is_login_page = strpos($_SERVER['REQUEST_URI'], 'wp-login.php') !== false;
    
    // 如果不是登录页面，或者是AJAX请求，直接返回
    if (!$is_login_page || wp_doing_ajax() || defined('DOING_AJAX') || defined('DOING_CRON')) {
        return;
    }
    
    // 允许的操作列表
    $allowed_actions = array(
        'logout',       // 登出
        'postpass',     // 密码保护的文章
        'rp',           // 重置密码
        'resetpass',    // 重置密码
        'lostpassword', // 忘记密码
        'retrievepassword', // 找回密码
        'login',        // 标准登录处理
        'confirm_admin_email', // 确认管理员邮箱
        'confirm_key', // 确认密钥
        'cookie_check', // Cookie检查
        'jetpack-sso', // Jetpack SSO如果安装了
        'reauth', // 重新验证
        'recovery_mode' // 恢复模式
    );
    
    // 检查是否有允许的操作
    $action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';
    
    // 如果是允许的操作，或者是已经通过验证的用户，或者是XML-RPC请求
    if (in_array($action, $allowed_actions) || is_user_logged_in() || defined('XMLRPC_REQUEST')) {
        return;
    }
    
    // 检查是否是POST请求（可能是登录提交）
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        return;
    }
    
    // 检查是否有可能导致重定向循环的迹象
    if (isset($_REQUEST['interim-login']) || isset($_REQUEST['redirect_to']) && strpos($_REQUEST['redirect_to'], 'wp-admin') !== false) {
        return;
    }
    
    // 获取重定向URL（如果有）
    $redirect_to = isset($_REQUEST['redirect_to']) ? '?redirect_to=' . urlencode($_REQUEST['redirect_to']) : '';
    
    // 重定向到自定义登录页面
    wp_redirect(home_url('/login/' . $redirect_to));
    exit;
}
add_action('init', 'oblivion_redirect_to_custom_login', 1); // 提高优先级

/**
 * 添加可重写规则以支持自定义登录页面
 */
function oblivion_login_rewrite_rule() {
    add_rewrite_rule('^login/?$', 'index.php?oblivion_login=1', 'top');
}
add_action('init', 'oblivion_login_rewrite_rule');

/**
 * 注册自定义查询变量
 */
function oblivion_login_query_vars($vars) {
    $vars[] = 'oblivion_login';
    return $vars;
}
add_filter('query_vars', 'oblivion_login_query_vars');

/**
 * 加载自定义登录模板
 */
function oblivion_login_template($template) {
    if (get_query_var('oblivion_login') == 1) {
        $new_template = locate_template(array('login.php'));
        if (!empty($new_template)) {
            return $new_template;
        }
    }
    return $template;
}
add_filter('template_include', 'oblivion_login_template');

/**
 * 在主题激活时刷新重写规则
 */
function oblivion_flush_rewrite_rules() {
    oblivion_login_rewrite_rule();
    flush_rewrite_rules();
}
add_action('after_switch_theme', 'oblivion_flush_rewrite_rules');

/**
 * 手动刷新重写规则（仅管理员可用）
 */
function oblivion_manual_flush_rewrite_rules() {
    if (current_user_can('manage_options') && isset($_GET['oblivion_flush_rules']) && $_GET['oblivion_flush_rules'] == 1) {
        flush_rewrite_rules();
        wp_redirect(remove_query_arg('oblivion_flush_rules'));
        exit;
    }
}
add_action('init', 'oblivion_manual_flush_rewrite_rules', 999);

/**
 * 自动创建登录页面（如果不存在）
 */
function oblivion_create_login_page() {
    // 检查是否已经存在slug为'login'的页面
    $login_page = get_page_by_path('login');
    
    // 如果不存在，则创建
    if (!$login_page) {
        // 创建页面数据
        $page_data = array(
            'post_title'    => '登录',
            'post_name'     => 'login',
            'post_status'   => 'publish',
            'post_type'     => 'page',
            'post_content'  => '',
            'post_author'   => 1,  // 默认为管理员
            'page_template' => 'login.php'
        );
        
        // 插入页面并获取ID
        $page_id = wp_insert_post($page_data);
        
        if ($page_id && !is_wp_error($page_id)) {
            // 设置页面模板
            update_post_meta($page_id, '_wp_page_template', 'login.php');
            
            // 刷新重写规则
            flush_rewrite_rules();
        }
    }
}

// 在网站前台访问时执行（仅执行一次）
function oblivion_check_login_page() {
    $created = get_option('oblivion_login_page_created');
    if (!$created) {
        oblivion_create_login_page();
        update_option('oblivion_login_page_created', true);
    }
}
add_action('wp', 'oblivion_check_login_page');

/**
 * 添加主题设置页面
 */
function oblivion_add_theme_page() {
    add_theme_page(
        '主题设置', // 页面标题
        '主题设置', // 菜单标题
        'manage_options', // 权限
        'oblivion-settings', // 菜单标识
        'oblivion_theme_settings_page' // 回调函数
    );
}
add_action('admin_menu', 'oblivion_add_theme_page');

/**
 * 初始化主题设置
 */
function oblivion_initialize_settings() {
    // 注册设置
    register_setting(
        'oblivion_settings', // 选项组
        'oblivion_social_options', // 选项名称
        array('sanitize_callback' => 'oblivion_sanitize_social_options') // 选项清理回调
    );

    // 删除旧的选项
    delete_option('oblivion_custom_social_options');
    delete_option('oblivion_hidden_social_icons');

    // 添加设置区域
    add_settings_section(
        'oblivion_social_section', // ID
        '社交媒体设置', // 标题
        'oblivion_social_section_callback', // 回调函数
        'oblivion-settings' // 页面
    );

    // 添加设置字段
    add_settings_field(
        'oblivion_social_icons', // ID
        '社交媒体图标', // 标题
        'oblivion_social_icons_callback', // 回调函数
        'oblivion-settings', // 页面
        'oblivion_social_section' // 区域
    );
}
add_action('admin_init', 'oblivion_initialize_settings');

/**
 * 社交媒体分节回调函数
 */
function oblivion_social_section_callback() {
    echo '<p>设置主题主页显示的社交媒体链接。点击"添加社交媒体"按钮添加新的图标。</p>';
}

/**
 * 社交媒体图标列表回调函数
 */
function oblivion_social_icons_callback() {
    $social_options = get_option('oblivion_social_options', array());
    
    // 预定义的社交媒体图标列表（用于下拉选择）
    $common_icons = array(
        'fab fa-weibo' => '微博',
        'fab fa-weixin' => '微信',
        'fab fa-qq' => 'QQ',
        'fab fa-github' => 'GitHub',
        'fab fa-zhihu' => '知乎',
        'fab fa-telegram-plane' => 'Telegram',
        'fab fa-facebook' => 'Facebook',
        'fab fa-twitter' => 'Twitter',
        'fab fa-instagram' => 'Instagram',
        'fab fa-pinterest' => 'Pinterest',
        'fab fa-linkedin' => 'LinkedIn',
        'fab fa-youtube' => 'YouTube',
        'fab fa-twitch' => 'Twitch',
        'fab fa-discord' => 'Discord',
        'fab fa-reddit' => 'Reddit',
        'fab fa-tiktok' => 'TikTok',
        'fab fa-flickr' => 'Flickr',
        'fab fa-snapchat' => 'Snapchat',
        'fab fa-whatsapp' => 'WhatsApp',
        'fab fa-line' => 'Line',
        'fab fa-facebook-messenger' => 'Messenger',
        'fab fa-bilibili' => 'Bilibili',
        'fab fa-steam' => 'Steam',
        'fab fa-spotify' => 'Spotify'
    );
    
    // 容器开始
    echo '<div id="social-icons-container" class="sortable-container">';
    echo '<p class="description">拖动图标可以调整顺序。</p>';
    
    // 现有的社交媒体项
    if (!empty($social_options) && is_array($social_options)) {
        foreach ($social_options as $index => $item) {
            // 确保$item是数组
            if (!is_array($item)) {
                continue;
            }
            
            echo '<div class="social-item">';
            echo '<p>';
            
            // 拖动手柄
            echo '<span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>';
            
            // 图标选择下拉框
            echo '<select name="oblivion_social_options[' . $index . '][icon]" style="width: 20%; margin-right: 10px;" class="icon-select">';
            echo '<option value="">-- 选择图标 --</option>';
            
            foreach ($common_icons as $icon_class => $icon_name) {
                $selected = (isset($item['icon']) && $item['icon'] === $icon_class) ? 'selected' : '';
                echo '<option value="' . esc_attr($icon_class) . '" ' . $selected . '>' . esc_html($icon_name) . '</option>';
            }
            
            // 自定义选项
            $custom_selected = isset($item['icon']) && !empty($item['icon']) && !array_key_exists($item['icon'], $common_icons) ? 'selected' : '';
            echo '<option value="custom" ' . $custom_selected . '>自定义...</option>';
            echo '</select>';
            
            // 自定义图标输入框（如果选择了自定义）
            $custom_display = $custom_selected ? 'inline-block' : 'none';
            echo '<input type="text" name="oblivion_social_options[' . $index . '][custom_icon]" value="' . ($custom_selected && isset($item['icon']) ? esc_attr($item['icon']) : '') . '" placeholder="自定义图标类名" style="width: 20%; margin-right: 10px; display: ' . $custom_display . ';" class="custom-icon-input" />';
            
            // 名称输入框
            $title_value = isset($item['title']) ? esc_attr($item['title']) : '';
            echo '<input type="text" name="oblivion_social_options[' . $index . '][title]" value="' . $title_value . '" placeholder="标题 (如: Instagram)" style="width: 20%; margin-right: 10px;" />';
            
            // 链接输入框
            $url_value = isset($item['url']) ? esc_attr($item['url']) : 'https://#';
            echo '<input type="text" name="oblivion_social_options[' . $index . '][url]" value="' . $url_value . '" placeholder="URL (https://...)" style="width: 25%; margin-right: 10px;" />';
            
            // 删除按钮
            echo '<button type="button" class="button remove-social">删除</button>';
            
            echo '</p>';
            echo '</div>';
        }
    }
    
    // 如果没有社交媒体项，添加默认的预设图标
    if (empty($social_options)) {
        $default_icons = array(
            array('icon' => 'fab fa-weibo', 'title' => '微博', 'url' => 'https://#'),
            array('icon' => 'fab fa-weixin', 'title' => '微信', 'url' => 'https://#'),
            array('icon' => 'fab fa-qq', 'title' => 'QQ', 'url' => 'https://#'),
            array('icon' => 'fab fa-github', 'title' => 'GitHub', 'url' => 'https://#'),
            array('icon' => 'fab fa-zhihu', 'title' => '知乎', 'url' => 'https://#'),
            array('icon' => 'fab fa-telegram-plane', 'title' => 'Telegram', 'url' => 'https://#')
        );
        
        foreach ($default_icons as $index => $item) {
            echo '<div class="social-item">';
            echo '<p>';
            
            // 拖动手柄
            echo '<span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>';
            
            // 图标选择下拉框
            echo '<select name="oblivion_social_options[' . $index . '][icon]" style="width: 20%; margin-right: 10px;" class="icon-select">';
            echo '<option value="">-- 选择图标 --</option>';
            
            foreach ($common_icons as $icon_class => $icon_name) {
                $selected = ($item['icon'] === $icon_class) ? 'selected' : '';
                echo '<option value="' . esc_attr($icon_class) . '" ' . $selected . '>' . esc_html($icon_name) . '</option>';
            }
            
            echo '<option value="custom">自定义...</option>';
            echo '</select>';
            
            // 自定义图标输入框
            echo '<input type="text" name="oblivion_social_options[' . $index . '][custom_icon]" value="" placeholder="自定义图标类名" style="width: 20%; margin-right: 10px; display: none;" class="custom-icon-input" />';
            
            // 名称输入框
            echo '<input type="text" name="oblivion_social_options[' . $index . '][title]" value="' . esc_attr($item['title']) . '" placeholder="标题 (如: Instagram)" style="width: 20%; margin-right: 10px;" />';
            
            // 链接输入框
            echo '<input type="text" name="oblivion_social_options[' . $index . '][url]" value="' . esc_attr($item['url']) . '" placeholder="URL (https://...)" style="width: 25%; margin-right: 10px;" />';
            
            // 删除按钮
            echo '<button type="button" class="button remove-social">删除</button>';
            
            echo '</p>';
            echo '</div>';
        }
    }
    
    // 容器结束
    echo '</div>';
    
    // 添加按钮
    echo '<p><button type="button" class="button button-secondary" id="add-social-btn">添加社交媒体</button></p>';
    
    // 帮助信息
    echo '<div class="social-icons-help" style="margin-top: 20px; padding: 15px; background: #f8f8f8; border-left: 4px solid #0073aa;">';
    echo '<h4 style="margin-top: 0;">常用社交媒体图标参考</h4>';
    echo '<p>您可以从下拉菜单中选择常用图标，或者选择"自定义"并输入自定义图标类名。</p>';
    echo '<ul style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 0;">';
    
    foreach ($common_icons as $icon_class => $icon_name) {
        echo '<li><i class="' . $icon_class . '" style="margin-right: 5px; color: #0073aa;"></i>' . $icon_name . '</li>';
    }
    
    echo '</ul>';
    echo '<p style="margin-bottom: 0;"><a href="https://fontawesome.com/search?o=r&m=free&f=brands" target="_blank">查看更多Font Awesome品牌图标 &raquo;</a></p>';
    echo '</div>';
    
    // 模板（隐藏）
    echo '<div id="social-item-template" style="display:none;">';
    echo '<div class="social-item">';
    echo '<p>';
    
    // 拖动手柄
    echo '<span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>';
    
    // 图标选择下拉框
    echo '<select name="oblivion_social_options[--index--][icon]" style="width: 20%; margin-right: 10px;" class="icon-select">';
    echo '<option value="">-- 选择图标 --</option>';
    
    foreach ($common_icons as $icon_class => $icon_name) {
        echo '<option value="' . esc_attr($icon_class) . '">' . esc_html($icon_name) . '</option>';
    }
    
    echo '<option value="custom">自定义...</option>';
    echo '</select>';
    
    // 自定义图标输入框
    echo '<input type="text" name="oblivion_social_options[--index--][custom_icon]" value="" placeholder="自定义图标类名" style="width: 20%; margin-right: 10px; display: none;" class="custom-icon-input" />';
    
    // 名称输入框
    echo '<input type="text" name="oblivion_social_options[--index--][title]" value="" placeholder="标题 (如: Instagram)" style="width: 20%; margin-right: 10px;" />';
    
    // 链接输入框
    echo '<input type="text" name="oblivion_social_options[--index--][url]" value="https://#" placeholder="URL (https://...)" style="width: 25%; margin-right: 10px;" />';
    
    // 删除按钮
    echo '<button type="button" class="button remove-social">删除</button>';
    
    echo '</p>';
    echo '</div>';
    echo '</div>';
    
    // 添加所需的JavaScript
    ?>
    <script type="text/javascript">
    jQuery(document).ready(function($) {
        // 初始化拖放排序
        $('#social-icons-container').sortable({
            handle: '.drag-handle',
            placeholder: 'ui-sortable-placeholder',
            update: function(event, ui) {
                // 重新排序后更新索引
                updateSocialIndices();
            }
        });
        
        // 更新所有社交媒体项的索引
        function updateSocialIndices() {
            $('.social-item').each(function(index) {
                $(this).find('input, select').each(function() {
                    var name = $(this).attr('name');
                    name = name.replace(/\[\d+\]/, '[' + index + ']');
                    $(this).attr('name', name);
                });
            });
        }
        
        // 添加新的社交媒体项
        $('#add-social-btn').on('click', function() {
            var template = $('#social-item-template').html();
            var newIndex = $('.social-item').length;
            template = template.replace(/--index--/g, newIndex);
            $('#social-icons-container').append(template);
            
            // 重新初始化拖放排序
            $('#social-icons-container').sortable('refresh');
        });
        
        // 删除社交媒体项
        $(document).on('click', '.remove-social', function() {
            $(this).closest('.social-item').remove();
            // 重新排序索引
            updateSocialIndices();
        });
        
        // 处理图标选择
        $(document).on('change', '.icon-select', function() {
            var customInput = $(this).siblings('.custom-icon-input');
            if ($(this).val() === 'custom') {
                customInput.show();
            } else {
                customInput.hide().val('');
            }
        });
    });
    </script>
    <?php
}

/**
 * 对社交媒体设置进行数据净化
 */
function oblivion_sanitize_social_options($input) {
    $output = array();
    
    if (is_array($input)) {
        foreach ($input as $item) {
            if (!is_array($item)) {
                continue;
            }
            
            // 处理图标
            $icon = '';
            if (isset($item['icon'])) {
                if ($item['icon'] === 'custom' && isset($item['custom_icon']) && !empty($item['custom_icon'])) {
                    // 使用自定义图标
                    $icon = sanitize_text_field($item['custom_icon']);
                } else if ($item['icon'] !== 'custom' && !empty($item['icon'])) {
                    // 使用预设图标
                    $icon = sanitize_text_field($item['icon']);
                }
            }
            
            // 只有当图标不为空时才添加到输出
            if (!empty($icon)) {
                $title = isset($item['title']) && !empty($item['title']) ? sanitize_text_field($item['title']) : '';
                $url = isset($item['url']) && !empty($item['url']) ? esc_url_raw($item['url']) : 'https://#';
                $output[] = array(
                    'icon' => $icon,
                    'title' => $title,
                    'url' => $url
                );
            }
        }
    }
    
    return $output;
}

/**
 * 主题设置页面HTML
 */
function oblivion_theme_settings_page() {
    // 处理重置请求
    if (isset($_POST['reset_social_options']) && current_user_can('manage_options')) {
        check_admin_referer('oblivion_reset_social_options');
        
        // 删除当前选项
        delete_option('oblivion_social_options');
        
        // 创建默认选项
        oblivion_theme_activation();
        
        // 添加成功消息
        add_settings_error(
            'oblivion_settings',
            'oblivion_social_reset',
            '社交媒体选项已重置为默认值。',
            'updated'
        );
    }
    
    // 显示设置错误/更新消息
    settings_errors('oblivion_settings');
    ?>
    <div class="wrap">
        <h1>Oblivion主题设置</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('oblivion_settings');
            do_settings_sections('oblivion-settings');
            submit_button();
            ?>
        </form>
        
        <div style="margin-top: 30px; padding: 15px; background: #f8f8f8; border-left: 4px solid #dc3232;">
            <h3>重置选项</h3>
            <p>点击下面的按钮将社交媒体选项重置为默认值。此操作不可撤销！</p>
            <form method="post" action="">
                <?php wp_nonce_field('oblivion_reset_social_options'); ?>
                <input type="hidden" name="reset_social_options" value="1" />
                <?php submit_button('重置社交媒体选项', 'secondary', 'reset-button', false, array('onclick' => 'return confirm("确定要重置社交媒体选项吗？此操作不可撤销！");')); ?>
            </form>
        </div>
    </div>
    <?php
}

/**
 * 获取社交媒体图标HTML
 * 
 * @param bool $echo 是否直接输出
 * @return string 返回社交媒体图标HTML
 */
function oblivion_get_social_icons($echo = true) {
    $social_options = get_option('oblivion_social_options', array());
    
    // 临时代码：在管理员界面显示选项的值
    if (is_admin() && current_user_can('manage_options')) {
        error_log('Social Options: ' . print_r($social_options, true));
    }
    
    if (empty($social_options)) {
        return '';
    }
    
    $output = '<div class="social-icons">';
    
    // 遍历社交媒体图标
    if (is_array($social_options)) {
        foreach ($social_options as $item) {
            if (is_array($item) && !empty($item['icon'])) {
                $title = isset($item['title']) && !empty($item['title']) ? $item['title'] : '';
                $url = isset($item['url']) && !empty($item['url']) ? $item['url'] : 'https://#';
                $output .= '<a href="' . esc_url($url) . '" title="' . esc_attr($title) . '" target="_blank" class="glass"><i class="' . esc_attr($item['icon']) . '"></i></a>';
            }
        }
    }
    
    $output .= '</div>';
    
    if ($echo) {
        echo $output;
    }
    
    return $output;
}

/**
 * 在管理面板加载Font Awesome
 */
function oblivion_admin_enqueue_scripts($hook) {
    // 只在主题设置页面加载
    if ('appearance_page_oblivion-settings' !== $hook) {
        return;
    }
    
    // 加载Font Awesome
    wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css', array(), '5.15.4');
    
    // 加载jQuery UI
    wp_enqueue_script('jquery-ui-sortable');
    
    // 添加一些自定义样式
    wp_add_inline_style('font-awesome', '
        .social-item {
            margin-bottom: 10px;
            background: #f9f9f9;
            padding: 10px;
            border-radius: 4px;
            border-left: 3px solid #0073aa;
            cursor: move;
        }
        .social-item:hover {
            background: #f5f5f5;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .social-item .drag-handle {
            cursor: move;
            display: inline-block;
            margin-right: 10px;
            color: #999;
        }
        .social-item .drag-handle:hover {
            color: #0073aa;
        }
        .social-icons-help i {
            color: #0073aa;
            width: 20px;
            text-align: center;
        }
        #social-icons-container {
            margin-bottom: 15px;
        }
        .ui-sortable-helper {
            background: #fff !important;
            box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23) !important;
            border-left: 3px solid #0073aa !important;
        }
        .ui-sortable-placeholder {
            visibility: visible !important;
            background: #e6f2f8 !important;
            border: 1px dashed #0073aa !important;
            height: 60px !important;
            margin-bottom: 10px !important;
        }
    ');
}
add_action('admin_enqueue_scripts', 'oblivion_admin_enqueue_scripts');

/**
 * 在主题激活时初始化默认社交媒体选项
 */
function oblivion_theme_activation() {
    // 检查是否已有社交媒体选项
    $existing_options = get_option('oblivion_social_options', false);
    
    // 如果没有设置，添加默认社交媒体选项
    if ($existing_options === false) {
        $default_socials = array(
            array(
                'icon' => 'fab fa-weibo',
                'title' => '微博',
                'url' => 'https://#'
            ),
            array(
                'icon' => 'fab fa-weixin',
                'title' => '微信',
                'url' => 'https://#'
            ),
            array(
                'icon' => 'fab fa-qq',
                'title' => 'QQ',
                'url' => 'https://#'
            ),
            array(
                'icon' => 'fab fa-github',
                'title' => 'GitHub',
                'url' => 'https://#'
            ),
            array(
                'icon' => 'fab fa-zhihu',
                'title' => '知乎',
                'url' => 'https://#'
            ),
            array(
                'icon' => 'fab fa-telegram-plane',
                'title' => 'Telegram',
                'url' => 'https://#'
            )
        );
        
        update_option('oblivion_social_options', $default_socials);
    }
}
add_action('after_switch_theme', 'oblivion_theme_activation');


// 从 GitHub 分支检测主题更新
function oblivion_github_branch_updates($transient) {
    if (empty($transient->checked)) {
        return $transient;
    }

    // 配置参数
    $theme_slug    = 'oblivion';      // 主题目录名（必须小写）
    $github_user   = 'AndyCort';      // GitHub 用户名
    $github_repo   = 'Oblivion';      // 仓库名
    $github_branch = 'main';        // 分支名（如 main/master）
    $github_token  = '';              // 可选：GitHub Token（私有仓库必填）

    // 获取本地版本号
    $local_version = wp_get_theme($theme_slug)->get('Version');

    // 调用 GitHub API 获取分支最新提交时间
    $api_url = "https://api.github.com/repos/{$github_user}/{$github_repo}/branches/{$github_branch}";
    $args = array('headers' => array('Accept' => 'application/vnd.github.v3+json'));
    if (!empty($github_token)) {
        $args['headers']['Authorization'] = "token {$github_token}";
    }

    $response = wp_remote_get($api_url, $args);
    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        return $transient;
    }

    $branch_data   = json_decode(wp_remote_retrieve_body($response));
    $latest_commit = $branch_data->commit->commit->committer->date; // 提交时间（如 2023-10-10T12:00:00Z）
    $latest_hash   = substr($branch_data->commit->sha, 0, 7);      // 截取前7位 Commit Hash

    // 生成动态远程版本号（格式：基础版本 + 提交时间戳）
    $remote_version = $local_version . '.' . strtotime($latest_commit);

    // 对比版本号（本地版本需小于远程版本）
    if (version_compare($local_version, $remote_version, '<')) {
        $transient->response[$theme_slug] = array(
            'theme'       => $theme_slug,
            'new_version' => $remote_version,
            'package'     => "https://github.com/{$github_user}/{$github_repo}/archive/refs/heads/{$github_branch}.zip",
            'url'         => "https://github.com/{$github_user}/{$github_repo}"
        );
    }

    return $transient;
}
add_filter('pre_set_site_transient_update_themes', 'oblivion_github_branch_updates');