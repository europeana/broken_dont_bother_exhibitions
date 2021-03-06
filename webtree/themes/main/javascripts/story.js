var story = function() {

	var viewer;
	var zoomitAjaxUrl = "";
	var zoomitAjaxUrlPrefix = "http://api.zoom.it/v1/content/?url=";
	var tmpImg;
	var zoomitWindow = jQuery("#zoomit_window");
	var zoomitEnabled;
	var endsWith = function(str, suffix) {
	    return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}	
	
	
    var targetObjHref = jQuery('a#info-link');
    if(targetObjHref[0]){
    	var href = targetObjHref.attr("href"); 
    	if(href.indexOf("?") > -1){
    		href = href.substr(0, href.indexOf("?"));
   			targetObjHref.attr("href", href);
    	}
    }
	
	// public 
	return{
		initStory: function (initialUrl, zoomitEnabledIn){
			tmpImg = jQuery('#media_wrapper img.tmp-img'); // TODO - declare at top.....
			zoomitEnabled = zoomitEnabledIn;
			log("init story...")
			switchMediaElement();
			//var firstThumbnail = jQuery('div#exhibit-item-thumbnails div.exhibit-item a.thumb');
			var firstThumbnail = jQuery('table#exhibit-item-thumbnails td a.thumb');
			if(firstThumbnail.length > 0){
				jQuery(firstThumbnail[0]).click();
			}
			else{
		        if ( endsWith(initialUrl, "jpg") || endsWith(initialUrl, "jpeg")) {
	               	markup("image", initialUrl);
	               	if(zoomitEnabled){
						zoomitAjaxUrl = initialUrl.replace("/fullsize/", "/files/");
	               		zoomitAjaxUrl = zoomitAjaxUrl.replace("http://127.0.0.1/ombad/webtree/", "http://test.exhibit.eanadev.org/"); // TODO remove this before going live - allows zoomit to work on localhost
						zoomitAjaxUrl = zoomitAjaxUrl.replace("http://10.101.28.3/ombad/webtree/", "http://test.exhibit.eanadev.org/"); // TODO remove this before going live - allows zoomit to work on localhost
						zoomitAjaxUrl = zoomitAjaxUrl.replace("http://localhost/webtree/", "http://test.exhibit.eanadev.org/"); // TODO remove this before going live - allows zoomit to work on localhost

				       	zoomitAjaxUrl = zoomitAjaxUrlPrefix + encodeURIComponent(zoomitAjaxUrl);
		               	poll();
		        	}
		        	else{
		        		showTmpImg();
		        	}
		        }
		        else{
		        	log("not an image: " + initialUrl);
		        }
			}
		}
	};

	function poll(){
		jQuery.ajax({
			url: zoomitAjaxUrl,
			dataType: "jsonp",
			success: onZoomitResponse
		});			
	}

	function log(msg){
		if(typeof console != "undefined" && typeof console.log != "undefined"){
			console.log(msg);
		}
	}
	
	function showTmpImg(){
		if(viewer){
			zoomitWindow.css("display", "none");
		}
		tmpImg.css("display", "block");
		tmpImg.css("visibility", "visible");
	};

	function hideTmpImg(remove){
		if(remove){
			tmpImg.css("display", "none");		// we don't really "remove" it, just put it out of sight
		}
		tmpImg.css("visibility", "hidden");
		if(viewer){
			zoomitWindow.css("display", "block");
		}
	};

	
	function onZoomitResponse(resp) {
		if(resp.error){
			log("response error");

			showTmpImg(true);
			return;
		}
		
		var content = resp.content;
	
		if(content.ready){
			//log("content.ready");
	
			// this is called when we have a height
			var showZoomitImage = function(){
				zoomitWindow.height(height);				
				zoomitWindow.width(width);
		
				viewer = new Seadragon.Viewer(zoomitWindow[0]);
				
				Seadragon.Config.autoHideControls = false;
				viewer.addEventListener("open",
					function(){
						viewer.viewport.goHome();	
					}
				);
				viewer.openDzi(content.dzi);
				hideTmpImg(true);				
			}
			
			var width	= 0;
			var height	= 0;
			
			showTmpImg(); // ANDY: moved this line up from 2 lines below because of a chrome issue 
			
			if(tmpImg.width()>0 && tmpImg.height() > 0){
				
				//showTmpImg(); // needed for valid calculation
				height	= tmpImg.height();
				width	= tmpImg.width();
				log("get dimension from tmp-img " + width + " x " + height);
				
				
				showZoomitImage();
			}
			else{ // scale viewport according to calculation
				
				tmpImg.load(function(){
					log("tmp img now loaded...");

					height	= tmpImg.height();
					width	= tmpImg.width();
					log("get dimension from tmp-img " + width + " x " + height);
					
					showZoomitImage();
					
				})
				/*				
				log("get dimension from calculation");
				var maxHeight = jQuery("#items").height();
				//log("maxHeight = " + maxHeight);
				height = content.dzi.height < maxHeight ? content.dzi.height : maxHeight;
				//log("content.dzi.height = " + content.dzi.height + ", maxHeight = " + maxHeight);
				width = content.dzi.width / (content.dzi.height / height);
				*/
			}
			
			
		}
		else if(content.failed){
			log("content failed");

			showTmpImg();
		}
		else{
			showTmpImg();
			log(Math.round(100 * content.progress) + "% done.");
			setTimeout(poll, 1500);
		}
	}


	function markup(type, url){
		

		if(type=="pdf"){
			var viewerHTML = "";

        	// ipad fix
			viewerHTML += '<style>';
			viewerHTML += 	'#exhibit-item-infocus-item .theme-center-middle, #exhibit-item-infocus-item .theme-center-inner{width:100%;}';
			viewerHTML += '</style>';
			viewerHTML += '<div id="in-focus" class="pdf-viewer">';
			viewerHTML += 	'<iframe style="border:none; max-height:100%; max-width:100%; width:100%;" ';
			viewerHTML += 		'src="http://docs.google.com/viewer?url=' + encodeURIComponent(url) + '&amp;embedded=true" ';
			viewerHTML += 		'id="docview">';
			viewerHTML += 	'</iframe>';
			viewerHTML += '</div>';
			
			jQuery("#in-focus").parent().find("style").remove();
            jQuery('div#in-focus').remove();
            jQuery("#exhibit-item-infocus-header").parent().append(viewerHTML);
            
            // remove the info link for pdfs
            jQuery("#exhibit-item-infocus-header").css("display", "none");
            
            // chrome (windows) fix
            var viewerHeight	= jQuery(".pdf-viewer").height();
            var viewerWidth		= jQuery(".pdf-viewer").width();
            if(viewerHeight < viewerWidth){
            	jQuery(".pdf-viewer").height(viewerWidth * 1.4);
            }
		}
		else{
            // restore the info link if previously hidden for a pdf
            jQuery("#exhibit-item-infocus-header").css("display", "block");
		}
		
		if(type == "video"){

			var videoHTML = "";
			videoHTML += '<style>.mejs-overlay-loading{width:88px!important;}</style>';
			videoHTML += '<div id="in-focus" class="player">';
			//videoHTML += '<a id="video-logo-link" href="http://europeana.eu"><img src="' + web_root + '/themes/main/images/europeana-logo-en.png"></a>';
			
			
			videoHTML += '<video  width="0" height="0" style="width:100%; height:100%;" preload="none">';
			
            if(endsWith(url, '.mp4')){
            	videoHTML += '<source type="video/mp4" src="' + url +  '" />';
            }
            if(endsWith(url, '.webm')){
            	videoHTML += '<source type="video/webm" src="' + url +  '" />';
            }
            if(endsWith(url, '.ogv')){
            	videoHTML += '<source type="video/ogg" src="' + url +  '" />';
            }
            if(endsWith(url, '.ogv')){
            	videoHTML += '<source type="video/ogg" src="' +  url +  '" />';
            }

            videoHTML += 	'<object type="application/x-shockwave-flash" data="' + web_root + '/themes/main/javascripts/mediaelement-2.7/build/flashmediaelement.swf">';
            videoHTML += 	'<param name="movie" value="' + web_root + '/themes/main/javascripts/mediaelement-2.7/build/flashmediaelement.swf" />';
            videoHTML += 	'<param name="flashvars" value="controls=true&amp;file=' + url + '" />'; 		
            videoHTML += 	'<img src="' + web_root + '/themes/connect-dismarc/images/logo.png" width="100%" height="auto;" alt="No video playback capabilities" title="No video playback capabilities" />';
            videoHTML += 	'</object>';
            videoHTML +=  '</video>';
            videoHTML += '</div>';

            jQuery("div#in-focus").parent().find("style").remove();
            jQuery('div#in-focus').remove();
            jQuery("#exhibit-item-infocus-header").parent().append(videoHTML);
            
        	jQuery('audio,video').mediaelementplayer({
                audioHeight: 30,
                plugins: ['flash','silverlight'],
                // the order of controls you want on the control bar (and other plugins below)
                features: ['playpause','progress','current','duration','volume','fullscreen'],
        		success: function(player, node) {
        			
        			if(jQuery('div#in-focus').width() == 0){ // IE7 fix
	        			jQuery('div#in-focus').width(jQuery('#exhibit-item-infocus').width()-20);
	        			player.setVideoSize(jQuery('#exhibit-item-infocus').width()-20, "auto");
	        			mejs.MediaElementPlayer.prototype.buildoverlays();
        			}
        			
        		}
        	});

		}
		if(type == "image"){
			jQuery("#in-focus").attr("class", type);
			
			var defImgClass  = "full tmp-img";
			var responsiveHTML1 = "";
			var responsiveHTML2 = "";
				
			if(!zoomitEnabled){
				url = url.replace(".jpg", "_euresponsive_1.jpg");
				url = url.replace("/files/", "/euresponsive/");
				url = url.replace("/fullsize/", "/euresponsive/")
				log("No zoomit, so make responsive");
				defImgClass  = "full";
				
				responsiveHTML1 = '<script class="euresponsive-script"></script><!--<noscript>';
				responsiveHTML2 = '</noscript -->';
			}
			
			var altText = jQuery("#exhibit-item-title-only h2").html();
			
			if(!zoomitEnabled && jQuery.browser.msie  && ( parseInt(jQuery.browser.version, 10) === 7 || parseInt(jQuery.browser.version, 10) === 8 )  ) {	// IE7's stupendously bad handling of innerHTML makes responsive images a no-go.
				url = url.replace("euresponsive_1", "euresponsive_4");
				
				
				jQuery("#in-focus")[0].innerHTML ='<img  src="' + url + '"/>';
				jQuery("#in-focus img[src='" + url + "']").attr("class", defImgClass);
				tmpImg = jQuery('#media_wrapper img.tmp-img');
				showTmpImg();
				return;
			}

			var html =	'<div id="media_wrapper">\n'
				+			'<div id="zoomit_window"></div>\n'
				+			responsiveHTML1
				+			'<img class="' + defImgClass + '" src="' + url + '" alt="' + altText + '"/>' + responsiveHTML2 
				+		'</div>\n';

			jQuery("#in-focus")[0].innerHTML = html;
			jQuery("#in-focus").parent().find("style").remove();
			
			zoomitWindow = jQuery("#zoomit_window");
			tmpImg = jQuery('#media_wrapper img.tmp-img');

			if(!zoomitEnabled){
				
				zoomitWindow.hide();
				var initialSuffix = '_euresponsive_1.jpg'; // smallest by default
				if(jQuery.browser.msie  && ( parseInt(jQuery.browser.version, 10) === 7 || parseInt(jQuery.browser.version, 10) === 8 )  ){
					initialSuffix = '_euresponsive_4.jpg'; // largest by default
				}
				responsiveGallery({
					scriptClass: 'euresponsive-script',
					testClass: 'euresponsive',
					initialSuffix: initialSuffix,
					suffixes: {
						'1': '_euresponsive_1.jpg',
						'2': '_euresponsive_2.jpg',
						'3': '_euresponsive_3.jpg',
						'4': '_euresponsive_4.jpg'
					}
				});
				
			}
		}
	}


	function switchMediaElement() {
//	    jQuery('div#exhibit-item-thumbnails div.exhibit-item a.thumb').each(function(index) {
		
    	jQuery('table#exhibit-item-thumbnails td a.thumb').each(function(index) {
	        //VALUES
    		
	        var mimeType = jQuery(this).find('img:first').attr('rel');
	        var zoomitIsEnabled = jQuery(this).next('input.zoomit').first().val() == "1";

	        
	        var newObjHref = jQuery(this).attr('href');
	        var newObjSrc = jQuery(this).find('img:first').attr('src').replace('square_thumbnails', 'fullsize');
	        var newObjTitle = jQuery(this).find('img:first').attr('alt');
	        //var newZoomURI = jQuery(this).next('input.zoomit').first().val();
	
	        
	        // PLACEHOLDERS
	        var targetObjHref = jQuery('a#info-link');
	        
	        
	        //var targetObjTitle = jQuery('table#exhibit-item-title h4');
	        var targetObjTitle = jQuery('#exhibit-item-title-only h2');
	        
	        
	        var targetZoomitHref = jQuery('div#in-focus');
	
	        // CLICK THE THUMBNAIL
	        jQuery(this).click(function() {
	            var mediaURI = jQuery(this).find('img:first').attr('accesskey');
	            var regexAudio	= /^audio/;
	            var regexVideo	= /^video/;
	            var regexImage	= /^image/;
	            var regexPdf	= /^application/;
	            
	            if (mimeType.match(regexImage)) { // all images a zoomit-able
	
	            	zoomitEnabled = zoomitIsEnabled;
	            	log("we have an image...zoomitEnabled = " + zoomitEnabled);

	               	markup("image", newObjSrc);
	               	
	           		jQuery('#exhibit-item-title-only h6').html(newObjTitle);
		
	           		if(zoomitEnabled){
		        		tmpImg.attr("src", newObjSrc).load(function() {
								zoomitAjaxUrl = newObjSrc.replace("/fullsize/", "/files/");
								
			               		zoomitAjaxUrl = zoomitAjaxUrl.replace("http://127.0.0.1/ombad/webtree/", "http://test.exhibit.eanadev.org/"); // TODO remove this before going live - allows zoomit to work on localhost
								zoomitAjaxUrl = zoomitAjaxUrl.replace("http://10.101.28.3/ombad/webtree/", "http://test.exhibit.eanadev.org/"); // TODO remove this before going live - allows zoomit to work on localhost
								zoomitAjaxUrl = zoomitAjaxUrl.replace("http://localhost/webtree/", "http://test.exhibit.eanadev.org/"); // TODO remove this before going live - allows zoomit to work on localhost

				            	zoomitAjaxUrl = zoomitAjaxUrlPrefix + encodeURIComponent(zoomitAjaxUrl);
			        			poll();
		               	});  
	           		}
	
	            }
	            if (mimeType.match(regexAudio)) {
	            	
	            	log("we have audio...");

	                jQuery('div#in-focus').html('<audio  controls="controls"  type="audio/mp3" src="' + mediaURI + '"></audio>');
	                jQuery('div#in-focus audio').mediaelementplayer({
	                    enableAutosize: true,
	                    defaultVideoWidth: 460,
	                    defaultVideoHeight: 270,
	                    videoWidth: -1,
	                    videoHeight: -1,
	                    audioWidth: 460,
	                    audioHeight: 84,
	                    plugins: ['flash','silverlight'],
	                    features: ['playpause','progress','current','duration','volume','fullscreen']
	                });
	                
	           		jQuery('#exhibit-item-title-only h6').html(newObjTitle);

	            }
	            if (mimeType.match(regexVideo)) {
	            	log("we have a video...");
	            	markup("video", mediaURI);
	            	
	            	jQuery('#exhibit-item-title-only h6').html(newObjTitle);
	            }
	            if (mimeType.match(regexPdf)) {
	            	log("we have a pdf...");
	            	markup("pdf", mediaURI);
	            	
	           		jQuery('#exhibit-item-title-only h6').html(newObjTitle);
	            }
	            
	            // Replace the url for the link to the item page
	            targetObjHref.attr('href', newObjHref);
	            // Replace the title
	            targetObjTitle.html(newObjTitle);
	            // Don't follow the hyperlink, just execute the above code
	            
	            return false;
	        });
	    });
	}

}();
