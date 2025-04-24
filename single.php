<?php get_header(); ?>

        <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
            <article <?php post_class('single-post'); ?>>
                <header class="post-header">
                    <?php if(has_post_thumbnail()): ?>
                        <div class="post-thumbnail-container">
                            <?php the_post_thumbnail('large', ['class' => 'post-thumbnail']); ?>
                        </div>
                    <?php endif; ?>
                        <h1 class="article-title">
                            <?php the_title(); ?>
                        </h1>
                    <div class="post-meta">
                        <time class="post-date"><?php echo get_the_date(); ?></time>
                        <span class="post-author"><?php the_author(); ?></span>
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
                    </div>
                </header>

                <div class="article-content">
                    <?php the_content(); ?>
                </div>
                
                <?php if(has_tag()): ?>
                <div class="post-tags">
                    <?php the_tags('<span class="tag-label">标签：</span> ', ' ', ''); ?>
                </div>
                <?php endif; ?>
                
                <div class="post-navigation">
                    <div class="nav-previous"><?php previous_post_link('%link', '← 上一篇: %title'); ?></div>
                    <div class="nav-next"><?php next_post_link('%link', '下一篇: %title →'); ?></div>
                </div>
                
                <?php if (comments_open() || get_comments_number()) : ?>
                    <?php comments_template(); ?>
                <?php endif; ?>
            </article>
        <?php endwhile; else: ?>
            <div class="no-content">
                <div class="no-content-icon"><i class="fas fa-inbox"></i></div>
                <h2>文章不存在</h2>
                <p>抱歉，您请求的文章不存在或已被删除。</p>
                <a href="<?php echo home_url(); ?>" class="back-home">返回首页</a>
            </div>
        <?php endif; ?>

<?php get_footer(); ?> 