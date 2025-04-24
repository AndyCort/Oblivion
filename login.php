<?php
/**
 * Template Name: Login
 * 
 * Oblivion主题 - 自定义登录页面
 *
 * @package Oblivion
 */

// 如果用户已登录，则重定向到首页或管理后台
if (is_user_logged_in()) {
    if (current_user_can('manage_options')) {
        wp_redirect(admin_url());
    } else {
        wp_redirect(home_url());
    }
    exit;
}

// 处理登录表单提交
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['log']) && isset($_POST['pwd'])) {
    $credentials = array(
        'user_login'    => $_POST['log'],
        'user_password' => $_POST['pwd'],
        'remember'      => isset($_POST['rememberme'])
    );
    
    $user = wp_signon($credentials, false);
    
    if (is_wp_error($user)) {
        $error = $user->get_error_message();
    } else {
        // 清除任何可能存在的重定向循环标记
        if (isset($_COOKIE['wp_login_redirect_count'])) {
            setcookie('wp_login_redirect_count', '', time() - 3600, COOKIEPATH, COOKIE_DOMAIN);
        }
        
        // 登录成功后重定向
        $redirect_to = !empty($_POST['redirect_to']) ? $_POST['redirect_to'] : '';
        
        if (empty($redirect_to)) {
            if (current_user_can('manage_options')) {
                $redirect_to = admin_url();
            } else {
                $redirect_to = home_url();
            }
        }
        
        wp_redirect($redirect_to);
        exit;
    }
}

// 获取重定向URL
$redirect_to = isset($_REQUEST['redirect_to']) ? $_REQUEST['redirect_to'] : '';

// 获取站点信息
$site_name = get_bloginfo('name');
$site_url = home_url();
?>
<!-- 登录页面 -->
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php bloginfo('description'); ?>">
    <title><?php echo esc_html($site_name); ?> - 登录</title>
    <script>
        // 如果支持 JavaScript，移除 no-js 类
        document.documentElement.className = document.documentElement.className.replace('no-js', 'js');
    </script>
    <!-- 添加内联样式来隐藏滚动按钮 -->
    <style>
        .scroll-to-top, 
        .scroll-to-bottom, 
        #back-to-top,
        #back-to-bottom,
        .scroll-buttons-container {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
    </style>
    <?php
    // 确保样式被正确加载 - 这里使用wp_head会加载函数文件中注册的样式
    wp_enqueue_style('oblivion-login', get_template_directory_uri() . '/assets/css/login.css', array(), time()); // 添加时间戳避免缓存
    wp_enqueue_style('oblivion-glass', get_template_directory_uri() . '/assets/css/glass.css', array(), time()); // 添加时间戳避免缓存
    wp_head();
    ?>
    <?php $options = get_option('oblivion_basic_options'); ?>
    <meta name="keywords" content="<?php echo esc_attr($options['keywords'] ?? ''); ?>">
    <meta name="description" content="<?php echo esc_attr($options['description'] ?? get_bloginfo('description')); ?>">
    <?php if(!empty($options['favicon'])): ?>
        <link rel="shortcut icon" href="<?php echo esc_url($options['favicon']); ?>" type="image/x-icon">
    <?php endif; ?>
</head>
<body class="login">
    <div id="login">
        <h1>
            <a href="<?php echo esc_url($site_url); ?>" title="<?php echo esc_attr($site_name); ?>" tabindex="-1" class="site-title">
                <?php echo esc_html($site_name); ?>
            </a>
        </h1>
        
        <div class="custom-welcome-message glass">
            欢迎访问 <strong><?php echo esc_html($site_name); ?></strong>，请登录以继续。
        </div>
        
        <?php if (!empty($error)) : ?>
            <div id="login_error">
                <?php echo $error; ?>
            </div>
        <?php endif; ?>
        
        <form name="loginform" class="loginform glass" action="<?php echo esc_url($_SERVER['REQUEST_URI']); ?>" method="post">
            <p>
                <label for="user_login">用户名或邮箱地址</label>
                <input type="text" name="log" id="user_login" class="input" value="<?php echo isset($_POST['log']) ? esc_attr($_POST['log']) : ''; ?>" size="20" autocapitalize="off" autocomplete="username" />
            </p>
            <p>
                <label for="user_pass">密码</label>
                <input type="password" name="pwd" id="user_pass" class="input" value="" size="20" autocomplete="current-password" />
            </p>
            <p class="forgetmenot">
                <label for="rememberme">
                    <input name="rememberme" type="checkbox" id="rememberme" value="forever" <?php checked(isset($_POST['rememberme'])); ?> />
                    记住我
                </label>
            </p>
            <p class="submit">
                <input type="submit" name="wp-submit" id="wp-submit" class="button button-primary" value="登录" />
                <input type="hidden" name="redirect_to" value="<?php echo esc_attr($redirect_to); ?>" />
                <input type="hidden" name="testcookie" value="1" />
            </p>
        </form>
        
        <p id="nav">
            <a href="<?php echo esc_url(wp_lostpassword_url()); ?>">忘记密码？</a>
            <?php if (get_option('users_can_register')) : ?>
                <a href="<?php echo esc_url(wp_registration_url()); ?>">注册</a>
            <?php endif; ?>
        </p>
        
        <p id="backtoblog">
            <a href="<?php echo esc_url(home_url('/')); ?>">← 返回到<?php echo esc_html($site_name); ?></a>
        </p>
    </div>
    

    
    <script>
    // 检测是否支持cookie
    document.cookie = "testcookie=1";
    if (document.cookie.indexOf("testcookie=") != -1) {
        document.getElementById('wp-submit').disabled = false;
    } else {
        document.getElementById('loginform').insertAdjacentHTML('beforebegin', 
            '<div class="message" id="login_error">请启用浏览器Cookie以继续</div>');
        document.getElementById('wp-submit').disabled = true;
    }
    </script>
</body>
</html> 