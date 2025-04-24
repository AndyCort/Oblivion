<aside class="sidebar">
    <?php if (is_active_sidebar('primary-sidebar')) : ?>
        <div class="widget-area">
            <?php dynamic_sidebar('primary-sidebar'); ?>
        </div>
    <?php else : ?>
        <div class="no-widgets">
            <p><?php _e('请添加小工具到侧边栏', 'oblivion'); ?></p>
        </div>
    <?php endif; ?>
</aside> 