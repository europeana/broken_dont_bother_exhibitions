<?php head(array('title'=>'Exhibit Page', 'bodyclass'=>'exhibits')); ?>

<h1><?php echo html_escape($actionName); ?> Page</h1>

<div id="primary">

<script type="text/javascript" charset="utf-8">
//<![CDATA[
	
	jQuery(document).ready(function() {
        makeLayoutSelectable();
    });
	
	function makeLayoutSelectable() {        
		//Make each layout clickable
		jQuery('div.layout').bind('click', function(e) {
            jQuery('#layout-thumbs').find('div.current-layout').removeClass('current-layout');
            jQuery(this).addClass('current-layout');
            
            // Remove the old chosen layout
            jQuery('#chosen_layout').find('div.layout').remove()
            
            // Copy the chosen layout
            var copyLayout = jQuery(this).clone();
            
            // Take the form input out of the copy (so no messed up forms).
            copyLayout.find('input').remove();
            
            // Change the id of the copy
            copyLayout.attr('id', 'chosen_' + copyLayout.attr('id'));
            
            // Append the copy layout to the chosen_layout div        
            copyLayout.appendTo('#chosen_layout');
            
            // Check the radio input for the layout
            jQuery(this).find('input').attr('checked', true);      
		});		
	}
//]]>	
</script>

<form method="post" id="choose-layout">
	
    <div id="exhibits-breadcrumb">
    	<a href="<?php echo html_escape(uri('exhibits')); ?>">Exhibits</a> &gt; <a href="<?php echo html_escape(uri('exhibits/edit/' . $exhibit['id']));?>"><?php echo html_escape($exhibit['title']); ?></a>  &gt; <a href="<?php echo html_escape(uri('exhibits/edit-section/' . $exhibitSection['id']));?>"><?php echo html_escape($exhibitSection['title']); ?></a>  &gt; <?php echo html_escape($actionName . ' Page'); ?>
    </div>	

    <fieldset>
        <legend>Page Metadata</legend>
        <?php echo flash(); ?>
        <div class="field"><?php echo text(array('name'=>'title', 'id'=>'title', 'class'=>'textinput'), $exhibitPage->title, 'Page Title'); ?></div>
        <div class="field"><?php echo text(array('name'=>'slug','id'=>'slug','class'=>'textinput'), $exhibitPage->slug, 'Page Slug (no spaces or special characters)'); ?></div>
    </fieldset>		
		
	<fieldset id="layouts">
		<legend>Layouts</legend>
		
		<div id="chosen_layout">
		<?php
		if ($exhibitPage->layout) {
	        echo exhibit_builder_exhibit_layout($exhibitPage->layout, false);
		} else {
		    echo '<p>' . html_escape('Choose a layout by selecting a thumbnail on the right.') . '</p>';
		}
		?>
	    </div>
		
		<div id="layout-thumbs">
		<?php 
			$layouts = exhibit_builder_get_ex_layouts();
			foreach ($layouts as $layout) {
				echo exhibit_builder_exhibit_layout($layout);
			}
		?>
		</div>
	</fieldset> 
	<fieldset>
	<p id="exhibit-builder-save-changes"><input type="submit" name="save_page_metadata" id="page_metadata_form" value="Save Changes"/> or 
	    <a href="<?php echo html_escape(uri(array('module'=>'exhibit-builder', 'controller'=>'exhibits', 'action'=>'edit-section', 'id'=>$exhibitPage->section_id))); ?>">Cancel</a></p>
	</fieldset>
	
</form>
</div>
<?php foot(); ?>