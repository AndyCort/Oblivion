<?php get_header(); ?>
<!-- 全屏欢迎区域 -->
<div class="home">
    <div class="welcome-content">
        <h1 class="welcome-title">
            Hi，<?php echo get_current_user_name(); ?>!
        </h1>
        <!-- 随机引用框 -->
        <div class="random-quote-box glass">
            <div class="quote-icon">
                <i class="fas fa-quote-left"></i>
            </div>
            <div class="quote-content">
                <?php echo get_random_quote(); ?>
            </div>
            <div class="quote-icon right">
                <i class="fas fa-quote-right"></i>
            </div>
            <button type="button" class="refresh-quote-btn glass" title="刷新">
                <i class="fas fa-sync-alt"></i>
            </button>
        </div>
        
        <!-- 社交媒体图标 -->
        <?php oblivion_get_social_icons(); ?>
        <!-- 向下滚动提示 -->
        <div class="scroll-down-hint">
            <div class="scroll-arrow">
                <i class="fas fa-chevron-down"></i>
            </div>
        </div>
    </div>
</div>

<!-- 文章列表 -->
<main class="container glass">
    <div class="main-box">
        <?php 
        // 使用最简单的方式显示文章
        global $wpdb;
        $posts_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'post' AND post_status = 'publish'");
        
        if ($posts_count > 0) : ?>
            <h1 class="page-title">文章列表</h1>
            
            <div class="post-list">
                <?php
                // 重置查询
                wp_reset_query();
                
                // 创建新的查询，获取所有文章并按时间排序
                $posts_query = new WP_Query(array(
                    'post_type' => 'post',
                    'post_status' => 'publish',
                    'posts_per_page' => -1,
                    'orderby' => 'date',
                    'order' => 'DESC',
                ));
                
                if ($posts_query->have_posts()) : 
                    while ($posts_query->have_posts()) : $posts_query->the_post(); 
                ?>
                    <article <?php post_class('post-item'); ?>>
                        <div class="post-inner">
                            <div class="thumbnail-container">
                                <a href="<?php the_permalink(); ?>" class="thumbnail-link">
                                    <?php if(has_post_thumbnail()): ?>
                                        <?php the_post_thumbnail('medium', ['class' => 'post-thumbnail']); ?>
                                    <?php else: ?>
                                        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/default-cover.jpg" alt="<?php the_title_attribute(); ?>" class="post-thumbnail">
                                    <?php endif; ?>
                                </a>
                            </div>
                            <div class="post-content">
                                <h2 class="post-title">
                                    <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                                </h2>
                                <?php if(has_category()): ?>
                                <div class="post-categories-wrapper">
                                    <div class="post-categories">
                                        <?php the_category(' '); ?>
                                    </div>
                                    <button class="tags-toggle-btn" title="展开/收起标签">
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                </div>
                                <?php endif; ?>
                                <div class="post-excerpt">
                                    <?php the_excerpt(); ?>
                                </div>
                                <?php 
                                // 获取文章链接 - 使用两种方式
                                $permalink = get_permalink();
                                $query_permalink = home_url('/?p=' . get_the_ID());
                                
                                // 输出调试信息
                                echo '<!-- 调试信息: 文章ID=' . get_the_ID() . ', 标准链接=' . $permalink . ', 查询链接=' . $query_permalink . ' -->';
                                ?>
                                <a href="<?php echo esc_url($query_permalink); ?>" class="read-more" target="_self">阅读全文 <i class="fas fa-arrow-right"></i></a>
                            </div>
                        </div>
                        
                        <div class="post-meta">
                            <time class="post-date"><?php echo get_the_date(); ?></time>
                            <span class="post-author"><?php the_author(); ?></span>
                        </div>
                    </article>
                <?php 
                    endwhile;
                    
                    // 分页
                    echo '<div class="pagination">';
                    echo paginate_links(array(
                        'prev_text' => '&laquo; 上一页',
                        'next_text' => '下一页 &raquo;',
                        'type' => 'list',
                        'end_size' => 3,
                        'mid_size' => 2
                    ));
                    echo '</div>';
                    
                else:
                    echo '<div style="background-color: rgba(255,0,0,0.1); color: #fff; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
                        <p>无法找到任何文章。</p>
                    </div>';
                endif;
                wp_reset_postdata(); 
                ?>
            </div>
            
        <?php else : ?>
            <div class="no-content">
                <div class="no-content-icon"><i class="fas fa-inbox"></i></div>
                <h2>暂无内容</h2>
                <p>抱歉，目前没有找到任何文章。</p>
                <?php get_search_form(); ?>
            </div>
        <?php endif; ?>
    </div>
</main>

<?php get_footer(); ?> 