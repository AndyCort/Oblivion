<?php get_header(); ?>

<div class="header-image">
    <?php if(get_header_image()) : ?>
        <img src="<?php header_image(); ?>" alt="<?php bloginfo('name'); ?>">
    <?php endif; ?>
</div>

<main class="container">
    <div class="main-box">
        <?php if (have_posts()) : ?>
            <div class="post-list" id="lists">
                <?php while (have_posts()) : the_post(); ?>
                    <article <?php post_class('post-item'); ?>>
                        <?php if(has_post_thumbnail()): ?>
                            <a href="<?php the_permalink(); ?>">
                                <?php the_post_thumbnail('large', ['class' => 'post-thumbnail']); ?>
                            </a>
                        <?php endif; ?>
                        
                        <div class="post-content">
                            <h2 class="post-title">
                                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                            </h2>
                            <div class="post-excerpt">
                                <?php the_excerpt(); ?>
                            </div>
                        </div>
                        
                        <div class="post-meta">
                            <time class="post-date"><?php echo get_the_date(); ?></time>
                            <span class="post-author"><?php the_author(); ?></span>
                        </div>
                    </article>
                <?php endwhile; ?>
            </div>

            <div class="page-nav">
                <?php
                the_posts_pagination(array(
                    'prev_text' => __('« 上一页', 'oblivion'),
                    'next_text' => __('下一页 »', 'oblivion'),
                    'mid_size'  => 2
                ));
                ?>
            </div>
        <?php else : ?>
            <div class="no-content">
                <?php get_template_part('template-parts/content', 'none'); ?>
            </div>
        <?php endif; ?>
    </div>
</main>

<?php get_sidebar(); ?>
<?php get_footer(); ?> 