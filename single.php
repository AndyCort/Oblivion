<?php get_header(); ?>

<div class="container">
    <!-- 文章目录 -->
    <div class="toc-container">
        <div class="toc-title">文章目录</div>
        <div class="js-toc"></div>
    </div>

    <main class="main-box">
        <?php while (have_posts()) : the_post(); ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class('single-post'); ?>>
                <!-- 文章头部信息 -->
                <header class="post-header">
                    <div class="post-meta-top">
                        <span class="post-category">
                            <?php the_category(' '); ?>
                        </span>
                        <span class="post-date">
                            <i class="fas fa-clock"></i>
                            <?php echo get_the_date(); ?>
                        </span>
                    </div>
                    
                    <h1 class="post-title">
                        <?php the_title(); ?>
                    </h1>
                    
                    <div class="post-meta-bottom">
                        <div class="author-info">
                            <?php echo get_avatar(get_the_author_meta('ID'), 40); ?>
                            <span class="author-name"><?php the_author(); ?></span>
                        </div>
                        <div class="post-stats">
                            <span class="comments-count">
                                <i class="fas fa-comments"></i>
                                <?php comments_number('0', '1', '%'); ?>
                            </span>
                            <span class="views-count">
                                <i class="fas fa-eye"></i>
                                <?php echo get_post_views(get_the_ID()); ?>
                            </span>
                        </div>
                    </div>
                </header>

                <!-- 特色图片 -->
                <?php if (has_post_thumbnail()) : ?>
                    <div class="post-thumbnail">
                        <?php the_post_thumbnail('large'); ?>
                    </div>
                <?php endif; ?>

                <!-- 文章内容 -->
                <div class="post-content">
                    <div class="js-toc-content post-content-inner">
                        <?php the_content(); ?>
                    </div>
                </div>

                <!-- 文章标签 -->
                <?php if (has_tag()) : ?>
                    <div class="post-tags">
                        <i class="fas fa-tags"></i>
                        <?php the_tags('', ' '); ?>
                    </div>
                <?php endif; ?>

                <!-- 分享按钮 -->
                <div class="share-buttons">
                    <span class="share-title">分享到：</span>
                    <a href="https://twitter.com/intent/tweet?url=<?php echo urlencode(get_permalink()); ?>&text=<?php echo urlencode(get_the_title()); ?>" target="_blank" class="share-twitter">
                        <i class="fab fa-twitter"></i>
                    </a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo urlencode(get_permalink()); ?>" target="_blank" class="share-facebook">
                        <i class="fab fa-facebook"></i>
                    </a>
                    <a href="http://service.weibo.com/share/share.php?url=<?php echo urlencode(get_permalink()); ?>&title=<?php echo urlencode(get_the_title()); ?>" target="_blank" class="share-weibo">
                        <i class="fab fa-weibo"></i>
                    </a>
                </div>

                <!-- 上一篇/下一篇导航 -->
                <nav class="post-navigation">
                    <?php
                    $prev_post = get_previous_post();
                    $next_post = get_next_post();
                    ?>
                    <?php if ($prev_post) : ?>
                        <div class="nav-previous">
                            <span class="nav-subtitle">上一篇</span>
                            <a href="<?php echo get_permalink($prev_post); ?>" class="nav-title">
                                <?php echo get_the_title($prev_post); ?>
                            </a>
                        </div>
                    <?php endif; ?>
                    <?php if ($next_post) : ?>
                        <div class="nav-next">
                            <span class="nav-subtitle">下一篇</span>
                            <a href="<?php echo get_permalink($next_post); ?>" class="nav-title">
                                <?php echo get_the_title($next_post); ?>
                            </a>
                        </div>
                    <?php endif; ?>
                </nav>
            </article>

            <!-- 评论区 -->
            <?php 
            if (comments_open() || get_comments_number()) :
                comments_template();
            endif;
            ?>

        <?php endwhile; ?>
    </main>

    <?php get_sidebar(); ?>
</div>

<?php get_footer(); ?> 