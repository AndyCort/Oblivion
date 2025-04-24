<?php get_header(); ?>

<div class="container">
    <main class="main-box">
        <div class="search-header">
            <h1 class="search-title">
                <i class="fas fa-search"></i>
                搜索结果：<?php echo get_search_query(); ?>
            </h1>
            <div class="search-stats">
                找到 <?php global $wp_query; echo $wp_query->found_posts; ?> 个结果
            </div>
        </div>

        <?php if (have_posts()) : ?>
            <div class="search-results">
                <?php while (have_posts()) : the_post(); ?>
                    <article class="search-item">
                        <?php if (has_post_thumbnail()) : ?>
                            <div class="search-thumbnail">
                                <a href="<?php the_permalink(); ?>">
                                    <?php the_post_thumbnail('thumbnail'); ?>
                                </a>
                            </div>
                        <?php endif; ?>
                        
                        <div class="search-content">
                            <h2 class="search-item-title">
                                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                            </h2>
                            
                            <div class="search-meta">
                                <span class="search-date">
                                    <i class="fas fa-calendar"></i>
                                    <?php echo get_the_date(); ?>
                                </span>
                                <span class="search-category">
                                    <i class="fas fa-folder"></i>
                                    <?php the_category(', '); ?>
                                </span>
                            </div>
                            
                            <div class="search-excerpt">
                                <?php echo wp_trim_words(get_the_excerpt(), 30); ?>
                            </div>
                            
                            <a href="<?php the_permalink(); ?>" class="read-more">
                                阅读更多
                                <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </article>
                <?php endwhile; ?>
            </div>

            <?php the_posts_pagination(array(
                'prev_text' => '<i class="fas fa-chevron-left"></i>',
                'next_text' => '<i class="fas fa-chevron-right"></i>',
                'mid_size'  => 2
            )); ?>

        <?php else : ?>
            <div class="no-results">
                <div class="no-results-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h2>未找到相关内容</h2>
                <p>抱歉，没有找到与"<?php echo get_search_query(); ?>"相关的内容。</p>
                <div class="search-suggestions">
                    <h3>建议：</h3>
                    <ul>
                        <li>检查输入是否正确</li>
                        <li>尝试使用其他关键词</li>
                        <li>使用更简单的搜索词</li>
                    </ul>
                </div>
            </div>
        <?php endif; ?>
    </main>

    <?php get_sidebar(); ?>
</div>

<?php get_footer(); ?> 