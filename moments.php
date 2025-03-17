<?php
/* 
Template Name: Moments 
*/

get_header();

// 检查用户是否登录
if (!is_user_logged_in() && get_option('moment_require_login', true)) {
    ?>
    <div class="moments-login-required">
        <h2>需要登录</h2>
        <p>请先登录后查看说说内容</p>
        <a href="<?php echo wp_login_url(get_permalink()); ?>" class="button">登录</a>
    </div>
    <?php
    get_footer();
    return;
}
?>

<div class="moments-container">
    <?php if (is_user_logged_in()): ?>
    <!-- 发布说说表单 -->
    <div class="publish-moment">
        <form id="moment-form" method="post" enctype="multipart/form-data">
            <div class="moment-editor">
                <textarea name="content" id="moment-content" placeholder="分享你的想法..."></textarea>
                <div class="moment-tools">
                    <div class="tool-item">
                        <label for="moment-images">
                            <i class="fas fa-image"></i>
                            <span>图片</span>
                        </label>
                        <input type="file" name="images[]" id="moment-images" multiple accept="image/*" style="display: none;">
                    </div>
                    <div class="tool-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <input type="text" name="location" placeholder="所在位置">
                    </div>
                    <div class="tool-item">
                        <select name="visibility">
                            <option value="public">公开</option>
                            <option value="friends">仅好友可见</option>
                            <option value="private">仅自己可见</option>
                        </select>
                    </div>
                </div>
                <div id="image-preview" class="image-preview"></div>
            </div>
            <button type="submit" class="publish-btn">发布</button>
            <?php wp_nonce_field('publish_moment', 'moment_nonce'); ?>
            <input type="hidden" name="action" value="publish_moment">
        </form>
    </div>
    <?php endif; ?>

    <!-- 说说列表 -->
    <div class="moments-list">
        <?php
        $paged = get_query_var('paged') ? get_query_var('paged') : 1;
        $args = array(
            'post_type' => 'moment',
            'posts_per_page' => 10,
            'paged' => $paged,
            'orderby' => 'date',
            'order' => 'DESC'
        );

        if (!current_user_can('administrator')) {
            $args['meta_query'] = array(
                'relation' => 'OR',
                array(
                    'key' => '_moment_visibility',
                    'value' => 'public'
                ),
                array(
                    'key' => '_moment_visibility',
                    'value' => 'friends',
                    'compare' => '='
                ),
                array(
                    'key' => '_moment_visibility',
                    'value' => 'private',
                    'compare' => '=',
                    'author' => get_current_user_id()
                )
            );
        }

        $moments_query = new WP_Query($args);

        if ($moments_query->have_posts()) :
            while ($moments_query->have_posts()) : $moments_query->the_post();
                ?>
                <article class="moment-item" id="moment-<?php the_ID(); ?>">
                    <div class="moment-header">
                        <div class="moment-author">
                            <?php echo get_avatar(get_the_author_meta('ID'), 40); ?>
                            <div class="author-info">
                                <h3><?php the_author(); ?></h3>
                                <div class="moment-meta">
                                    <span class="moment-time">
                                        <?php echo human_time_diff(get_the_time('U'), current_time('timestamp')); ?>前
                                    </span>
                                    <?php
                                    $location = get_post_meta(get_the_ID(), '_moment_location', true);
                                    if ($location) :
                                        ?>
                                        <span class="moment-location">
                                            <i class="fas fa-map-marker-alt"></i>
                                            <?php echo esc_html($location); ?>
                                        </span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                        <?php if (get_current_user_id() == get_the_author_meta('ID')) : ?>
                            <div class="moment-actions">
                                <a href="<?php echo get_edit_post_link(); ?>" class="edit-moment">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <button class="delete-moment" data-id="<?php the_ID(); ?>">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        <?php endif; ?>
                    </div>

                    <div class="moment-content">
                        <?php the_content(); ?>
                    </div>

                    <?php
                    $images = get_post_meta(get_the_ID(), '_moment_images', true);
                    if (!empty($images)) :
                        ?>
                        <div class="moment-images">
                            <?php foreach ($images as $image) : ?>
                                <div class="image-item">
                                    <img src="<?php echo esc_url($image); ?>" alt="">
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>

                    <div class="moment-footer">
                        <div class="moment-stats">
                            <button class="like-btn <?php echo is_moment_liked(get_the_ID()) ? 'liked' : ''; ?>"
                                    data-id="<?php the_ID(); ?>">
                                <i class="fas fa-heart"></i>
                                <span class="like-count">
                                    <?php echo get_post_meta(get_the_ID(), '_moment_likes', true) ? count(get_post_meta(get_the_ID(), '_moment_likes', true)) : 0; ?>
                                </span>
                            </button>
                            <button class="comment-btn" data-id="<?php the_ID(); ?>">
                                <i class="fas fa-comment"></i>
                                <span class="comment-count">
                                    <?php echo get_comments_number(); ?>
                                </span>
                            </button>
                        </div>

                        <!-- 评论区域 -->
                        <div class="moment-comments">
                            <?php
                            $comments = get_comments(array(
                                'post_id' => get_the_ID(),
                                'status' => 'approve'
                            ));

                            if ($comments) :
                                foreach ($comments as $comment) :
                                    ?>
                                    <div class="comment-item">
                                        <?php echo get_avatar($comment->user_id, 24); ?>
                                        <div class="comment-content">
                                            <span class="comment-author"><?php echo $comment->comment_author; ?></span>
                                            <p><?php echo $comment->comment_content; ?></p>
                                        </div>
                                    </div>
                                <?php
                                endforeach;
                            endif;
                            ?>

                            <?php if (is_user_logged_in()) : ?>
                                <form class="comment-form" data-moment-id="<?php the_ID(); ?>">
                                    <div class="comment-input-wrapper">
                                        <?php echo get_avatar(get_current_user_id(), 24); ?>
                                        <input type="text" class="comment-input" placeholder="写下你的评论...">
                                        <button type="submit" class="submit-comment">发送</button>
                                    </div>
                                </form>
                            <?php endif; ?>
                        </div>
                    </div>
                </article>
            <?php
            endwhile;

            // 分页导航
            echo '<div class="moments-pagination">';
            echo paginate_links(array(
                'total' => $moments_query->max_num_pages,
                'current' => $paged,
                'prev_text' => '<i class="fas fa-chevron-left"></i>',
                'next_text' => '<i class="fas fa-chevron-right"></i>'
            ));
            echo '</div>';

        else :
            ?>
            <div class="no-moments">
                <p>还没有任何说说，来发布第一条吧！</p>
            </div>
        <?php
        endif;
        wp_reset_postdata();
        ?>
    </div>
</div>

<?php get_footer(); ?> 