<?php
/**
 * The template for displaying comments
 */

// 如果文章受密码保护且未输入密码，不显示评论
if (post_password_required()) {
    return;
}
?>

<?php if (have_comments()) : ?>
    <h2 class="comments-title">
        <?php
        $comments_number = get_comments_number();
        if ('1' === $comments_number) {
            printf(
                /* translators: %s: post title */
                esc_html__('一条评论', 'oblivion'),
                '<span>' . wp_kses_post(get_the_title()) . '</span>'
            );
        } else {
            printf(
                /* translators: %s: number of comments */
                esc_html(_n('%s 条评论', '%s 条评论', $comments_number, 'oblivion')),
                number_format_i18n($comments_number)
            );
        }
        ?>
    </h2>

    <ol class="comment-list">
        <?php
        wp_list_comments(array(
            'style'       => 'ol',
            'short_ping'  => true,
            'avatar_size' => 60,
        ));
        ?>
    </ol>

    <?php
    // 评论分页导航
    the_comments_pagination(array(
        'prev_text' => '<span class="screen-reader-text">' . __('上一页', 'oblivion') . '</span>',
        'next_text' => '<span class="screen-reader-text">' . __('下一页', 'oblivion') . '</span>',
    ));
    ?>

<?php endif; ?>

<?php
// 如果评论已关闭且有评论，显示提示信息
if (!comments_open() && get_comments_number() && post_type_supports(get_post_type(), 'comments')) :
?>
    <p class="no-comments"><?php esc_html_e('评论已关闭。', 'oblivion'); ?></p>
<?php endif; ?>

<?php
comment_form(array(
    'title_reply'         => __('发表评论', 'oblivion'),
    'title_reply_to'      => __('回复 %s', 'oblivion'),
    'cancel_reply_link'   => __('取消回复', 'oblivion'),
    'label_submit'        => __('发表评论', 'oblivion'),
    'comment_field'       => '<p class="comment-form-comment"><label for="comment">' . _x('评论', 'noun', 'oblivion') . '</label><textarea id="comment" name="comment" cols="45" rows="8" aria-required="true"></textarea></p>',
));
?>
