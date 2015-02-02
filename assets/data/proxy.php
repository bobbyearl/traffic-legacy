<?php

// Gotta get that
$json = file_get_contents('http://files0.iteriscdn.com/WebApps/SC/SafeTravel4/data/geojson/icons/metadata/icons.cctv.geojsonp');

// Cleanup
$json = str_replace('OpenLayers.Protocol.ScriptLite.registry.load_cameras(', '', $json);
$json = str_replace(');', '', $json);

// Give it to me now
header('Content-Type: application/json');
echo $json;

?>
