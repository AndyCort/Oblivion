<?php get_header(); ?>

<main class="container">
    <div class="main-box">
        <?php while (have_posts()) : the_post(); ?>
            <article <?php post_class('page-content'); ?>>
                <header class="page-header">
                    <h1 class="page-title"><?php the_title(); ?></h1>
                </header>

                <?php if (has_post_thumbnail()) : ?>
                    <div class="page-thumbnail">
                        <?php the_post_thumbnail('large'); ?>
                    </div>
                <?php endif; ?>

                <div class="entry-content">
                    <?php the_content(); ?>
                    <?php wp_link_pages(); ?>
                </div>
            </article>

            <?php
            if (comments_open() || get_comments_number()) :
                comments_template();
            endif;
            ?>

        <?php endwhile; ?>
    </div>
</main>

<?php get_sidebar(); ?>
<?php get_footer(); ?> 