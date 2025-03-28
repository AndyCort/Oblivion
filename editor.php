<?php
/**
 * Template Name: Editor
 */

get_header();

// 检测用户登录状态和权限
if (!is_user_logged_in() || !current_user_can('edit_posts')) {
    echo '<div class="alert">请先登录并获取发布权限</div>';
    get_footer();
    exit;
}

// 处理表单提交
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit_post'])) {
    // 安全检查
    if (!isset($_POST['post_nonce']) || !wp_verify_nonce($_POST['post_nonce'], 'submit_post')) {
        wp_die('安全验证失败');
    }

    // 获取表单数据
    $post_title   = sanitize_text_field($_POST['post_title']);
    $post_content = wp_kses_post($_POST['post_content']);
    $post_category = intval($_POST['post_category']);
    $post_tags    = sanitize_text_field($_POST['post_tags']);
    
    // 创建新文章
    $new_post = array(
        'post_title'    => $post_title,
        'post_content'  => $post_content,
        'post_status'  => 'publish',
        'post_type'    => 'post',
        'post_author'  => get_current_user_id(),
        'post_category' => array($post_category)
    );

    // 插入文章
    $post_id = wp_insert_post($new_post);

    if ($post_id && !is_wp_error($post_id)) {
        // 添加标签
        wp_set_post_tags($post_id, $post_tags);

        // 处理特色图片上传
        if (!empty($_FILES['featured_image']['name'])) {
            require_once(ABSPATH . 'wp-admin/includes/image.php');
            require_once(ABSPATH . 'wp-admin/includes/file.php');
            require_once(ABSPATH . 'wp-admin/includes/media.php');
            
            $attachment_id = media_handle_upload('featured_image', $post_id);
            if (!is_wp_error($attachment_id)) {
                set_post_thumbnail($post_id, $attachment_id);
            }
        }

        echo '<div class="success">文章发布成功！<a href="' . get_permalink($post_id) . '">查看文章</a></div>';
    } else {
        echo '<div class="error">发布失败，请重试</div>';
    }
}
?>

<div class="post-editor-container">
    <h1><?php the_title(); ?></h1>
    
    <form method="post" enctype="multipart/form-data">
        <?php wp_nonce_field('submit_post', 'post_nonce'); ?>
        
        <div class="form-group">
            <label for="post_title">文章标题</label>
            <input type="text" id="post_title" name="post_title" required>
        </div>

        <div class="form-group">
            <label for="post_content">文章内容</label>
            <?php 
            wp_editor('', 'post_content', array(
                'textarea_rows' => 10,
                'media_buttons' => true,
                'teeny'         => false
            )); 
            ?>
        </div>

        <div class="form-group">
            <label for="post_category">分类目录</label>
            <select id="post_category" name="post_category">
                <?php 
                $categories = get_categories(array('hide_empty' => false));
                foreach ($categories as $category) {
                    echo '<option value="' . $category->term_id . '">' . $category->name . '</option>';
                }
                ?>
            </select>
        </div>

        <div class="form-group">
            <label for="post_tags">文章标签（用逗号分隔）</label>
            <input type="text" id="post_tags" name="post_tags">
        </div>

        <div class="form-group">
            <label for="featured_image">特色图片</label>
            <input type="file" id="featured_image" name="featured_image" accept="image/*">
        </div>

        <button type="submit" name="submit_post" class="submit-button">立即发布</button>
    </form>
</div>

<style>
.post-editor-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background: #fff;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.form-group {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

input[type="text"], 
select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
}

.submit-button {
    background: #0073aa;
    color: white;
    padding: 0.8rem 1.5rem;
    border: none;
    cursor: pointer;
}

.alert, .success, .error {
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 4px;
}

.alert { background: #ffeeba; }
.success { background: #d4edda; }
.error { background: #f8d7da; }
</style>

<?php get_footer(); ?>