<?php



function ve_translate($label, $default)
{
    $lang = isset($_COOKIE['ve_lang']) ? $_COOKIE['ve_lang'] : 'en';
    $xml = simplexml_load_file(WEB_ROOT . '/themes/main/translations.xml');
    $translation = $xml->{strtolower(trim($label))}->$lang;
    if (trim($translation) != '') {
        return $translation;
    }
    else {
        return $default;
    }
}


function exhibit_has_map($exhibit){
	if( class_exists('EUMap') ){	// make sure EUMaps plug-in is installed
		
		$tags = $exhibit->getTags();
		
		// debug
		foreach ($tags as $tag) {
			error_log("TAG = " . $tag);
		}
		
		$mapTable = get_db()->getTable('EUMap');
		$query = "SELECT * FROM omeka_eu_maps where tag in ("  . "'" . implode("', '", $tags) . "'" .  ")";
		$maps = $mapTable->fetchObjects($query);
		
		if(!empty($maps)){
			return true;
		}
	}
	return false;
}

function exhibit_map_data($exhibit){
	
	if( class_exists('EUMap') ){	// make sure EUMaps plug-in is installed
		
		$tags = $exhibit->getTags();
		$mapTable = get_db()->getTable('EUMap');
		
		foreach ($tags as $tag) {
		    $maps = $mapTable->fetchObjects( "SELECT * FROM omeka_eu_maps where tag = '" . $tag . "'");
		    
		    if(!empty($maps)){
		    	return $maps[0];
		    }
		}
	}
	return null;
}

function exhibit_map_title_url_img($pageId){

}
