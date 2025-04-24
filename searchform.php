<form role="search" method="get" class="search-form" action="<?php echo esc_url(home_url('/')); ?>">
    <label>
        <span class="screen-reader-text"><?php _e('搜索：', 'oblivion'); ?></span>
        <input type="search" class="search-field" placeholder="<?php esc_attr_e('输入关键词...', 'oblivion'); ?>" value="<?php echo get_search_query(); ?>" name="s" />
    </label>
    <button type="submit" class="search-submit">
        <?php _e('搜索', 'oblivion'); ?>
    </button>
</form> 